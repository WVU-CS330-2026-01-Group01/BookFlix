const express = require("express");

const { createGoogleBooksClient } = require("../services/googleBooksClient");

function copyQueryWithout(query, ignoredKeys = []) {
  // Search/detail routes reserve a few keys for path intent and pass the rest
  // through to Google Books for filters such as projection and langRestrict.
  const ignored = new Set(ignoredKeys);
  const params = {};

  for (const [key, value] of Object.entries(query ?? {})) {
    if (!ignored.has(key) && value !== undefined && value !== null && value !== "") {
      params[key] = value;
    }
  }

  return params;
}

function sendRouteError(response, error) {
  // Service-layer errors already carry the right status and Google metadata.
  const statusCode = error.status ?? 500;

  response.status(statusCode).json({
    error: error.message,
    status: statusCode,
    googleBooksErrors: error.googleBooksErrors ?? null,
  });
}

function createGoogleBooksRouter(options = {}) {
  const router = express.Router();
  // Tests inject a fake client; production uses the real public API wrapper.
  const googleBooks = options.googleBooks ?? createGoogleBooksClient({
    apiKey: process.env.GOOGLE_BOOKS_API_KEY,
  });
  router.get("/", (request, response) => {
    response.json({
      ok: true,
      routes: ["/api/google-books/search", "/api/google-books/details"],
    });
  });

  router.get("/search", async (request, response) => {
    try {
      const data = await googleBooks.searchVolumes(
        request.query.query,
        copyQueryWithout(request.query, ["query"]),
      );

      response.json(data);
    } catch (error) {
      sendRouteError(response, error);
    }
  });

  router.get("/details", async (request, response) => {
    try {
      const data = await googleBooks.getVolume(
        request.query.id,
        copyQueryWithout(request.query, ["id"]),
      );

      response.json(data);
    } catch (error) {
      sendRouteError(response, error);
    }
  });

  return router;
}

module.exports = {
  createGoogleBooksRouter,
};
