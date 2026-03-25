import React from "react";
import cam from '../assets/cam.png';
import BookFlix_logo_cropped from '../assets/BookFlix_logo_cropped.png';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <div className="navbar">
        <button className="logo" onClick={() => navigate("/")}>
          <img src={BookFlix_logo_cropped} alt="BookFlix Logo"
          style={{ width: '154px', height: '23px'}}></img>
        </button>
      </div>

      <h1>Login Page</h1>
      <div className="logBox">
        <div className="logBars">
          <input type="text" placeholder="Username" />
          <input type="text" placeholder="Password" />
          
          <button className="login-btn" onClick={() => navigate("/")}>Log In</button>
          <button type = "button" className="signup-text" onClick={() => navigate("/signup")}>Don't have an account? Sign up here</button>
        </div>

      </div>
    </div>
  );
}

export default Login;