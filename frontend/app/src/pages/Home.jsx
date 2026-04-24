import React from 'react';
import BookFlix_logo_cropped from '../assets/BookFlix_logo_cropped_bg_removed.png';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const baseUrl = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";
const pics = import.meta.glob('../assets/profile_pics/*.png', { eager: true });
const profilePicSources = Object.values(pics).map(pic => pic.default);

function rankPairs(pair) {
  const score = Number(pair.score ?? 0);
  const movieRating = Number(pair.avg_movie_rating ?? 0);
  const bookRating = Number(pair.avg_book_rating ?? 0);
  const commentCount = Number(pair.comment_count ?? 0);

  // formula for ranking pairs - change weights later maybe?
  let result = 0;
  if (score < 0){
    result -= Math.abs(score) * 10; // downvotes should decrease rank more than upvotes increase it
  } 
  result +=movieRating + bookRating + commentCount * 0.5;

  console.log(`Ranking for movie: ${pair.movie.title}, inputs: score=${score}, movieRating=${movieRating}, bookRating=${bookRating}, commentCount=${commentCount}, result=${result}`);
  return result;
}

function Home({ authenticated, authUser, onLogout }) {
  const pfp_index = authUser?.pfp_index ?? 0;
  const navigate = useNavigate();

  const [pairs, setPairs] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(40);

  useEffect(() => {
    fetch(`${baseUrl}/api/pairs/all`)
      .then(r => r.json())
      .then(data => setPairs(data))
      .catch(err => console.error('Error fetching pairs:', err));
  }, []);
<<<<<<< HEAD
    //filters the pairs by genre and title
    const filteredPairs = Object.entries(pairs).filter(([key, pair]) => { 
      const query = searchQuery.toLowerCase();
      const movieGenres = (pair.movie.genre ?? []).join(' ').toLowerCase();
      const bookGenres = (pair.book.categories ?? []).join(' ').toLowerCase();
      return (
        pair.movie.title.toLowerCase().includes(query) ||
        pair.book.title.toLowerCase().includes(query) ||
        movieGenres.includes(query) ||    
        bookGenres.includes(query) 
=======

    const filteredPairs = Object.entries(pairs).filter(([key, pair]) => {
    const query = searchQuery.toLowerCase();
    const movieGenres = (pair.movie.genre ?? []).join(' ').toLowerCase();
    const bookGenres = (pair.book.categories ?? []).join(' ').toLowerCase();
    return (
      pair.movie.title.toLowerCase().includes(query) ||
      pair.book.title.toLowerCase().includes(query) ||
      movieGenres.includes(query) ||    
      bookGenres.includes(query)         
>>>>>>> feature/jaj00032-new
    );
  })
  .sort(([, a], [, b]) => rankPairs(b) - rankPairs(a)); // sort pairs by rank
  

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
              <button className="temp-user-btn" onClick={() => navigate("/user")} style={{ background: 'none'}}>
                <img src={profilePicSources[pfp_index]} alt="Profile" className="profile-pic" style={{ width: '40px', height: '40px', objectFit:'cover' }}></img>
              </button>
              <button className="log-btn" onClick={onLogout}>
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 25 25" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="log-btn" onClick={() => navigate("/signup")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                Sign Up
              </button>
              <button className="log-btn" onClick={() => navigate("/login")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 25 25" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Login
              </button>
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
            <h1 className="home-toolbar-title">Discover the perfect</h1>
            <h1 className="home-toolbar-title">book & film pairs</h1>
            <p className="home-toolbar-subtitle">Browse book and film pairs, or make a new one.</p>
          </div>
        </div>

        <div className="content-area">
          <div className="content-area-glow" aria-hidden="true" />
          <div className="row">
            <div className="row-header">
              <h2>Trending</h2>

              <button
                className="home-add-pair-button"
                onClick={() => navigate("/pair")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Create Pair
              </button>
            </div>
              <div className="card-row">
              {filteredPairs.slice(0, visibleCount).map(([key, pair]) => (
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
            {visibleCount < filteredPairs.length && (
              <button
                className="load-more-btn"
                onClick={() => setVisibleCount(visibleCount + 20)}
              >
                Load More
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
