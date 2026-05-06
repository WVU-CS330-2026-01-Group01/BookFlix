const assert = require("node:assert/strict");
const test = require("node:test");

const { createGoogleBooksRouter } = require("../../src/routes/googleBooksRoutes");
const { createAppWithRouter, requestJson } = require("../../test-helpers/http");

test("Google Books route index lists the public endpoints", async () => {
  const app = createAppWithRouter("/api/google-books", createGoogleBooksRouter({ googleBooks: {} }));

  const response = await requestJson(app, "/api/google-books/");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    ok: true,
    routes: ["/api/google-books/search", "/api/google-books/details"],
  });
});

test("Google Books search route forwards the query and passthrough options", async () => {
  // The fake client keeps this focused on Express query handling rather than the
  // Google Books service wrapper.
  const calls = [];
  const googleBooks = {
    async searchVolumes(query, options) {
      calls.push({ query, options });
      return {
        items: [{ id: "volume-1" }],
        totalItems: 1,
      };
    },
  };
  const app = createAppWithRouter("/api/google-books", createGoogleBooksRouter({ googleBooks }));

  const response = await requestJson(
    app,
    "/api/google-books/search?query=Dune&langRestrict=en&projection=lite&maxResults=5",
  );

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    items: [{ id: "volume-1" }],
    totalItems: 1,
  });
  assert.deepEqual(calls, [
    {
      query: "Dune",
      options: {
        langRestrict: "en",
        projection: "lite",
        maxResults: "5",
      },
    },
  ]);
});

test("Google Books details route forwards the volume id and passthrough options", async () => {
  const calls = [];
  const googleBooks = {
    async getVolume(id, options) {
      calls.push({ id, options });
      return {
        id,
        volumeInfo: {
          title: "Dune",
        },
      };
    },
  };
  const app = createAppWithRouter("/api/google-books", createGoogleBooksRouter({ googleBooks }));

  const response = await requestJson(
    app,
    "/api/google-books/details?id=zyTCAlFPjgYC&projection=lite&country=US",
  );

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    id: "zyTCAlFPjgYC",
    volumeInfo: {
      title: "Dune",
    },
  });
  assert.deepEqual(calls, [
    {
      id: "zyTCAlFPjgYC",
      options: {
        projection: "lite",
        country: "US",
      },
    },
  ]);
});

test("Google Books routes map thrown errors into JSON API responses", async () => {
  const googleBooks = {
    async searchVolumes() {
      const error = new Error("bad filter");
      error.status = 400;
      error.googleBooksErrors = [{ reason: "invalid" }];
      throw error;
    },
  };
  const app = createAppWithRouter("/api/google-books", createGoogleBooksRouter({ googleBooks }));

  const response = await requestJson(app, "/api/google-books/search?query=Dune");

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    error: "bad filter",
    status: 400,
    googleBooksErrors: [{ reason: "invalid" }],
  });
});
