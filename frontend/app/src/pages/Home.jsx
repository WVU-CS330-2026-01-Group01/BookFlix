import React from 'react';
import BookFlix_logo_cropped from '../assets/BookFlix_logo_cropped.png';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const baseUrl = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

function Home({ authenticated, authUser, onLogout }) {
  const navigate = useNavigate();

  const [pairs, setPairs] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`${baseUrl}/api/pairs/all`)
      .then(r => r.json())
      .then(data => setPairs(data))
      .catch(err => console.error('Error fetching pairs:', err));
  }, []);

    const filteredPairs = Object.entries(pairs).filter(([key, pair]) => {
    const query = searchQuery.toLowerCase();
    return (
      pair.movie.title.toLowerCase().includes(query) ||
      pair.book.title.toLowerCase().includes(query)
    );
  });

  return (
    <div className="page">
      <div className="navbar">
        <button className="logo" onClick={() => navigate("/")}>
          <img
            src={BookFlix_logo_cropped}
            alt="BookFlix Logo"
            style={{ width: '154px', height: '23px' }}
          ></img>
        </button>
        <div className="right-buttons">
          {authenticated ? (
            <>
              <button className="temp-user-btn" onClick={() => navigate("/user")}>
                {authUser?.username ?? "Profile"}
              </button>
              <button className="login-btn" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="temp-user-btn" onClick={() => navigate("/signup")}>Sign Up</button>
              <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
            </>
          )}
        </div>
      </div>

      <div className="main">
        <div className="search-section">
          <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
        </div>

        <div className="home-toolbar">
          <div>
            <h1 className="home-toolbar-title">Discover Pairs</h1>
            <p className="home-toolbar-subtitle">Browse book and film pairs, or make a new one.</p>
          </div>
          <button className="home-add-pair-button" onClick={() => navigate("/pair")}>Create Pair</button>
        </div>

        <div className="content-area">
          <div className="row">
            <h2>Trending</h2>
            <div className="card-row">
              {filteredPairs.map(([key, pair]) => (
                <button className="card" onClick={() => navigate("/BookMovie", { state: { pair: { ...pair, id: pair.id ?? key } } })} key={key}>
                  <img
                    src={`https://image.tmdb.org/t/p/w500${pair.movie.poster_path}`}
                    alt={pair.movie.title}
                    style={{ height: '200px', borderRadius: '6px 0px 0px 6px' }}
                  />
                  <div className="card-info">
                    <p style={{ color: 'white', fontSize: '13px', margin: '2px 0', opacity: '1' }}>{pair.movie.title}</p>
                    {/* <p style={{ color: '#d3c7e6', fontSize: '12px', margin: '6px 0 0' }}>Score: {pair.score ?? 0}</p> */}
                  </div>
                  <img
                    src={pair.book.thumbnail}
                    alt={pair.book.title}
                    style={{ height: '200px', borderRadius: "0px 6px 6px 0px" }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* <div className="row">
            <h2>Recommendations</h2>
            <div className="card-row">
              <div className="card">book/movie</div>
              <div className="card">book/movie</div>
              <div className="card">book/movie</div>
              <div className="card">book/movie</div>
              <div className="card">book/movie</div>
            </div>
          </div>


          <div className="row">
            <h2>Discover</h2>
            <div className="card-row">
              <div className="card">book/movie</div>
              <div className="card">book/movie</div>
              <div className="card">book/movie</div>
              <div className="card">book/movie</div>
              <div className="card">book/movie</div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default Home;
