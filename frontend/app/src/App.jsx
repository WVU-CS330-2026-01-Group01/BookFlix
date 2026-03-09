import React from 'react';
import cam from './assets/cam.png';

function App() {
  return (
    // <div style={{ textAlign: 'center', marginTop: '50px' }}>
    //   <h1>CS330 Project Baseline</h1>
    //   <p>Your Vite + React app is running correctly!</p>
    // </div>


    <div className="page">
      

      {/* Navbar */}
      <div className="navbar">
        <div className="logo">
          BookFlix
          <img src={cam} alt="cameron"
          style={{ width: '50px', height: '50px', marginLeft: '10px' }}></img>
        </div>
        <button className="login-btn">Login</button>
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

      </div>
    </div>

  );
}

export default App;
