import React, { useState } from 'react';
import BookFlix_logo_cropped from '../assets/BookFlix_logo_cropped.png';
import { useNavigate } from 'react-router-dom';

const baseUrl = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";


function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignup = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Signup failed.");
      }

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage(error.message);
    }
  };

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
        <form className="signBars" onSubmit={handleSignup}>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
          {errorMessage ? <p style={{ color: "#ffb6c1", margin: 0 }}>{errorMessage}</p> : null}
          <button className="login-btn" type="submit">Create Account</button>
        </form>
      </div>
    </div>
  );
}


export default Signup;
