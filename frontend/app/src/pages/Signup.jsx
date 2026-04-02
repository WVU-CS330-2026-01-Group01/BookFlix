import React, { useState } from 'react';
import cam from '../assets/cam.png';
import BookFlix_logo_cropped from '../assets/BookFlix_logo_cropped.png';
import { useNavigate } from 'react-router-dom';

const baseUrl ="http://localhost:3000";


function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      const response = await fetch(`${baseUrl}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (data.ok) {
        alert("Signup successful!");
        navigate("/login");
      } else {
        alert("Signup failed: " + data.error);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("An error occurred during signup. Please try again." + error.message);
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

      <h1>Signup Page</h1>
      <div className="logBox">
        <div className="signBars">
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="text" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="text" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <button className="login-btn" onClick={handleSignup}>Create Account</button>
        </div>

      </div>
    </div>
  );
}


export default Signup;