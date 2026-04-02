import React from "react";
import cam from '../assets/cam.png';
import alaina from '../assets/alaina.png';
import BookFlix_logo_cropped from '../assets/BookFlix_logo_cropped.png';
import { useNavigate } from 'react-router-dom';

function User() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <div className="navbar">
        <button className="logo" onClick={() => navigate("/")}>
          <img src={BookFlix_logo_cropped} alt="BookFlix Logo"
          style={{ width: '154px', height: '23px'}}></img>
        </button>
      </div>

        <h1>User Profile Page</h1>
        
        <div className="user-grid">
            <div className="profile-pic"> 
                <img src={alaina} alt="alaina"></img>
            </div>

            <div className="username">Username</div>

            <div className="bio">
              <div style={{ color: 'var(--medium-purple)' }}>Bio</div>
              <div className="bio-text" contentEditable suppressContentEditableWarning={true} onFocus={(e) => {
                if (e.currentTarget.innerText === "Click here to edit your bio") { e.currentTarget.innerText = "";}}} 
                onBlur={(e) => { if (e.currentTarget.innerText.trim() === "") {e.currentTarget.innerText = "Click here to edit your bio";}}}>
                Click here to edit your bio
              </div>
            </div>

            <div className="favorites">Favorite Series</div>

            <div className="latest">Latest Updates</div>
        </div>

    </div>
  );
}

export default User;