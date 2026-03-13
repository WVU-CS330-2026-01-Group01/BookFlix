import React from "react";
import cam from '../assets/cam.png';
import alaina from '../assets/alaina.png';
import { useNavigate } from 'react-router-dom';

function User() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <div className="navbar">
        <button className="logo" onClick={() => navigate("/")}>
          BookFlix
          <img src={cam} alt="cameron" style={{ width: '50px', height: '50px', marginLeft: '10px' }}></img>
        </button>
      </div>

        <h1>User Profile Page</h1>
        
        <div className="user-grid">
            <div className="profile-pic"> 
                <img src={alaina} alt="alaina"></img>
            </div>

            <div className="username">Username</div>

            <div className="bio">
                <div className="bio-title">Bio</div>
                <div className="bio-text" contentEditable="true">Click here to edit your bio</div>
            </div>

            <div className="favorites">Favorite Series</div>

            <div className="latest">Latest Updates</div>
        </div>

    </div>
  );
}

export default User;