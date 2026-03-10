import React from "react";
import cam from '../assets/cam.png';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  return (
    <div className="logPage">
      <div className="navbar">
        <button className="logo" onClick={() => navigate("/")}>
          BookFlix
          <img src={cam} alt="cameron" style={{ width: '50px', height: '50px', marginLeft: '10px' }}></img>
        </button>
      </div>

      <h1>Login Page</h1>
      <div className="logBox">content</div>
    </div>
  );
}

export default Login;