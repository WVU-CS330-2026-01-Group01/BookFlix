import React from "react";
import cam from '../assets/cam.png';
import { useNavigate } from 'react-router-dom';

function Pair() {
  const navigate = useNavigate();
  return (
    <div className="logPage">
      <div className="navbar">
        <button className="logo" onClick={() => navigate("/")}>
          BookFlix
          <img src={cam} alt="cameron" style={{ width: '50px', height: '50px', marginLeft: '10px' }}></img>
        </button>
      </div>

      <h1>add-pair</h1>
      <div className="pairContainer">
        <div className="pairBox">
          <input className="pair-input" type="text" placeholder="Movie/Show Title..." />
        </div>
        <h3 style={{ margin: '0 20px', color: 'white' }}>+</h3>
        <div className="pairBox">
          <input className="pair-input" type="text" placeholder="Book Title..." />
        </div>
      </div>
    </div>
  );
}

export default Pair;

