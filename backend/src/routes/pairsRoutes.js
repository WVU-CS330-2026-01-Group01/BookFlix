const express = require("express");
const fs = require("fs");
const path = require("path");

const PAIRS_FILE = path.resolve(__dirname, "../../data/pair_data.json");

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
        },
        book: {
          id: book.id,
          title: book.volumeInfo?.title,
          thumbnail: book.volumeInfo?.imageLinks?.thumbnail,
          publishedDate: book.volumeInfo?.publishedDate,
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