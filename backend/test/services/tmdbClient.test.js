const assert = require("node:assert/strict");
const test = require("node:test");

const {
  TmdbApiError,
  TmdbInputError,
  createTmdbClient,
} = require("../../src/services/tmdbClient");
const { createFetchStub, jsonResponse, textResponse } = require("../../test-helpers/http");

function buildExpectedUrl(baseUrl, endpoint, params = {}) {
  const aliasMap = {
    appendToResponse: "append_to_response",
    includeImageLanguage: "include_image_language",
    sessionId: "session_id",
    externalSource: "external_source",
  };
  const url = new URL(endpoint.replace(/^\/+/, ""), `${baseUrl.replace(/\/+$/, "")}/`);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    const serialisedValue = Array.isArray(value) ? value.join(",") : String(value);
    url.searchParams.append(aliasMap[key] ?? key, serialisedValue);
  }

  return url.toString();
}

function assertUrlMatches(actualUrl, expectedUrl) {
  const actual = new URL(actualUrl);
  const expected = new URL(expectedUrl);

  assert.equal(`${actual.origin}${actual.pathname}`, `${expected.origin}${expected.pathname}`);
  assert.deepEqual(
    [...actual.searchParams.entries()].sort(),
    [...expected.searchParams.entries()].sort(),
  );
}

test("createTmdbClient rejects a missing token", () => {
  assert.throws(
    () => createTmdbClient({ token: "" }),
    /TMDB_TOKEN is missing/,
  );
});

test("createTmdbClient rejects a missing fetch implementation", () => {
  assert.throws(
    () => createTmdbClient({ token: "tmdb-token", fetchImpl: 0 }),
    /fetch is not available/,
  );
});

test("request adds the bearer token header and maps TMDB query aliases", async () => {
  const { calls, fetchImpl } = createFetchStub(() => jsonResponse(200, { ok: true }));
  const client = createTmdbClient({
    token: "tmdb-token",
    apiBaseUrl: "https://tmdb.example/api",
    fetchImpl,
  });

  const data = await client.request("/movie/550", {
    appendToResponse: ["videos", "images"],
    includeImageLanguage: ["en", "null"],
    sessionId: "session-123",
    externalSource: "imdb_id",
    page: 2,
  });

  assert.deepEqual(data, { ok: true });
  assert.equal(calls.length, 1);
  assert.equal(
    calls[0].url,
    buildExpectedUrl("https://tmdb.example/api", "/movie/550", {
      appendToResponse: ["videos", "images"],
      includeImageLanguage: ["en", "null"],
      sessionId: "session-123",
      externalSource: "imdb_id",
      page: 2,
    }),
  );
  assert.equal(calls[0].init.method, "GET");
  assert.equal(calls[0].init.headers.accept, "application/json");
  assert.equal(calls[0].init.headers.Authorization, "Bearer tmdb-token");
});

test("request wraps network failures in a TmdbApiError", async () => {
  const client = createTmdbClient({
    token: "tmdb-token",
    apiBaseUrl: "https://tmdb.example/api",
    fetchImpl: async () => {
      throw new Error("network down");
    },
  });

  await assert.rejects(
    () => client.request("/movie/550"),
    (error) => {
      assert.ok(error instanceof TmdbApiError);
      assert.equal(error.status, 0);
      assert.equal(error.message, "TMDB request failed before a response was received.");
      assert.equal(error.url, "https://tmdb.example/api/movie/550");
      assert.equal(error.cause.message, "network down");
      return true;
    },
  );
});

test("request exposes TMDB API metadata from JSON errors", async () => {
  const { fetchImpl } = createFetchStub(() =>
    jsonResponse(404, {
      success: false,
      status_code: 34,
      status_message: "The resource you requested could not be found.",
    }),
  );
  const client = createTmdbClient({
    token: "tmdb-token",
    apiBaseUrl: "https://tmdb.example/api",
    fetchImpl,
  });

  await assert.rejects(
    () => client.request("/movie/999"),
    (error) => {
      assert.ok(error instanceof TmdbApiError);
      assert.equal(error.status, 404);
      assert.equal(error.tmdbCode, 34);
      assert.equal(error.tmdbMessage, "The resource you requested could not be found.");
      assert.equal(error.url, "https://tmdb.example/api/movie/999");
      return true;
    },
  );
});

test("request falls back to an HTTP status message when the TMDB error body is not JSON", async () => {
  const { fetchImpl } = createFetchStub(() => textResponse(502, "bad gateway"));
  const client = createTmdbClient({
    token: "tmdb-token",
    apiBaseUrl: "https://tmdb.example/api",
    fetchImpl,
  });

  await assert.rejects(
    () => client.request("/movie/999"),
    (error) => {
      assert.ok(error instanceof TmdbApiError);
      assert.equal(error.status, 502);
      assert.equal(error.message, "TMDB request failed with HTTP 502.");
      assert.equal(error.body, null);
      return true;
    },
  );
});

test("buildImageUrl returns null for empty input and normalises leading slashes", () => {
  const client = createTmdbClient({
    token: "tmdb-token",
    imageBaseUrl: "https://images.example/path/",
    fetchImpl: async () => jsonResponse(200, {}),
  });

  assert.equal(client.buildImageUrl(null), null);
  assert.equal(client.buildImageUrl("/poster.jpg", "w500"), "https://images.example/path/w500/poster.jpg");
});

test("every exported TMDB client method hits the expected endpoint", async (t) => {
  const cases = [
    {
      name: "validateKey",
      invoke: (client) => client.validateKey(),
      path: "/authentication",
      query: {},
    },
    {
      name: "getConfiguration",
      invoke: (client) => client.getConfiguration(),
      path: "/configuration",
      query: {},
    },
    {
      name: "getCountries",
      invoke: (client) => client.getCountries(),
      path: "/configuration/countries",
      query: {},
    },
    {
      name: "getJobs",
      invoke: (client) => client.getJobs(),
      path: "/configuration/jobs",
      query: {},
    },
    {
      name: "getLanguages",
      invoke: (client) => client.getLanguages(),
      path: "/configuration/languages",
      query: {},
    },
    {
      name: "getPrimaryTranslations",
      invoke: (client) => client.getPrimaryTranslations(),
      path: "/configuration/primary_translations",
      query: {},
    },
    {
      name: "getTimezones",
      invoke: (client) => client.getTimezones(),
      path: "/configuration/timezones",
      query: {},
    },
    {
      name: "getTrending",
      invoke: (client) => client.getTrending("person", "week", { page: 3 }),
      path: "/trending/person/week",
      query: { page: 3 },
    },
    {
      name: "getList",
      invoke: (client) => client.getList("movie", "popular", { language: "en-US" }),
      path: "/movie/popular",
      query: { language: "en-US" },
    },
    {
      name: "search",
      invoke: (client) => client.search("tv", "Severance", { page: 2 }),
      path: "/search/tv",
      query: { query: "Severance", page: 2 },
    },
    {
      name: "discover",
      invoke: (client) => client.discover("movie", { with_genres: "878", sort_by: "popularity.desc" }),
      path: "/discover/movie",
      query: { with_genres: "878", sort_by: "popularity.desc" },
    },
    {
      name: "findByExternalId",
      invoke: (client) => client.findByExternalId("tt0133093/extra", "imdb_id", { language: "en-US" }),
      path: "/find/tt0133093%2Fextra",
      query: { externalSource: "imdb_id", language: "en-US" },
    },
    {
      name: "getDetails",
      invoke: (client) =>
        client.getDetails("movie", 550, {
          appendToResponse: ["videos", "images"],
          includeImageLanguage: ["en", "null"],
        }),
      path: "/movie/550",
      query: {
        appendToResponse: ["videos", "images"],
        includeImageLanguage: ["en", "null"],
      },
    },
    {
      name: "getResource",
      invoke: (client) => client.getResource("tv", 1399, "videos", { language: "en-US" }),
      path: "/tv/1399/videos",
      query: { language: "en-US" },
    },
    {
      name: "getGenres",
      invoke: (client) => client.getGenres("movie", { language: "en-US" }),
      path: "/genre/movie/list",
      query: { language: "en-US" },
    },
    {
      name: "getChangeList",
      invoke: (client) => client.getChangeList("person", { page: 4 }),
      path: "/person/changes",
      query: { page: 4 },
    },
    {
      name: "getItemChanges",
      invoke: (client) => client.getItemChanges("movie", 11, { start_date: "2024-01-01" }),
      path: "/movie/11/changes",
      query: { start_date: "2024-01-01" },
    },
    {
      name: "getCollectionDetails",
      invoke: (client) => client.getCollectionDetails(10, { language: "en-US" }),
      path: "/collection/10",
      query: { language: "en-US" },
    },
    {
      name: "getCompanyDetails",
      invoke: (client) => client.getCompanyDetails(420, { language: "en-US" }),
      path: "/company/420",
      query: { language: "en-US" },
    },
    {
      name: "getNetworkDetails",
      invoke: (client) => client.getNetworkDetails(49, { language: "en-US" }),
      path: "/network/49",
      query: { language: "en-US" },
    },
    {
      name: "getKeywordDetails",
      invoke: (client) => client.getKeywordDetails(1721, { language: "en-US" }),
      path: "/keyword/1721",
      query: { language: "en-US" },
    },
    {
      name: "getAccountDetails",
      invoke: (client) => client.getAccountDetails(5, "session-123"),
      path: "/account/5",
      query: { sessionId: "session-123" },
    },
    {
      name: "getTvSeasonDetails",
      invoke: (client) => client.getTvSeasonDetails(1399, 1, { language: "en-US" }),
      path: "/tv/1399/season/1",
      query: { language: "en-US" },
    },
    {
      name: "getTvEpisodeDetails",
      invoke: (client) => client.getTvEpisodeDetails(1399, 1, 1, { language: "en-US" }),
      path: "/tv/1399/season/1/episode/1",
      query: { language: "en-US" },
    },
  ];

  for (const testCase of cases) {
    await t.test(testCase.name, async () => {
      const { calls, fetchImpl } = createFetchStub(() => jsonResponse(200, { ok: testCase.name }));
      const client = createTmdbClient({
        token: "tmdb-token",
        apiBaseUrl: "https://tmdb.example/api",
        fetchImpl,
      });

      const result = await testCase.invoke(client);

      assert.deepEqual(result, { ok: testCase.name });
      assert.equal(calls.length, 1);
      assertUrlMatches(
        calls[0].url,
        buildExpectedUrl("https://tmdb.example/api", testCase.path, testCase.query),
      );
      assert.equal(calls[0].init.headers.Authorization, "Bearer tmdb-token");
    });
  }
});

test("TMDB client validates method inputs before fetching", async (t) => {
  const { calls, fetchImpl } = createFetchStub(() => jsonResponse(200, { ok: true }));
  const client = createTmdbClient({
    token: "tmdb-token",
    fetchImpl,
  });

  const cases = [
    {
      name: "getTrending rejects an invalid mediaType",
      invoke: () => client.getTrending("book", "day"),
      expected: /mediaType must be one of/,
    },
    {
      name: "getTrending rejects an invalid timeWindow",
      invoke: () => client.getTrending("movie", "month"),
      expected: /timeWindow must be one of/,
    },
    {
      name: "getList rejects an invalid category",
      invoke: () => client.getList("movie", "airing_today"),
      expected: /category must be one of/,
    },
    {
      name: "search rejects a missing query",
      invoke: () => client.search("movie", ""),
      expected: /query is required/,
    },
    {
      name: "discover rejects an invalid mediaType",
      invoke: () => client.discover("person"),
      expected: /mediaType must be one of/,
    },
    {
      name: "findByExternalId requires the external source",
      invoke: () => client.findByExternalId("tt0133093", ""),
      expected: /externalSource is required/,
    },
    {
      name: "getDetails requires an id",
      invoke: () => client.getDetails("movie", ""),
      expected: /id is required/,
    },
    {
      name: "getResource rejects unsupported resources",
      invoke: () => client.getResource("movie", 1, "episodes"),
      expected: /resource must be one of/,
    },
    {
      name: "getGenres rejects an invalid mediaType",
      invoke: () => client.getGenres("person"),
      expected: /mediaType must be one of/,
    },
    {
      name: "getChangeList rejects an invalid mediaType",
      invoke: () => client.getChangeList("collection"),
      expected: /mediaType must be one of/,
    },
    {
      name: "getItemChanges requires an id",
      invoke: () => client.getItemChanges("movie", ""),
      expected: /id is required/,
    },
    {
      name: "getCollectionDetails requires a collectionId",
      invoke: () => client.getCollectionDetails(""),
      expected: /collectionId is required/,
    },
    {
      name: "getCompanyDetails requires a companyId",
      invoke: () => client.getCompanyDetails(""),
      expected: /companyId is required/,
    },
    {
      name: "getNetworkDetails requires a networkId",
      invoke: () => client.getNetworkDetails(""),
      expected: /networkId is required/,
    },
    {
      name: "getKeywordDetails requires a keywordId",
      invoke: () => client.getKeywordDetails(""),
      expected: /keywordId is required/,
    },
    {
      name: "getAccountDetails requires a sessionId",
      invoke: () => client.getAccountDetails(5, ""),
      expected: /sessionId is required/,
    },
    {
      name: "getTvSeasonDetails requires a season number",
      invoke: () => client.getTvSeasonDetails(1399, ""),
      expected: /seasonNumber is required/,
    },
    {
      name: "getTvEpisodeDetails requires an episode number",
      invoke: () => client.getTvEpisodeDetails(1399, 1, ""),
      expected: /episodeNumber is required/,
    },
  ];

  for (const testCase of cases) {
    await t.test(testCase.name, () => {
      assert.throws(
        testCase.invoke,
        (error) => {
          assert.ok(error instanceof TmdbInputError);
          assert.match(error.message, testCase.expected);
          assert.equal(error.status, 400);
          return true;
        },
      );
      assert.equal(calls.length, 0);
    });
  }
});
