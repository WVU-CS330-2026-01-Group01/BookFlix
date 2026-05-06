const express = require("express");
const { getPool } = require("../config/database");
const { authMiddleware, optionalAuth } = require("../middleware/authMiddleware");

// Store readable genre names with saved pairs so the home feed can search and
// render cards without making a second TMDB call for every result.
const TMDB_GENRES = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western", 10759: "Action & Adventure",
  10762: "Kids", 10763: "News", 10764: "Reality", 10765: "Sci-Fi & Fantasy",
  10766: "Soap", 10767: "Talk", 10768: "War & Politics"
};

function createPairsRouter(options = {}) {
  const router = express.Router();
  const database = options.getPool ?? getPool;

  router.post("/save", authMiddleware, async (request, response) => {
    try {
      const { movie, book } = request.body;

      if (!movie?.id || !book?.id) {
        return response.status(400).json({ error: "Movie and book are required." });
      }

      const key = `${movie.id}_${book.id}`;
      const genres = (movie.genre_ids ?? []).map(id => TMDB_GENRES[id]).filter(Boolean);

      // Pair rows are snapshots of the selected TMDB and Google Books records.
      // Updating an existing key refreshes display text without resetting votes.
      await database().execute(
        `INSERT INTO pair_data.movie_book_pairs (
          id, user, score,
          movie_id, movie_title, movie_poster_path, movie_release_date,
          movie_overview, movie_popularity, movie_genre, movie_type,
          book_id, book_title, book_thumbnail, book_publishedDate,
          book_description, book_ratings, book_categories, book_pagecount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          movie_title = VALUES(movie_title),
          score = VALUES(score)`,
        [
          key,
          request.user.username,
          0,
          String(movie.id),
          movie.title ?? movie.name ?? null,
          movie.poster_path ?? null,
          movie.release_date ?? movie.first_air_date ?? null,
          movie.overview ?? null,
          movie.popularity ?? null,
          JSON.stringify(genres),
          movie.media_type ?? null,
          String(book.id),
          book.volumeInfo?.title ?? null,
          book.volumeInfo?.imageLinks?.thumbnail ?? null,
          book.volumeInfo?.publishedDate ?? null,
          book.volumeInfo?.description ?? null,
          book.volumeInfo?.averageRating ?? null,
          JSON.stringify(book.volumeInfo?.categories ?? []),
          book.volumeInfo?.pageCount ?? null,
        ]
      );

      response.json({ ok: true, key });
    } catch (error) {
      console.error("DB error:", error);
      response.status(500).json({ error: error.message });
    }
  });

  router.get("/all", async (request, response) => {
    try {
      // The feed needs aggregate vote, rating, and comment data alongside each
      // pair so the frontend can rank cards without extra per-card requests.
      const [rows] = await database().execute(`
        SELECT p.*,
          COALESCE((SELECT SUM(vote) FROM pair_data.pair_votes WHERE pair_id = p.id), 0) AS score,
          COALESCE((SELECT COUNT(*) FROM pair_data.comments WHERE pair_id = p.id), 0) AS comment_count,
          COALESCE((SELECT AVG(NULLIF(movie_rating, 0)) FROM pair_data.pair_votes WHERE pair_id = p.id), 0) AS avg_movie_rating,
          COALESCE((SELECT AVG(NULLIF(book_rating, 0)) FROM pair_data.pair_votes WHERE pair_id = p.id), 0) AS avg_book_rating
        FROM pair_data.movie_book_pairs p
      `);

      // Reshape SQL columns back into the nested pair object used across React
      // navigation state and detail views.
      const pairs = {};
      for (const row of rows) {
        pairs[row.id] = {
          id: row.id,
          user: row.user,
          score: row.score,
          commentcount: row.comment_count,
          avg_movie_rating: row.avg_movie_rating,
          avg_book_rating: row.avg_book_rating,
          movie: {
            id: row.movie_id,
            title: row.movie_title,
            poster_path: row.movie_poster_path,
            release_date: row.movie_release_date,
            overview: row.movie_overview,
            popularity: row.movie_popularity,
            genre: row.movie_genre,       // already parsed by MySQL2
            type: row.movie_type,
          },
          book: {
            id: row.book_id,
            title: row.book_title,
            thumbnail: row.book_thumbnail,
            publishedDate: row.book_publishedDate,
            description: row.book_description,
            ratings: row.book_ratings,
            categories: row.book_categories, // already parsed by MySQL2
            pagecount: row.book_pagecount,
          },
        };
      }

      response.json(pairs);
    } catch (error) {
      console.error("DB error:", error);
      response.status(500).json({ error: error.message });
    }
  });
  
  router.post("/:pairKey/vote", authMiddleware, async (req, res) => {
    const { pairKey } = req.params;
    const { vote } = req.body;
    const userId = req.user.username;

    try {
      // A repeat click sends vote=0, which removes the user's vote row instead
      // of storing a neutral vote that would still count as activity.
      if (vote === 0) {
        await database().query(
          `DELETE FROM pair_data.pair_votes WHERE user_name = ? AND pair_id = ?`,
          [userId, pairKey]
        );
      } else {
        await database().query(
          `INSERT INTO pair_data.pair_votes (user_name, pair_id, vote) VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE vote = VALUES(vote)`,
          [userId, pairKey, vote]
        );
      }

      // Return both the new aggregate score and the caller's selected vote so
      // the detail page can update immediately after a button click.
      const [[{ score }]] = await database().query(
        `SELECT COALESCE(SUM(vote), 0) AS score FROM pair_data.pair_votes WHERE pair_id = ?`,
        [pairKey]
      );

      const [[userRow]] = await database().query(
        `SELECT vote FROM pair_data.pair_votes WHERE user_name = ? AND pair_id = ?`,
        [userId, pairKey]
      );

      res.json({ ok: true, score, userVote: userRow?.vote ?? null });
    } catch (error) {
      console.error("Vote error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/:pairKey/score", optionalAuth, async (req, res) => {
    const { pairKey } = req.params;
    const userId = req.user?.username ?? "";

    try {
      // Anonymous users can see public aggregates; logged-in users also receive
      // their own vote, ratings, and bookmark state for this pair.
      const [[{ score }]] = await database().query(
        `SELECT COALESCE(SUM(vote), 0) AS score FROM pair_data.pair_votes WHERE pair_id = ?`,
        [pairKey]
      );

      const [[userRow]] = await database().query(
        `SELECT vote, book_rating, movie_rating, bookmarked FROM pair_data.pair_votes WHERE user_name = ? AND pair_id = ?`,
        [userId, pairKey]
      );

      // Zero means "not rated" in pair_votes, so averages ignore those values.
      const [[avgRow]] = await database().query(
        `SELECT AVG(NULLIF(book_rating, 0)) AS avgBook, AVG(NULLIF(movie_rating, 0)) AS avgMovie
         FROM pair_data.pair_votes WHERE pair_id = ?`,
        [pairKey]
      );

      res.json({
        ok: true,
        score,
        userVote: userRow?.vote ?? null,
        bookRating: userRow?.book_rating ?? 0,
        movieRating: userRow?.movie_rating ?? 0,
        bookmarked: userRow?.bookmarked ?? false,
        avgBookRating: avgRow?.avgBook ? parseFloat(Number(avgRow.avgBook).toFixed(1)) : null,
        avgMovieRating: avgRow?.avgMovie ? parseFloat(Number(avgRow.avgMovie).toFixed(1)) : null,
      });
    } catch (error) {
      console.error("Score fetch error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/:pairKey/rate", authMiddleware, async (req, res) => {
    const { pairKey } = req.params;
    const { bookRating, movieRating } = req.body;
    const userId = req.user.username;

    try {
      // Ratings share the pair_votes row with votes and bookmarks so all
      // caller-specific pair state stays keyed by user_name + pair_id.
      await database().query(
        `INSERT INTO pair_data.pair_votes (user_name, pair_id, vote, book_rating, movie_rating)
         VALUES (?, ?, 0, ?, ?)
         ON DUPLICATE KEY UPDATE book_rating = VALUES(book_rating), movie_rating = VALUES(movie_rating)`,
        [userId, pairKey, bookRating ?? 0, movieRating ?? 0]
      );

      const [[avgRow]] = await database().query(
        `SELECT AVG(NULLIF(book_rating, 0)) AS avgBook, AVG(NULLIF(movie_rating, 0)) AS avgMovie
         FROM pair_data.pair_votes WHERE pair_id = ?`,
        [pairKey]
      );

      res.json({
        ok: true,
        avgBookRating: avgRow?.avgBook ? parseFloat(Number(avgRow.avgBook).toFixed(1)) : null,
        avgMovieRating: avgRow?.avgMovie ? parseFloat(Number(avgRow.avgMovie).toFixed(1)) : null,
      });
    } catch (error) {
      console.error("Rate error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Comments are public to read, but creation and ownership changes require the
  // same cookie session used by votes and profile edits.
  router.get("/:pairKey/comments", async (req, res) => {
    const { pairKey } = req.params;
    
    try {
      const [rows] = await database().query(
        `SELECT c.id, c.username, c.body, c.created_at, COALESCE(u.pfp_index, 0) AS pfp_index
         FROM pair_data.comments c
         LEFT JOIN authdb.users u ON u.username = c.username
         WHERE c.pair_id = ?
         ORDER BY c.created_at DESC`,
        [pairKey]
      );
      res.json({ ok: true, comments: rows });
    } catch (error) {
      console.error("Comments fetch error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/:pairKey/comments", authMiddleware, async (req, res) => {
    const { pairKey } = req.params;
    const { body } = req.body;

    if (!body.trim()) {
      return res.status(400).json({ error: "Comment cannot be empty." });
    }
    
    try {
      // Return the inserted comment in UI-ready shape so the frontend can prepend
      // it without refetching the full thread.
      const [result] = await database().query(
        'INSERT INTO pair_data.comments (pair_id, username, body) VALUES (?, ?, ?)',
        [pairKey, req.user.username, body.trim()]
      );
      res.json({
        ok: true,
        comment: {
          id: result.insertId,
          username: req.user.username,
          pfp_index: req.user.pfp_index ?? 0,
          body: body.trim(),
          created_at: new Date()
        },
      });
    } catch (error) {
      console.error("Comment post error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Editing enforces ownership in SQL so clients cannot modify another user's
  // comment by guessing its id.
  router.put("/:pairKey/comments/:commentId", authMiddleware, async (req, res) => {
    const { commentId } = req.params;
    const { body } = req.body;

    if (!body?.trim()) {
      return res.status(400).json({ error: "Comment cannot be empty." });
    }

    try {
      const [result] = await database().query(
        'UPDATE pair_data.comments SET body = ? WHERE id = ? AND username = ?',
        [body.trim(), commentId, req.user.username]
      );
      if (result.affectedRows === 0) {
        return res.status(403).json({ error: "You can only edit your own comments." });
      }
      res.json({ ok: true });
    } catch (error) {
      console.error("Comment edit error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.delete("/:pairKey/comments/:commentId", authMiddleware, async (req, res) => {
    const { commentId } = req.params;

    try {
      // Deleting uses the same author check as editing for a consistent
      // authorization rule across comment mutations.
      const [result] = await database().query(
        'DELETE FROM pair_data.comments WHERE id = ? AND username = ?',
        [commentId, req.user.username]
      );
      if (result.affectedRows === 0) {
        return res.status(403).json({ error: "You can only delete your own comments." });
      }
      res.json({ ok: true });
    } catch (error) {
      console.error("Comment delete error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/:pairKey/bookmark", authMiddleware, async (req, res) => {
    const { pairKey } = req.params;

    try {
      // Bookmarking creates the pair_votes row when the user has not voted or
      // rated yet, preserving one state record per user/pair.
      const [result] = await database().query(
        `INSERT INTO pair_data.pair_votes (user_name, pair_id, vote, bookmarked) 
        VALUES (?, ?, 0, 1)
        ON DUPLICATE KEY UPDATE bookmarked = VALUES(bookmarked)`,
        [req.user.username, pairKey]
      );
      res.json({ ok: true, bookmarked: true });
    } catch (error) {
      console.error("Bookmark error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  router.delete("/:pairKey/bookmark", authMiddleware, async (req, res) => {
    const { pairKey } = req.params;

    try {
      // Keep the row for existing votes/ratings and only clear the bookmark bit.
      const [result] = await database().query(
        `UPDATE pair_data.pair_votes SET bookmarked = 0 WHERE user_name = ? AND pair_id = ?`,
        [req.user.username, pairKey]
      );
      res.json({ ok: true, bookmarked: false });
    } catch (error) {
      console.error("Bookmark remove error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

module.exports = { createPairsRouter };
