import React, { useState, useEffect } from "react";
import cam from '../assets/cam.png';
import { useNavigate } from 'react-router-dom';

const baseUrl = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

function Pair() {
  const navigate = useNavigate();

  const [movieQuery, setMovieQuery] = useState("");
  const [movieResults, setMovieResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isSearchingMovie, setIsSearchingMovie] = useState(false);

  const [bookQuery, setBookQuery] = useState("");
  const [bookResults, setBookResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isSearchingBook, setIsSearchingBook] = useState(false);

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
    if (!bookQuery.trim() || bookQuery.length < 3) { setBookResults([]); return; }
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
  try {
    const res = await fetch(`${baseUrl}/api/pairs/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movie: selectedMovie, book: selectedBook }),
    });
    const data = await res.json();
    if (data.ok) {
      alert(`Pair saved! (${data.key})`);
    }
  } catch (err) {
    console.error("Failed to save pair:", err);
  }
};

  return (
    <div className="logPage">
      <div className="navbar">
        <button className="logo" onClick={() => navigate("/")}>
          BookFlix
          <img src={cam} alt="cameron" style={{ width: '50px', height: '50px', marginLeft: '10px' }} />
        </button>
        <div className="right-buttons">
          <button className="temp-user-btn" onClick={() => navigate("/user")}>TEMPORARY Profile</button>
          <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
        </div>
      </div>

      <div>
        <h1 style={{textAlign: 'center'}}>Create a Movie-Book Pair</h1>
      </div>
      <div className="pairContainer">

        {/* Movie search box */}
        <div className="pairBox" style={{ position: 'relative', overflow: 'visible' }}>
          <input
            className="pair-input"
            type="text"
            placeholder="Movie/Show Title..."
            value={movieQuery}
            onChange={(e) => { setMovieQuery(e.target.value); setSelectedMovie(null); }}
          />

          {movieResults.length > 0 && !selectedMovie && (
            <ul style={{
              position: 'absolute', top: '52px', left: '5%', right: '5%',
              background: 'darkblue', border: '1px solid #444', borderRadius: '6px',
              listStyle: 'none', margin: 0, padding: '4px 0', zIndex: 100,
              maxHeight: '300px', overflowY: 'auto',
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
            <div style={{ padding: '10px', textAlign: 'center', color: 'white' }}>
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
        </div>

        <h3 style={{fontSize: '50px', margin: '0 20px', color: 'white' }}>+</h3>

        {/* Book search box */}
        <div className="pairBox" style={{ position: 'relative', overflow: 'visible' }}>
          <input
            className="pair-input"
            type="text"
            placeholder="Book Title..."
            value={bookQuery}
            onChange={(e) => { setBookQuery(e.target.value); setSelectedBook(null); }}
          />

          {bookResults.length > 0 && !selectedBook && (
            <ul style={{
              position: 'absolute', top: '52px', left: '5%', right: '5%',
              background: 'darkblue', border: '1px solid #444', borderRadius: '6px',
              listStyle: 'none', margin: 0, padding: '4px 0', zIndex: 100,
              maxHeight: '300px', overflowY: 'auto',
            }}>
              {bookResults.map((book) => (
                <li key={book.id} onClick={() => handleSelectBook(book)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', cursor: 'pointer', color: 'white', fontSize: '14px' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#333'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {book.volumeInfo?.imageLinks?.smallThumbnail && (
                    <img src={book.volumeInfo.imageLinks.smallThumbnail} alt={book.volumeInfo.title}
                      style={{ width: '36px', height: '54px', objectFit: 'cover', borderRadius: '3px' }} />
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
        </div>

      </div>

      {/*make new movie book pair button*/}
      {selectedBook && selectedMovie && (
        <button className ="add-pair-button" onClick={handleSavePair} >
          Post Pair!
        </button>
      )}
    </div>
  );
}

export default Pair;