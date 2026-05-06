const express = require("express");
const { getPool } = require("../config/database");
const { authMiddleware } = require("../middleware/authMiddleware");

function createUserRouter() {
  const router = express.Router();

  // Private profile endpoints always use the cookie identity rather than a
  // username supplied by the client.
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
      // Avatar choice is stored as an index into the bundled profile image list.
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
      // The profile page renders bookmarks with the same nested pair shape used
      // by the home feed and detail page navigation state.
      const bookmarks = await fetchBookmarksFor(request.user.username);
      response.json({ ok: true, bookmarks });
    } catch (error) {
      console.error("DB error:", error);
      response.status(500).json({ error: error.message });
    }
  });

  // Authenticated users can view another user's public fields, but writes still
  // go through the private /bio and /pfp endpoints above.
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
  // Bookmark rows live in pair_votes, while display metadata lives in the saved
  // pair snapshot table.
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
