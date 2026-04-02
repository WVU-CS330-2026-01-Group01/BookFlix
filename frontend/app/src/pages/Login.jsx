import React, { useState } from "react";
import BookFlix_logo_cropped from '../assets/BookFlix_logo_cropped.png';
import { useNavigate } from 'react-router-dom';

const baseUrl = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

function Login({ setAuthenticated, setAuthUser }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Login failed.");
      }

      setAuthenticated(true);
      setAuthUser(data.user ?? null);
      navigate("/", { replace: true });
    } catch (error) {
      setAuthenticated(false);
      setAuthUser(null);
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

      <h1>Login Page</h1>
      <div className="logBox">
        <form className="logBars" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
          {errorMessage ? <p style={{ color: "#ffb6c1", margin: 0 }}>{errorMessage}</p> : null}
          <button className="login-btn" type="submit">Log In</button>
          <button type="button" className="signup-text" onClick={() => navigate("/signup")}>Don't have an account? Sign up here</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
