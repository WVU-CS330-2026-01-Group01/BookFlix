import React, { useState } from "react";
import BookFlix_logo_cropped from '../assets/BookFlix_logo_cropped.png';
import { useNavigate } from 'react-router-dom';

const baseUrl = "http://localhost:3000";
const pics = import.meta.glob('../assets/profile_pics/*.png', { eager: true });
const profilePicSources = Object.values(pics).map(pic => pic.default);



function User({ authUser, onLogout, setAuthUser }) {
  const navigate = useNavigate();
  const [pfp_index, setPfpIndex] = useState(authUser?.pfp_index ?? 0);
  console.log("authUser:", authUser, profilePicSources.length);

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
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 25 25" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
              <div className="bio-text" contentEditable suppressContentEditableWarning={true} onFocus={(e) => {
                if (e.currentTarget.innerText === "Click here to edit your bio") { e.currentTarget.innerText = "";}}} 
                onBlur={(e) => { if (e.currentTarget.innerText.trim() === "") {e.currentTarget.innerText = "Click here to edit your bio";}}}>
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
