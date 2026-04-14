import React, { useState, useEffect } from 'react';
import BookFlix_logo_cropped from '../assets/BookFlix_logo_cropped.png';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Rating from "../components/Rating";

const baseUrl = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";
const pics = import.meta.glob('../assets/profile_pics/*.png', { eager: true });
const profilePicSources = Object.values(pics).map(pic => pic.default);


function BookMovie({ authenticated, authUser, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { pair } = location.state || {};;
  const [score, setScore] = useState(pair?.score ?? 0);
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState("");
  const [userVote, setUserVote] = useState(null); // null, 1 (upvote), or -1 (downvote)

  useEffect(() => {
  if (!pair?.id) return;

  fetch(`${baseUrl}/api/pairs/${encodeURIComponent(pair.id)}/score`)
    .then(r => r.json())
    .then(data => {
      setScore(data.score);
      if (authUser?.username) setUserVote(data.userVote);
    })
    .catch(err => console.error("Failed to fetch score:", err));
  }, [pair?.id, authUser?.username]);

  const handleVote = async (direction) => {
  if (isVoting) return;

  if (!authenticated) {
    alert("You must be logged in to vote.");
    return;
  }

  const vote = direction === "up" ? 1 : -1;

  const previousScore = score;
  const previousUserVote = userVote;

  setIsVoting(true);
  setVoteError("");

  try {
    const response = await fetch(`${baseUrl}/api/pairs/${encodeURIComponent(pair.id)}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vote: vote === userVote ? 0 : vote,
        userId: authUser?.username
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Failed to update vote.");

    setScore(data.score);
    setUserVote(data.userVote); // 👈 this is what controls the fill
  } catch (error) {
    setScore(previousScore);
    setUserVote(previousUserVote);
    setVoteError(error.message);
  } finally {
    setIsVoting(false);
  }
};

  return (
    // <div style={{ textAlign: 'center', marginTop: '50px' }}>
    //   <h1>CS330 Project Baseline</h1>
    //   <p>Your Vite + React app is running correctly!</p>
    // </div>


    <div className="page">


      {/* Navbar */}
      <div className="navbar">
        <button className="logo" onClick={() => navigate("/")}>
          <img src={BookFlix_logo_cropped} alt="BookFlix Logo"
          style={{ width: '154px', height: '23px'}}></img>
        </button>
          <div className="right-buttons">
            {authenticated ? (
              <>
                <button className="temp-user-btn" onClick={() => navigate("/user") } style={{ background: 'none'}}>
                  <img src={profilePicSources[authUser?.pfp_index ?? 0]} alt="Profile" className="profile-pic" style={{ width: '40px', height: '40px', objectFit:'cover' }}></img>
                </button>
                <button className="login-btn" onClick={onLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="temp-user-btn" onClick={() => navigate("/signup")}>Sign Up</button>
                <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
              </>
            )}
          </div>
      </div>

      {/* Main content wrapper */}
      <div style={{ color: 'white', padding: '30px' }}>


        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
          gap: '24px',
        }}>

          {/* Movie side */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            padding: '20px 40px',
            maxWidth: '600px',
          }}>
            <div style={{ width: '100%' }}>
              <img
                src={`https://image.tmdb.org/t/p/w500${pair.movie.poster_path}`}
                alt={pair.movie.title}
                style={{ height: '400px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', display: 'block', margin: '0 auto' }}
              />
              <h2 style={{ marginTop: '20px', textAlign: 'center' }}>{pair.movie.title}</h2>
              <p style={{ color: '#aaa', textAlign: 'center' }}>{pair.movie.release_date?.slice(0, 4)}</p>
              {pair.movie.genre?.length > 0 && (
                <p style={{ color: '#ccc', textAlign: 'center', fontSize: '14px' }}>
                  {pair.movie.genre.join(", ")}
                </p>
              )}
              <p style={{ color: '#ddd', textAlign: 'left', fontSize: '14px', marginTop: '15px', lineHeight: '1.6' }}>
                {pair.movie.overview}
              </p>
            </div>
            <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '30px', width: '100%' }}>
              <h3>Rate the Movie</h3>
              <Rating />
            </div>
          </div>

          {/* Divider */}
          <div style={{
            width: '2px',
            background: 'rgba(255,255,255,0.2)',
            alignSelf: 'stretch',
            borderRadius: '2px',
          }} />

          {/* Book side */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            padding: '20px 40px',
            maxWidth: '600px',
          }}>
            <div style={{ width: '100%' }}>
              <img
                src={pair.book.thumbnail}
                alt={pair.book.title}
                style={{ height: '400px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', display: 'block', margin: '0 auto' }}
              />
              <h2 style={{ marginTop: '20px', textAlign: 'center' }}>{pair.book.title}</h2>
              <p style={{ color: '#aaa', textAlign: 'center' }}>{pair.book.publishedDate?.slice(0, 4)}</p>
              {pair.book.categories?.length > 0 && (
                <p style={{ color: '#ccc', textAlign: 'center', fontSize: '14px' }}>
                  {pair.book.categories.join(", ")}
                </p>
              )}
              <p style={{ color: '#ddd', textAlign: 'left', fontSize: '14px', marginTop: '15px', lineHeight: '1.6' }}>
                {pair.book.description}
              </p>
            </div>
            <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '30px', width: '100%' }}>
              <h3>Rate the Book</h3>
              <Rating />
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', marginTop: '30px' }}>
          <span style={{fontSize: '8pt', color: 'gray'}}>
            Posted by {pair.user}.
          </span>
        </div>


      {/*comments section*/}
      <div className="bio" style={{width: '80%', margin: '20px auto', padding: '20px', background: '#222', borderRadius: '10px'}}>
        <div className="bio-title">Comments</div>
        <div className="bio-text" contentEditable suppressContentEditableWarning={true} onFocus={(e) => {
          if (e.currentTarget.innerText === "Add comment...") { e.currentTarget.innerText = "";}}} 
          onBlur={(e) => { if (e.currentTarget.innerText.trim() === "") {e.currentTarget.innerText = "Add comment...";}}}>
          Add comment...
        </div>
      </div>

      {/*pair vote*/}
      <div className="pair-score-panel">
        <div className="pair-score-label"> Is this Pair Correct?
          <div className="pair-vote-actions">
            <button
              className={`pair-vote-button ${userVote === 1 ? "selected-up" : ""}`}
              type="button"
              onClick={() => handleVote("up")}
              disabled={isVoting}
            >
              <svg viewBox="0 0 24 24" className="vote-icon">
                <path d="M12 2l-7 8h4v12h6V10h4z" />
              </svg>
            </button>

            <div className="pair-score-value">{score}</div>

            <button
              className={`pair-vote-button pair-vote-button-negative ${
               userVote === -1 ? "selected-down" : ""
              }`}
              type="button"
              onClick={() => handleVote("down")}
              disabled={isVoting}
            >
              <svg viewBox="0 0 24 24" className="vote-icon">
                  <path d="M12 22l7-8h-4V2h-6v12H5z" />
              </svg>
            </button>
          </div>
        </div>
        </div>
        {voteError ? <p className="pair-vote-error">{voteError}</p> : null}
    </div>
  </div>

  );
} 

export default BookMovie;
