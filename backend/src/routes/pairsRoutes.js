const express = require("express");
const { getPool } = require("../config/database");
const { authMiddleware } = require("../middleware/authMiddleware");

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
      const [rows] = await database().execute("SELECT * FROM pair_data.movie_book_pairs");

      // Reshape rows back into object format frontend expects
      const pairs = {};
      for (const row of rows) {
        pairs[row.id] = {
          id: row.id,
          user: row.user,
          score: row.score,
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

  router.post("/:id/vote", async (request, response) => {
    try {
      const { id } = request.params;
      const { direction } = request.body ?? {};

      if (!id) {
        return response.status(400).json({ error: "Pair id is required." });
      }

      if (direction !== "up" && direction !== "down") {
        return response.status(400).json({ error: "Vote direction must be 'up' or 'down'." });
      }

      const amount = direction === "up" ? 1 : -1;
      const [updateResult] = await database().execute(
        `UPDATE pair_data.movie_book_pairs
         SET score = score + ?
         WHERE id = ?`,
        [amount, id],
      );

      if (updateResult.affectedRows === 0) {
        return response.status(404).json({ error: "Pair not found." });
      }

      const [rows] = await database().execute(
        `SELECT score
         FROM pair_data.movie_book_pairs
         WHERE id = ?`,
        [id],
      );

      return response.json({
        ok: true,
        id,
        score: rows[0]?.score ?? null,
      });
    } catch (error) {
      console.error("DB error:", error);
      return response.status(500).json({ error: error.message });
    }
  });

  return router;
}

module.exports = { createPairsRouter };
