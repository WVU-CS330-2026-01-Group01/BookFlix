import React from 'react';
import BookFlix_logo_cropped from '../assets/BookFlix_logo_cropped.png';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Rating from "../components/Rating";


function BookMovie() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pair } = location.state || {};;

    if (!pair) {
    return (
      <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>
        No pair selected. <button onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  return (
    // <div style={{ textAlign: 'center', marginTop: '50px' }}>
    //   <h1>CS330 Project Baseline</h1>
    //   <p>Your Vite + React app is running correctly!</p>
    // </div>


    <div className="page">


      {/* Navbar */}
      <div className="navbar">
        <button className="logo" onClick={() => navigate("/")}>
          <img src={BookFlix_logo_cropped} alt="BookFlix Logo"
          style={{ width: '154px', height: '23px'}}></img>
        </button>
          <div className="right-buttons">
            <button className="temp-user-btn" onClick={() => navigate("/user")}>TEMPORARY Profile</button>
            <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
          </div>
      </div>

      {/* Main content wrapper */}
      <div style={{ color: 'white', padding: '30px' }}>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
          gap: '24px',
        }}>

          {/* Movie side */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            padding: '20px 40px',
            maxWidth: '600px',
          }}>
            <div style={{ width: '100%' }}>
              <img
                src={`https://image.tmdb.org/t/p/w500${pair.movie.poster_path}`}
                alt={pair.movie.title}
                style={{ height: '400px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', display: 'block', margin: '0 auto' }}
              />
              <h2 style={{ marginTop: '20px', textAlign: 'center' }}>{pair.movie.title}</h2>
              <p style={{ color: '#aaa', textAlign: 'center' }}>{pair.movie.release_date?.slice(0, 4)}</p>
              {pair.movie.genre?.length > 0 && (
                <p style={{ color: '#ccc', textAlign: 'center', fontSize: '14px' }}>
                  {pair.movie.genre.join(", ")}
                </p>
              )}
              <p style={{ color: '#ddd', textAlign: 'left', fontSize: '14px', marginTop: '15px', lineHeight: '1.6' }}>
                {pair.movie.overview}
              </p>
            </div>
            <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '30px', width: '100%' }}>
              <h3>Rate the Movie</h3>
              <Rating />
            </div>
          </div>

          {/* Divider */}
          <div style={{
            width: '2px',
            background: 'rgba(255,255,255,0.2)',
            alignSelf: 'stretch',
            borderRadius: '2px',
          }} />

          {/* Book side */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            padding: '20px 40px',
            maxWidth: '600px',
          }}>
            <div style={{ width: '100%' }}>
              <img
                src={pair.book.thumbnail}
                alt={pair.book.title}
                style={{ height: '400px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', display: 'block', margin: '0 auto' }}
              />
              <h2 style={{ marginTop: '20px', textAlign: 'center' }}>{pair.book.title}</h2>
              <p style={{ color: '#aaa', textAlign: 'center' }}>{pair.book.publishedDate?.slice(0, 4)}</p>
              {pair.book.categories?.length > 0 && (
                <p style={{ color: '#ccc', textAlign: 'center', fontSize: '14px' }}>
                  {pair.book.categories.join(", ")}
                </p>
              )}
              <p style={{ color: '#ddd', textAlign: 'left', fontSize: '14px', marginTop: '15px', lineHeight: '1.6' }}>
                {pair.book.description}
              </p>
            </div>
            <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '30px', width: '100%' }}>
              <h3>Rate the Book</h3>
              <Rating />
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', marginTop: '30px' }}>
          <span style={{fontSize: '8pt', color: 'gray'}}>
            Posted by {pair.user}.
          </span>
        </div>


      {/*comments section*/}
      <div className="bio" style={{width: '80%', margin: '20px auto', padding: '20px', background: '#222', borderRadius: '10px'}}>
                <div className="bio-title">Comments</div>
                <div className="bio-text" contentEditable="true">Add comment...</div>
      </div>
    </div>
  </div>

  );
} 

export default BookMovie;
