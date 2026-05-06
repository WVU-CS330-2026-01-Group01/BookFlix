const express = require("express");

const { createTmdbClient } = require("../services/tmdbClient");

function copyQueryWithout(query, ignoredKeys = []) {
  // Each route consumes its control parameters and forwards remaining filters
  // straight to TMDB through the client wrapper.
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
  // Preserve TMDB's status code/message alongside the app-level error string.
  const statusCode = error.status ?? 500;

  response.status(statusCode).json({
    error: error.message,
    status: statusCode,
    tmdbCode: error.tmdbCode ?? null,
    tmdbMessage: error.tmdbMessage ?? null,
  });
}

function createTmdbRouter(options = {}) {
  const router = express.Router();
  // Tests inject a fake client; production uses the token-backed TMDB wrapper.
  const tmdb = options.tmdb ?? createTmdbClient();

  router.get("/", (request, response) => {
    response.json({
      ok: true,
      routes: [
        "/api/tmdb/search",
        "/api/tmdb/details",
        "/api/tmdb/resource",
        "/api/tmdb/trending",
        "/api/tmdb/discover",
        "/api/tmdb/image-url",
      ],
    });
  });

  router.get("/search", async (request, response) => {
    try {
      const data = await tmdb.search(
        request.query.type ?? "movie",
        request.query.query,
        copyQueryWithout(request.query, ["type", "query"]),
      );

      response.json(data);
    } catch (error) {
      sendRouteError(response, error);
    }
  });

  router.get("/details", async (request, response) => {
    try {
      const data = await tmdb.getDetails(
        request.query.type ?? "movie",
        request.query.id,
        copyQueryWithout(request.query, ["type", "id"]),
      );

      response.json(data);
    } catch (error) {
      sendRouteError(response, error);
    }
  });

  router.get("/resource", async (request, response) => {
    try {
      const data = await tmdb.getResource(
        request.query.type ?? "movie",
        request.query.id,
        request.query.resource,
        copyQueryWithout(request.query, ["type", "id", "resource"]),
      );

      response.json(data);
    } catch (error) {
      sendRouteError(response, error);
    }
  });

  router.get("/trending", async (request, response) => {
    try {
      const data = await tmdb.getTrending(
        request.query.type ?? "movie",
        request.query.window ?? "day",
        copyQueryWithout(request.query, ["type", "window"]),
      );

      response.json(data);
    } catch (error) {
      sendRouteError(response, error);
    }
  });

  router.get("/discover", async (request, response) => {
    try {
      const data = await tmdb.discover(
        request.query.type ?? "movie",
        copyQueryWithout(request.query, ["type"]),
      );

      response.json(data);
    } catch (error) {
      sendRouteError(response, error);
    }
  });

  router.get("/image-url", (request, response) => {
    try {
      response.json({
        url: tmdb.buildImageUrl(request.query.filePath, request.query.size ?? "original"),
      });
    } catch (error) {
      sendRouteError(response, error);
    }
  });

  return router;
}

module.exports = {
  createTmdbRouter,
};
