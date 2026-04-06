import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Pair from "./pages/pair";
import User from "./pages/User";
import BookMovie from "./pages/BookMovie";

const baseUrl = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

function ProtectedRoute({ authenticated, checkingAuth, children }) {
  if (checkingAuth) {
    return <div className="page" style={{ color: "white", padding: "40px" }}>Checking session...</div>;
  }

  var shown = false;

  useEffect(() => {
    if (!checkingAuth && !authenticated && !shown) {
      alert("You must be logged in to access this page.");
      shown = true;
    }
  }, [authenticated, checkingAuth]);

  if (!authenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      try {
        const response = await fetch(`${baseUrl}/auth/test`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          setAuthenticated(false);
          setAuthUser(null);
          return;
        }

        const data = await response.json();
        setAuthenticated(true);
        setAuthUser(data.user ?? null);
      } catch {
        setAuthenticated(false);
        setAuthUser(null);
      } finally {
        setCheckingAuth(false);
      }
    }

    void verifyAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${baseUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setAuthenticated(false);
      setAuthUser(null);
    }
  };

  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              authenticated={authenticated}
              authUser={authUser}
              checkingAuth={checkingAuth}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/login"
          element={
            authenticated
              ? <Navigate to="/" replace />
              : <Login setAuthenticated={setAuthenticated} setAuthUser={setAuthUser} />
          }
        />
        <Route
          path="/signup"
          element={authenticated ? <Navigate to="/" replace /> : <Signup />}
        />
        <Route
          path="/pair"
          element={
            <ProtectedRoute authenticated={authenticated} checkingAuth={checkingAuth}>
              <Pair authUser={authUser} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute authenticated={authenticated} checkingAuth={checkingAuth}>
              <User authUser={authUser} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/BookMovie"
          element={
            <BookMovie
              authenticated={authenticated}
              authUser={authUser}
              onLogout={handleLogout}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
