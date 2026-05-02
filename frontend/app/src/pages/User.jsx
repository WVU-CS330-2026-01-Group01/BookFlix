import React, { useState, useEffect, useRef } from "react";
import BookFlix_logo_cropped from '../assets/BookFlix_logo_cropped_bg_removed.png';
import { useNavigate, useParams } from 'react-router-dom';

const baseUrl = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";
const pics = import.meta.glob('../assets/profile_pics/*.png', { eager: true });
const profilePicSources = Object.values(pics).map(pic => pic.default);



function User({ authUser, onLogout, setAuthUser }) {
  const navigate = useNavigate();
  const { username: paramUsername } = useParams();
  const isSelf = !paramUsername || paramUsername === authUser?.username;
  const displayUsername = isSelf ? (authUser?.username ?? "Unknown user") : paramUsername;

  const [otherPfpIndex, setOtherPfpIndex] = useState(0);
  const pfp_index = isSelf ? (authUser?.pfp_index ?? 0) : otherPfpIndex;
  const [bio, setBio] = useState("");
  const bioRef = useRef(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (isSelf) {
      fetch(`${baseUrl}/api/users/bio`, { credentials: "include" })
        .then(r => r.json())
        .then(data => {
          setBio(data.bio ?? "");
          if (bioRef.current) bioRef.current.innerText = data.bio || "Click here to edit your bio";
        })
        .catch(err => console.error("Failed to load bio:", err));

      fetch(`${baseUrl}/api/users/bookmarks`, { credentials: "include" })
        .then(r => r.json())
        .then(data => setBookmarks(data.bookmarks ?? []))
        .catch(err => console.error("Failed to load bookmarks:", err));
    } else {
      fetch(`${baseUrl}/api/users/${encodeURIComponent(paramUsername)}/profile`, { credentials: "include" })
        .then(async r => {
          if (r.status === 404) { setNotFound(true); return null; }
          setNotFound(false);
          return r.json();
        })
        .then(data => {
          if (!data) return;
          setBio(data.bio ?? "");
          setOtherPfpIndex(data.pfp_index ?? 0);
          setBookmarks(data.bookmarks ?? []);
        })
        .catch(err => console.error("Failed to load profile:", err));
    }
  }, [isSelf, paramUsername]);

  const handleSaveBio = async (e) => {
    const newBio = e.currentTarget.innerText.trim();
    if (newBio === "Click here to edit your bio") return;
    if (newBio === bio) return;
    if (newBio.length > 500) { alert("Bio must be 500 characters or less."); return; }
    setBio(newBio);
    try {
      await fetch(`${baseUrl}/api/users/bio`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: newBio }),
      });
    } catch (err) {
      console.error("Failed to save bio:", err);
    }
  };

  const handleCyclePfp = async () => {
    const nextIndex = (pfp_index + 1) % profilePicSources.length;
    setAuthUser(prev => ({ ...prev, pfp_index: nextIndex }));

    try {
      await fetch(`${baseUrl}/api/users/pfp`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pfp_index: nextIndex }),
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };

  return (
    <div className="page">
      <div className="navbar">
        <button className="logo" onClick={() => navigate("/")}>
          <img src={BookFlix_logo_cropped} alt="BookFlix Logo"
          style={{ width: '154px', height: '23px'}}></img>
        </button>
        <div className="right-buttons">
          
          <button className="log-btn" onClick={onLogout}>
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 25 25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
        </div>
      </div>

        <h1>{isSelf ? "User Profile Page" : `${displayUsername}'s Profile`}</h1>

        {notFound ? (
          <p style={{ textAlign: 'center', color: '#aaa' }}>User not found.</p>
        ) : (
        <div className="user-grid">
            <div className="profile-pic">
                <img src={profilePicSources[pfp_index]} alt="Profile"></img>
            </div>
            {isSelf && (
              <button onClick={handleCyclePfp} className="cycle_pfp_btn">
                Next Profile Picture
              </button>
            )}

            <div className="username">{displayUsername}</div>

            <div className="bio">
              <div style={{ color: 'var(--medium-purple)' }}>Bio</div>
              {isSelf ? (
                <div className="bio-text" ref={bioRef} contentEditable suppressContentEditableWarning={true} onFocus={(e) => {
                  if (e.currentTarget.innerText === "Click here to edit your bio") { e.currentTarget.innerText = "";}}}
                  onBlur={(e) => { if (e.currentTarget.innerText.trim() === "") {e.currentTarget.innerText = "Click here to edit your bio";} handleSaveBio(e); }}>
                  Click here to edit your bio
                </div>
              ) : (
                <div className="bio-text">{bio || <span style={{ color: '#aaa' }}>No bio yet.</span>}</div>
              )}
            </div>

            <div className="bookmarks">
              <div style={{ color: 'var(--medium-purple)', marginBottom: '10px', fontWeight: 'bold' }}>Bookmarks</div>
              {bookmarks.length === 0 && <p style={{ color: '#aaa', fontSize: '14px' }}>No bookmarks yet.</p>}
              {bookmarks.map(pair => (
                <button key={pair.id} className="card"
                  onClick={() => navigate("/BookMovie", { state: { pair } })}
                  style={{ width: '100%', height: '60px', marginBottom: '8px', justifyContent: 'flex-start' }}
                >
                  <img src={`https://image.tmdb.org/t/p/w92${pair.movie.poster_path}`}
                    style={{ height: '60px', borderRadius: '4px 0 0 4px' }} />
                  <span style={{ color: 'white', fontSize: '13px', padding: '0 10px' }}>
                    {pair.movie.title} + {pair.book.title}
                  </span>
                </button>
              ))}
            </div>

        </div>
        )}

    </div>
  );
}

export default User;
