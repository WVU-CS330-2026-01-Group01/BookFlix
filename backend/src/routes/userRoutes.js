const express = require("express");
const { getPool } = require("../config/database");
const { authMiddleware } = require("../middleware/authMiddleware");

function createUserRouter() {
  const router = express.Router();

  // get and update user bio (stored in authdb.users.bio, VARCHAR 500)
  router.get("/bio", authMiddleware, async (request, response) => {
    try {
      const [rows] = await getPool().execute(
        'SELECT bio FROM authdb.users WHERE username = ?',
        [request.user.username]
      );
      response.json({ ok: true, bio: rows[0]?.bio ?? "" });
    } catch (error) {
      console.error("DB error:", error);
      response.status(500).json({ error: error.message });
    }
  });

  router.post("/bio", authMiddleware, async (request, response) => {
    try {
      await getPool().execute(
        'UPDATE authdb.users SET bio = ? WHERE username = ?',
        [request.body.bio ?? "", request.user.username]
      );
      response.json({ ok: true });
    } catch (error) {
      console.error("DB error:", error);
      response.status(500).json({ error: error.message });
    }
  });

  router.post("/pfp", authMiddleware, async (request, response) => {
    try { 
      await getPool().execute(
        'UPDATE authdb.users SET pfp_index = ? WHERE username = ?',
        [request.body.pfp_index, request.user.username]
       );
      response.json({ ok: true });
    } catch (error) {
      console.error("DB error:", error);
      response.status(500).json({ error: error.message });
    }
  });

  router.get("/bookmarks", authMiddleware, async (request, response) => {
    try {
      const bookmarks = await fetchBookmarksFor(request.user.username);
      response.json({ ok: true, bookmarks });
    } catch (error) {
      console.error("DB error:", error);
      response.status(500).json({ error: error.message });
    }
  });

  // Public profile view: anyone authenticated can fetch another user's
  // public-facing fields. Writes still go through the cookie-only
  // /bio and /pfp endpoints — never through this read path.
  router.get("/:username/profile", authMiddleware, async (request, response) => {
    try {
      const { username } = request.params;
      const [rows] = await getPool().execute(
        'SELECT username, pfp_index, bio FROM authdb.users WHERE username = ? LIMIT 1',
        [username]
      );
      const user = rows[0];
      if (!user) {
        return response.status(404).json({ error: "User not found." });
      }
      const bookmarks = await fetchBookmarksFor(user.username);
      response.json({
        ok: true,
        username: user.username,
        pfp_index: user.pfp_index ?? 0,
        bio: user.bio ?? "",
        bookmarks,
      });
    } catch (error) {
      console.error("DB error:", error);
      response.status(500).json({ error: error.message });
    }
  });

  return router;
}

async function fetchBookmarksFor(username) {
  const [rows] = await getPool().execute(
    `SELECT p.*
    FROM pair_data.movie_book_pairs p
    JOIN pair_data.pair_votes pv ON pv.pair_id = p.id
    WHERE pv.user_name = ? AND pv.bookmarked = 1
    ORDER BY pv.movie_rating DESC, pv.book_rating DESC, p.id DESC`,
    [username]
  );
  return rows.map(row => ({
    id: row.id,
    user: row.user,
    score: row.score,
    movie: {
      id: row.movie_id,
      title: row.movie_title,
      poster_path: row.movie_poster_path,
      release_date: row.movie_release_date,
      overview: row.movie_overview,
      genre: row.movie_genre,
      type: row.movie_type,
    },
    book: {
      id: row.book_id,
      title: row.book_title,
      thumbnail: row.book_thumbnail,
      publishedDate: row.book_publishedDate,
      description: row.book_description,
      categories: row.book_categories,
      pagecount: row.book_pagecount,
    },
  }));
}

module.exports = { createUserRouter };