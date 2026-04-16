import React, { useState, useEffect, useRef } from "react";
import BookFlix_logo_cropped from '../assets/BookFlix_logo_cropped_bg_removed.png';
import { useNavigate } from 'react-router-dom';

const baseUrl = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";
const pics = import.meta.glob('../assets/profile_pics/*.png', { eager: true });
const profilePicSources = Object.values(pics).map(pic => pic.default);



function User({ authUser, onLogout, setAuthUser }) {
  const navigate = useNavigate();
  const [pfp_index, setPfpIndex] = useState(authUser?.pfp_index ?? 0);
  const [bio, setBio] = useState("");
  const bioRef = useRef(null);

  useEffect(() => {
    fetch(`${baseUrl}/api/users/bio`, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        setBio(data.bio ?? "");
        if (bioRef.current) bioRef.current.innerText = data.bio || "Click here to edit your bio";
      })
      .catch(err => console.error("Failed to load bio:", err));
  }, []);

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
    setPfpIndex(nextIndex);

    try {
      await fetch(`${baseUrl}/api/users/pfp`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pfp_index: nextIndex }),
      });
      setAuthUser(prev => ({ ...prev, pfp_index: nextIndex }));
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

        <h1>User Profile Page</h1>
        
        <div className="user-grid">
            <div className="profile-pic"> 
                <img src={profilePicSources[pfp_index]} alt="Profile"></img>
            </div>
            <button onClick={handleCyclePfp} className="cycle_pfp_btn">
              Next Profile Picture
            </button>

            <div className="username">{authUser?.username ?? "Unknown user"}</div>

            <div className="bio">
              <div style={{ color: 'var(--medium-purple)' }}>Bio</div>
              <div className="bio-text" ref={bioRef} contentEditable suppressContentEditableWarning={true} onFocus={(e) => {
                if (e.currentTarget.innerText === "Click here to edit your bio") { e.currentTarget.innerText = "";}}}
                onBlur={(e) => { if (e.currentTarget.innerText.trim() === "") {e.currentTarget.innerText = "Click here to edit your bio";} handleSaveBio(e); }}>
                Click here to edit your bio
              </div>
            </div>

            <div className="favorites">Favorite Series</div>

            <div className="latest">
              Logged in as {authUser?.username ?? "Unknown user"}
            </div>
        </div>

    </div>
  );
}

export default User;
