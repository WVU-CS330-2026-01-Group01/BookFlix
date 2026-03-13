const express = require("express");
const fs = require("fs");
const path = require("path");

const PAIRS_FILE = path.resolve(__dirname, "../../data/pair_data.json");

const TMDB_GENRES = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western", 10759: "Action & Adventure",
  10762: "Kids", 10763: "News", 10764: "Reality", 10765: "Sci-Fi & Fantasy",
  10766: "Soap", 10767: "Talk", 10768: "War & Politics"
};

function createPairsRouter() {
  const router = express.Router();

  router.post("/save", async (request, response) => {
    try {
      const { movie, book } = request.body;
      const key = `${movie.id}_${book.id}`;

      // Read existing pairs
      const raw = fs.readFileSync(PAIRS_FILE, "utf-8");
      const pairs = JSON.parse(raw);

      // Add new pair
      pairs[key] = {
        user: "placeholder_user", // change this after implementing login!!!!
        score: 0,
        movie: {
          id: movie.id,
          title: movie.title ?? movie.name,
          poster_path: movie.poster_path,
          release_date: movie.release_date ?? movie.first_air_date,
          overview: movie.overview,
          popularity: movie.popularity,
          genre: (movie.genre_ids ?? []).map(id => TMDB_GENRES[id]).filter(Boolean), 
          type: movie.media_type,
        },
        book: {
          id: book.id,
          title: book.volumeInfo?.title,
          thumbnail: book.volumeInfo?.imageLinks?.thumbnail,
          publishedDate: book.volumeInfo?.publishedDate,
          description: book.volumeInfo?.description,
          ratings: book.volumeInfo?.averageRating,
          categories: book.volumeInfo?.categories,
          pagecount: book.volumeInfo?.pageCount,
        },
      };

      fs.writeFileSync(PAIRS_FILE, JSON.stringify(pairs, null, 2));
      response.json({ ok: true, key });
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  });

  router.get("/all", (request, response) => {
    try {
      const raw = fs.readFileSync(PAIRS_FILE, "utf-8");
      response.json(JSON.parse(raw));
    } catch {
      response.json({});
    }
  });

  return router;
}

module.exports = { createPairsRouter };