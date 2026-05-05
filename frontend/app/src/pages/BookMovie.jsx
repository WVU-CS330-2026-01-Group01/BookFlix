import React, { useState, useEffect } from 'react';
import BookFlix_logo_cropped from '../assets/BookFlix_logo_cropped_bg_removed.png';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Rating from "../components/Rating";

const baseUrl = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";
const pics = import.meta.glob('../assets/profile_pics/*.png', { eager: true });
const profilePicSources = Object.values(pics).map(pic => pic.default);


function BookMovie({ authenticated, authUser, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { pair } = location.state || {};;
  const [score, setScore] = useState(pair?.score ?? 0);
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState("");
  const [userVote, setUserVote] = useState(null); // null, 1 (upvote), or -1 (downvote)
  const [movieRating, setMovieRating] = useState(0);
  const [bookRating, setBookRating] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState("");
  const [commentError, setCommentError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editBody, setEditBody] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [avgMovieRating, setAvgMovieRating] = useState(null);
  const [avgBookRating, setAvgBookRating] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pair?.id]);

  useEffect(() => {
    if (!pair?.id) return;

    const scoreUrl = `${baseUrl}/api/pairs/${encodeURIComponent(pair.id)}/score`;
    fetch(scoreUrl, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        setScore(data.score);
        setAvgMovieRating(data.avgMovieRating);
        setAvgBookRating(data.avgBookRating);
        if (authUser?.username) {
          setUserVote(data.userVote);
          setMovieRating(data.movieRating ?? 0);
          setBookRating(data.bookRating ?? 0);
          setBookmarked(data.bookmarked ?? false);
        }
      })
      .catch(err => console.error("Failed to fetch score:", err));
  }, [pair?.id, authUser?.username]);

  const handleVote = async (direction) => {
  if (isVoting) return;

  if (!authenticated) {
    alert("You must be logged in to vote.");
    return;
  }

  const vote = direction === "up" ? 1 : -1;

  const previousScore = score;
  const previousUserVote = userVote;

  setIsVoting(true);
  setVoteError("");

  try {
    const response = await fetch(`${baseUrl}/api/pairs/${encodeURIComponent(pair.id)}/vote`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vote: vote === userVote ? 0 : vote,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Failed to update vote.");

    setScore(data.score);
    setUserVote(data.userVote); // 👈 this is what controls the fill
  } catch (error) {
    setScore(previousScore);
    setUserVote(previousUserVote);
    setVoteError(error.message);
  } finally {
    setIsVoting(false);
  }
};

  const handleRate = async (type, rating) => {
    if (!authenticated) { alert("You must be logged in to rate."); return; }

    if (type === "movie") setMovieRating(rating);
    else setBookRating(rating);

    try {
      const res = await fetch(`${baseUrl}/api/pairs/${encodeURIComponent(pair.id)}/rate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieRating: type === "movie" ? rating : movieRating,
          bookRating: type === "book" ? rating : bookRating,
        }),
      });
      const data = await res.json();
      setAvgMovieRating(data.avgMovieRating);
      setAvgBookRating(data.avgBookRating);
    } catch (err) {
      console.error("Rating failed:", err);
    }
  };

  useEffect(() => {
    if (!pair?.id) return;

    fetch(`${baseUrl}/api/pairs/${encodeURIComponent(pair.id)}/comments`)
      .then(r => r.json())
      .then(data => setComments(data.comments))
      .catch(err => console.error("Failed to fetch comments:", err));
  }, [pair?.id]);

  const handlePostComment = async () => {
    if (!authUser) {
      alert("You must be logged in to comment.");
      return;
    }

    if (commentBody.trim() === "") {
      setCommentError("Comment cannot be empty.");
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/pairs/${encodeURIComponent(pair.id)}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: commentBody }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to post comment.");

      setComments(prev => [data.comment, ...prev]);
      setCommentBody("");
      setCommentError("");
    } catch (error) {
      setCommentError(error.message);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editBody.trim()) return;
    try {
      const res = await fetch(`${baseUrl}/api/pairs/${encodeURIComponent(pair.id)}/comments/${commentId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editBody }),
      });
      if (!res.ok) throw new Error("Failed to edit comment.");
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, body: editBody.trim() } : c));
      setEditingId(null);
      setEditBody("");
    } catch (err) {
      console.error("Edit failed:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(`${baseUrl}/api/pairs/${encodeURIComponent(pair.id)}/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete comment.");
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleBookmark = async () => {
    if (!authUser) {
      alert("You must be logged in to bookmark.");
      return;
    }
    setIsBookmarking(true);
    try {
      const method = bookmarked ? "DELETE" : "POST";
      const res = await fetch(`${baseUrl}/api/pairs/${encodeURIComponent(pair.id)}/bookmark`, {
        method,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update bookmark.");
      setBookmarked(data.bookmarked);
      console.log("Bookmark status updated:", data.bookmarked);
    } catch (err) {
      console.error("Bookmark failed:", err);
    } finally {
      setIsBookmarking(false); 
    }
  };
  

  return (



    <div className="page">


      {/* Navbar */}
      <div className="navbar">
        <button className="logo" onClick={() => navigate("/")}>
          <img src={BookFlix_logo_cropped} alt="BookFlix Logo"
          style={{ width: '154px', height: '23px'}}></img>
        </button>
          <div className="right-buttons">
            {authenticated ? (
              <>
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
              </>
            ) : (
              <>
                <button className="log-btn" onClick={() => navigate("/signup")}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                  Sign Up
                </button>
                <button className="log-btn" onClick={() => navigate("/login")}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 25 25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      <div style={{
         display: 'flex', justifyContent: 'flex-end', padding: '0 30px', margin: '10px' }}>
        <button
          onClick={handleBookmark}
          disabled={isBookmarking}
          className="log-btn"
        >
          {bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
        </button>
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
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <Rating value={movieRating} onChange={(r) => handleRate("movie", r)} />
                {avgMovieRating != null && (
                  <p style={{ color: '#aaa', fontSize: '13px', margin: '4px 0 0' }}>
                    Avg: {avgMovieRating} / 5
                  </p>
                )}
              </div>
              <h2 style={{ marginTop: '20px', textAlign: 'left' }}>{pair.movie.title}</h2>
              <p style={{ color: '#aaa', textAlign: 'left', fontSize: '14px', margin: '4px 0' }}>{pair.movie.release_date?.slice(0, 4)}</p>
              {pair.movie.genre?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {(Array.isArray(pair.movie.genre) ? pair.movie.genre : []).map((g) => (
                    <span key={g} style={{ background: 'rgba(154,112,214,0.2)', color: '#d3c7e6', padding: '3px 10px', borderRadius: '12px', fontSize: '12px' }}>{g}</span>
                  ))}
                </div>
              )}
              <p style={{ color: '#ddd', textAlign: 'left', fontSize: '14px', marginTop: '15px', lineHeight: '1.6' }}>
                {pair.movie.overview}
              </p>
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
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <Rating value={bookRating} onChange={(r) => handleRate("book", r)} />
                {avgBookRating != null && (
                  <p style={{ color: '#aaa', fontSize: '13px', margin: '4px 0 0' }}>
                    Avg: {avgBookRating} / 5
                  </p>
                )}
              </div>
              <h2 style={{ marginTop: '20px', textAlign: 'left' }}>{pair.book.title}</h2>
              <p style={{ color: '#aaa', textAlign: 'left', fontSize: '14px', margin: '4px 0' }}>{pair.book.publishedDate?.slice(0, 4)}</p>
              {pair.book.categories?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {(Array.isArray(pair.book.categories) ? pair.book.categories : []).map((c) => (
                    <span key={c} style={{ background: 'rgba(154,112,214,0.2)', color: '#d3c7e6', padding: '3px 10px', borderRadius: '12px', fontSize: '12px' }}>{c}</span>
                  ))}
                </div>
              )}
              <p style={{ color: '#ddd', textAlign: 'left', fontSize: '14px', marginTop: '15px', lineHeight: '1.6' }}>
                {pair.book.description}
              </p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', marginTop: '30px' }}>
          <span style={{fontSize: '8pt', color: 'gray'}}>
            Posted by {pair.user}.
          </span>
        </div>


      {/*comments section*/}
      <div className="bio" style={{ width: '80%', margin: '20px auto', padding: '20px', background: '#222', borderRadius: '10px' }}>
        <div style={{ color: 'var(--medium-purple)', marginBottom: '15px', fontWeight: 'bold' }}>Comments</div>

        {/* new comment input */}
        {commentError && <p style={{ color: '#ffb6c1', fontSize: '13px' }}>{commentError}</p>}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder={authUser ? "Add a comment..." : "Log in to comment"}
            value={commentBody}
            onChange={e => setCommentBody(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handlePostComment()}
            disabled={!authUser}
            style={{
              flex: 1, padding: '10px', borderRadius: '6px',
              border: '1px solid #444', background: '#111',
              color: 'white', fontSize: '14px'
            }}
          />
          <button
            onClick={handlePostComment}
            disabled={!authUser || !commentBody.trim()}
            className="add-pair-button"
            style={{ margin: 0 }}
          >
            Post
          </button>
        </div>

        {/* existing comments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {comments.length === 0 && (
            <p style={{ color: '#aaa', fontSize: '14px' }}>No comments yet. Be the first!</p>
          )}
          {comments.map(comment => (
            <div key={comment.id} style={{ background: '#333', borderRadius: '8px', padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <button
                    type="button"
                    onClick={() => navigate(`/user/${encodeURIComponent(comment.username)}`)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      color: 'var(--medium-purple)',
                      fontWeight: 'bold',
                      fontSize: '13px',
                    }}
                  >
                    {comment.username}
                  </button>
                  <span style={{ color: '#aaa', fontSize: '11px', marginLeft: '10px' }}>
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                {authUser?.username === comment.username && editingId !== comment.id && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => { setEditingId(comment.id); setEditBody(comment.body); }}
                      className="log-btn" style={{ padding: '4px 8px', fontSize: '12px' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button onClick={() => {
                        if (confirmDeleteId === comment.id) { handleDeleteComment(comment.id); setConfirmDeleteId(null); }
                        else { setConfirmDeleteId(comment.id); setTimeout(() => setConfirmDeleteId(prev => prev === comment.id ? null : prev), 2000); }
                      }}
                      className="log-btn" style={{ padding: '4px 8px', fontSize: '12px', background: confirmDeleteId === comment.id ? '#dc2626' : undefined }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              {editingId === comment.id ? (
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <input
                    type="text"
                    value={editBody}
                    onChange={e => setEditBody(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleEditComment(comment.id)}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '6px',
                      border: '1px solid #444', background: '#111',
                      color: 'white', fontSize: '14px'
                    }}
                  />
                  <button onClick={() => handleEditComment(comment.id)}
                    className="add-pair-button" style={{ margin: 0, fontSize: '13px', padding: '6px 12px' }}>
                    Save
                  </button>
                  <button onClick={() => { setEditingId(null); setEditBody(""); }}
                    style={{ background: 'none', border: '1px solid #666', color: '#aaa', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px' }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <p style={{ color: 'white', fontSize: '14px', margin: '6px 0 0' }}>{comment.body}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/*pair vote*/}
      <div className="pair-score-panel">
        <div className="pair-score-label"> Is this Pair Correct?
          <div className="pair-vote-actions">
            <button
              className={`pair-vote-button ${userVote === 1 ? "selected-up" : ""}`}
              type="button"
              onClick={() => handleVote("up")}
              disabled={isVoting}
            >
              <svg viewBox="0 0 24 24" className="vote-icon">
                <path d="M12 2l-7 8h4v12h6V10h4z" />
              </svg>
            </button>

            <div className="pair-score-value">{score}</div>

            <button
              className={`pair-vote-button pair-vote-button-negative ${
               userVote === -1 ? "selected-down" : ""
              }`}
              type="button"
              onClick={() => handleVote("down")}
              disabled={isVoting}
            >
              <svg viewBox="0 0 24 24" className="vote-icon">
                  <path d="M12 22l7-8h-4V2h-6v12H5z" />
              </svg>
            </button>
          </div>
        </div>
        </div>
        {voteError ? <p className="pair-vote-error">{voteError}</p> : null}
    </div>
  </div>

  );
} 

export default BookMovie;
