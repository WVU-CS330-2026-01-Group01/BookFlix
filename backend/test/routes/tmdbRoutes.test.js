const assert = require("node:assert/strict");
const test = require("node:test");

const { createTmdbRouter } = require("../../src/routes/tmdbRoutes");
const { createAppWithRouter, requestJson } = require("../../test-helpers/http");

test("TMDB route index lists the public endpoints", async () => {
  const app = createAppWithRouter("/api/tmdb", createTmdbRouter({ tmdb: {} }));

  const response = await requestJson(app, "/api/tmdb/");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
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

test("TMDB search route defaults to movie and forwards query options", async () => {
  const calls = [];
  const tmdb = {
    async search(type, query, options) {
      calls.push({ type, query, options });
      return {
        results: [{ id: 1 }],
      };
    },
  };
  const app = createAppWithRouter("/api/tmdb", createTmdbRouter({ tmdb }));

  const response = await requestJson(app, "/api/tmdb/search?query=Batman&language=en-US&page=2");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    results: [{ id: 1 }],
  });
  assert.deepEqual(calls, [
    {
      type: "movie",
      query: "Batman",
      options: {
        language: "en-US",
        page: "2",
      },
    },
  ]);
});

test("TMDB details route defaults to movie and forwards options", async () => {
  const calls = [];
  const tmdb = {
    async getDetails(type, id, options) {
      calls.push({ type, id, options });
      return {
        id,
        media_type: type,
      };
    },
  };
  const app = createAppWithRouter("/api/tmdb", createTmdbRouter({ tmdb }));

  const response = await requestJson(app, "/api/tmdb/details?id=42&language=en-US");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    id: "42",
    media_type: "movie",
  });
  assert.deepEqual(calls, [
    {
      type: "movie",
      id: "42",
      options: {
        language: "en-US",
      },
    },
  ]);
});

test("TMDB resource route forwards type, id, resource, and extra params", async () => {
  const calls = [];
  const tmdb = {
    async getResource(type, id, resource, options) {
      calls.push({ type, id, resource, options });
      return {
        id,
        resource,
      };
    },
  };
  const app = createAppWithRouter("/api/tmdb", createTmdbRouter({ tmdb }));

  const response = await requestJson(
    app,
    "/api/tmdb/resource?type=tv&id=1399&resource=videos&language=en-US",
  );

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    id: "1399",
    resource: "videos",
  });
  assert.deepEqual(calls, [
    {
      type: "tv",
      id: "1399",
      resource: "videos",
      options: {
        language: "en-US",
      },
    },
  ]);
});

test("TMDB trending route defaults to movie/day and forwards extra params", async () => {
  const calls = [];
  const tmdb = {
    async getTrending(type, window, options) {
      calls.push({ type, window, options });
      return {
        results: [{ id: 99 }],
      };
    },
  };
  const app = createAppWithRouter("/api/tmdb", createTmdbRouter({ tmdb }));

  const response = await requestJson(app, "/api/tmdb/trending?page=3");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    results: [{ id: 99 }],
  });
  assert.deepEqual(calls, [
    {
      type: "movie",
      window: "day",
      options: {
        page: "3",
      },
    },
  ]);
});

test("TMDB discover route defaults to movie and forwards filters", async () => {
  const calls = [];
  const tmdb = {
    async discover(type, options) {
      calls.push({ type, options });
      return {
        page: 1,
      };
    },
  };
  const app = createAppWithRouter("/api/tmdb", createTmdbRouter({ tmdb }));

  const response = await requestJson(
    app,
    "/api/tmdb/discover?type=tv&with_genres=10765&sort_by=popularity.desc",
  );

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    page: 1,
  });
  assert.deepEqual(calls, [
    {
      type: "tv",
      options: {
        with_genres: "10765",
        sort_by: "popularity.desc",
      },
    },
  ]);
});

test("TMDB image-url route defaults to original size", async () => {
  const calls = [];
  const tmdb = {
    buildImageUrl(filePath, size) {
      calls.push({ filePath, size });
      return "https://image.tmdb.org/t/p/original/poster.jpg";
    },
  };
  const app = createAppWithRouter("/api/tmdb", createTmdbRouter({ tmdb }));

  const response = await requestJson(app, "/api/tmdb/image-url?filePath=/poster.jpg");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    url: "https://image.tmdb.org/t/p/original/poster.jpg",
  });
  assert.deepEqual(calls, [
    {
      filePath: "/poster.jpg",
      size: "original",
    },
  ]);
});

test("TMDB routes map thrown errors into JSON API responses", async () => {
  const tmdb = {
    async search() {
      const error = new Error("TMDB is unavailable");
      error.status = 503;
      error.tmdbCode = 9;
      error.tmdbMessage = "Service offline";
      throw error;
    },
  };
  const app = createAppWithRouter("/api/tmdb", createTmdbRouter({ tmdb }));

  const response = await requestJson(app, "/api/tmdb/search?query=Batman");

  assert.equal(response.status, 503);
  assert.deepEqual(response.body, {
    error: "TMDB is unavailable",
    status: 503,
    tmdbCode: 9,
    tmdbMessage: "Service offline",
  });
});
