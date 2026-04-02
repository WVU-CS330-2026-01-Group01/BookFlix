import React from "react";
import alaina from '../assets/alaina.png';
import BookFlix_logo_cropped from '../assets/BookFlix_logo_cropped.png';
import { useNavigate } from 'react-router-dom';

function User({ authUser, onLogout }) {
  const navigate = useNavigate();
  return (
    <div className="page">
      <div className="navbar">
        <button className="logo" onClick={() => navigate("/")}>
          <img src={BookFlix_logo_cropped} alt="BookFlix Logo"
          style={{ width: '154px', height: '23px'}}></img>
        </button>
        <div className="right-buttons">
          <button className="temp-user-btn" onClick={() => navigate("/")}>Home</button>
          <button className="login-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>

        <h1>User Profile Page</h1>
        
        <div className="user-grid">
            <div className="profile-pic"> 
                <img src={alaina} alt="alaina"></img>
            </div>

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
