import React from 'react';
import cam from '../assets/cam.png';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  return (
    // <div style={{ textAlign: 'center', marginTop: '50px' }}>
    //   <h1>CS330 Project Baseline</h1>
    //   <p>Your Vite + React app is running correctly!</p>
    // </div>


    <div className="page">


      {/* Navbar */}
      <div className="navbar">
        <button className="logo">
          BookFlix
          <img src={cam} alt="cameron"
          style={{ width: '50px', height: '50px', marginLeft: '10px' }}></img>
        </button>
        <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
      </div>

      {/* Main content wrapper */}
      <div className="main">

        {/* Search Bar */}
        <div className="search-section">
          <input type="text" placeholder="Search..." />
        </div>

        {/* Content Area */}
        <div className="content-area">
          content
        </div>

        {/*make new movie book pair button*/}
        <button className ="add-pair-button" onClick={() => navigate("/pair")}>
          Add Movie-Book Pair
        </button>

      </div>
      
      
    </div>

  );
} 

export default Home;