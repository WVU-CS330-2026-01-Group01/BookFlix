import React, { useState } from "react";
import cam from '../assets/cam.png';
import BookFlix_logo_cropped from '../assets/BookFlix_logo_cropped.png';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';


const baseUrl ="http://localhost:3000";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const handleLogin = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.ok) {
        alert("Login successful! Welcome, " + username);
        setUser({ username: data.username });
        navigate("/");
      } else {
        alert("Login failed: " + data.error);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login. Please try again." + error.message);
    }
  }
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
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="text" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          
          <button className="login-btn" onClick={handleLogin}>Log In</button>
          <button type = "button" className="signup-text" onClick={() => navigate("/signup")}>Don't have an account? Sign up here</button>
        </div>

      </div>
    </div>
  );
}

export default Login;