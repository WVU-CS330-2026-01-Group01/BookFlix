import React, { useState, useEffect } from "react";
import BookFlix_logo_cropped from '../assets/BookFlix_logo_cropped.png';
import create_pair_book_icon from '../assets/create_pair_book_icon.png';
import create_pair_film_icon from '../assets/create_pair_film_icon.png';
import { useNavigate } from 'react-router-dom';

const baseUrl = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";
const pics = import.meta.glob('../assets/profile_pics/*.png', { eager: true });
const profilePicSources = Object.values(pics).map(pic => pic.default);

function Pair({ authUser, onLogout }) {
  const navigate = useNavigate();

  const [movieQuery, setMovieQuery] = useState("");
  const [movieResults, setMovieResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isSearchingMovie, setIsSearchingMovie] = useState(false);

  const [bookQuery, setBookQuery] = useState("");
  const [bookResults, setBookResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isSearchingBook, setIsSearchingBook] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [movieContainerHeight, setMovieContainerHeight] = useState("400px");
  const [bookContainerHeight, setBookContainerHeight] = useState("400px");

  // Movie search
  useEffect(() => {
    if (!movieQuery.trim()) { setMovieResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearchingMovie(true);
      try {
        const res = await fetch(
          `${baseUrl}/api/tmdb/search?type=multi&query=${encodeURIComponent(movieQuery)}&language=en-US`
        );
        const data = await res.json();
        setMovieResults(data.results?.slice(0, 6) ?? []);
      } catch (err) {
        console.error("Movie search failed:", err);
      } finally {
        setIsSearchingMovie(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [movieQuery]);

  // Book search
  useEffect(() => {
    if (!bookQuery.trim()) { setBookResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearchingBook(true);
      try {
        const res = await fetch(
          `${baseUrl}/api/google-books/search?query=${encodeURIComponent(bookQuery)}&langRestrict=en&maxResults=6`
        );
        const data = await res.json();
        setBookResults(data.items?.slice(0, 6) ?? []);
      } catch (err) {
        console.error("Book search failed:", err);
      } finally {
        setIsSearchingBook(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [bookQuery]);

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    setMovieQuery(movie.title ?? movie.name);
    setMovieResults([]);
  };

  const handleSelectBook = (book) => {
    setSelectedBook(book);
    setBookQuery(book.volumeInfo?.title ?? "");
    setBookResults([]);
  };

  const handleSavePair = async () => {
    setSaveError("");

    try {
      const res = await fetch(`${baseUrl}/api/pairs/save`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movie: selectedMovie, book: selectedBook }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          navigate("/login", { replace: true });
          return;
        }

        throw new Error(data.error ?? "Failed to save pair.");
      }

      alert(`Pair saved! (${data.key})`);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Failed to save pair:", err);
      setSaveError(err.message);
    }
  };


useEffect(() => {
  setMovieContainerHeight(selectedMovie ? "450px" : "400px");
}, [selectedMovie]);

useEffect(() => {
  setBookContainerHeight(selectedBook ? "450px" : "400px");
}, [selectedBook]);

  return (
    <div className="page">
      <div className="navbar">
        <button className="logo" onClick={() => navigate("/")}>
          <img src={BookFlix_logo_cropped} alt="BookFlix Logo"
          style={{ width: '154px', height: '23px'}}></img>
        </button>
        <div className="right-buttons">
          <button className="temp-user-btn" onClick={() => navigate("/user") } style={{ background: 'none'}}>
            <img src={profilePicSources[authUser?.pfp_index ?? 0]} alt="Profile" className="profile-pic" style={{ width: '40px', height: '40px', objectFit:'cover' }}></img>
          </button>
          <button className="log-btn" onClick={onLogout}>
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 25 25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
        </div>
      </div>









      {/* MEAT */}

      <div>
        <h1 style={{
          textAlign: 'center', 
          fontSize: '50px', 
          padding: '0px',
          marginBottom: '0px'
          }}>
            Create a New Movie/Book Pair
        </h1>
      </div>

      <div className="pairContainer">




        {/* Movie search box */}
        <div className="pairBox" 
          style={{ 
            position: 'relative', 
            overflow: 'visible',
            width: '100%',
            height: movieContainerHeight
            }}>

          <input
            className="pair-input"
            style={{
              margin: '30px'
            }}
            type="text"
            placeholder="Search for a title"
            value={movieQuery}
            onChange={(e) => { setMovieQuery(e.target.value); setSelectedMovie(null); }}
            
          />

          {movieResults.length > 0 && !selectedMovie && (
            <ul style={{
              position: 'absolute', 
              top: '74px', 
              left: '5%', 
              right: '5%',
              background: 'var(--dark-purple)', 
              border: '1px solid var(--medium-purple)', 
              borderRadius: '6px',
              listStyle: 'none', 
              margin: 0, 
              padding: '4px 0', 
              zIndex: 100,
              maxHeight: '300px', 
              overflowY: 'auto',
            }}>
              {movieResults.map((movie) => (
                <li key={movie.id} onClick={() => handleSelectMovie(movie)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', cursor: 'pointer', color: 'white', fontSize: '14px' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#333'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {movie.poster_path && (
                    <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt={movie.title ?? movie.name}
                      style={{ width: '36px', height: '54px', objectFit: 'cover', borderRadius: '3px' }} />
                  )}
                  <span>
                    {movie.title ?? movie.name}
                    {(movie.release_date ?? movie.first_air_date) && (
                      <span style={{ color: '#aaa', marginLeft: '6px' }}>
                        ({(movie.release_date ?? movie.first_air_date).slice(0, 4)})
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {isSearchingMovie && <p style={{ color: '#aaa', fontSize: '12px', margin: '4px 0 0' }}>Searching...</p>}

          {selectedMovie && (
            <div style={{ 
              padding: '10px', 
              textAlign: 'center', 
              color: 'white' }}>
              {selectedMovie.poster_path && (
                <img src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
                  alt={selectedMovie.title ?? selectedMovie.name}
                  style={{ height: '250px', borderRadius: '6px', marginTop: '10px' }} />
              )}
              <h3 style={{ fontSize: '16px', margin: '8px 0 4px' }}>{selectedMovie.title ?? selectedMovie.name}</h3>
              <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>
                {(selectedMovie.release_date ?? selectedMovie.first_air_date)?.slice(0, 4)}
              </p>
            </div>
          )}
 
          {!selectedMovie && (
            <>
            <img src={create_pair_film_icon}
            style={{
              width: "150px", 
              opacity: 0.5,
              paddingTop: '20px'
            }}
            >
            </img>
            <p 
              style={{opacity: 0.5}}
            >
              Movie/Show goes here...
            </p>
        </>
        )}
        </div>

        <h3 style={{
          fontSize: '150px', 
          margin: '0 20px', 
          color: 'var(--medium-purple)',
          marginLeft: '0px',
          marginRight: '0px'
          }}>
            +
        </h3>




        {/* Book search box */}
        <div className="pairBox" style={{ 
          position: 'relative', 
          overflow: 'visible',
          width: '100%',
          height: bookContainerHeight
          }}>
          <input
            className="pair-input"
            style={{margin: '30px'}}
            type="text"
            placeholder="Search for a title"
            value={bookQuery}
            onChange={(e) => { setBookQuery(e.target.value); setSelectedBook(null); }}
          />

          {bookResults.length > 0 && !selectedBook && (
            <ul style={{
              position: 'absolute', 
              top: '74px', 
              left: '5%', 
              right: '5%',
              background: 'var(--dark-purple)', 
              border: '1px solid var(--medium-purple)', 
              borderRadius: '6px',
              listStyle: 'none', 
              margin: 0, 
              padding: '4px 0', 
              zIndex: 100,
              maxHeight: '300px', 
              overflowY: 'auto',
            }}>
              {bookResults.map((book) => (
                <li key={book.id} onClick={() => handleSelectBook(book)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', cursor: 'pointer', color: 'white', fontSize: '14px' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#333'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {book.volumeInfo?.imageLinks?.smallThumbnail && (
                    <img src={book.volumeInfo.imageLinks.smallThumbnail} alt={book.volumeInfo.title}
                      style={{ 
                        width: '36px', 
                        height: '54px', 
                        objectFit: 'cover', 
                        borderRadius: '3px' }} />
                  )}
                  <span>
                    {book.volumeInfo?.title}
                    {book.volumeInfo?.publishedDate && (
                      <span style={{ color: '#aaa', marginLeft: '6px' }}>
                        ({book.volumeInfo.publishedDate.slice(0, 4)})
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {isSearchingBook && <p style={{ color: '#aaa', fontSize: '12px', margin: '4px 0 0' }}>Searching...</p>}

          {selectedBook && (
            <div style={{ padding: '10px', textAlign: 'center', color: 'white' }}>
              {selectedBook.volumeInfo?.imageLinks?.thumbnail && (
                <img src={selectedBook.volumeInfo.imageLinks.thumbnail} alt={selectedBook.volumeInfo.title}
                  style={{ height: '250px', borderRadius: '6px', marginTop: '10px' }} />
              )}
              <h3 style={{ fontSize: '16px', margin: '8px 0 4px' }}>{selectedBook.volumeInfo?.title}</h3>
              <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>
                {selectedBook.volumeInfo?.publishedDate?.slice(0, 4)}
              </p>
            </div>
          )}

        {!selectedBook && (
          <>
            <img src={create_pair_book_icon}
              style={{
                width: "150px", 
                opacity: 0.5,
                paddingTop: '20px'

              }}>

            </img>
            <p 
              style={{opacity: 0.5}}>Book goes here...
            </p>
          </>
        )}
        

        </div>
        
        

      </div>

      {/*make new movie book pair button*/}
      {selectedBook && selectedMovie && (
        <button 
        className ="add-pair-button" 
        onClick={handleSavePair} 
        style={{marginTop: '0px'}}>
          Post Pair!
        </button>
      )}
      {saveError ? <p style={{ color: "#ffb6c1", textAlign: "center" }}>{saveError}</p> : null}
    </div>
  );
}

export default Pair;
