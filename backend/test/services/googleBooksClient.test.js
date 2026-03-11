const assert = require("node:assert/strict");
const test = require("node:test");

const {
  GoogleBooksApiError,
  GoogleBooksInputError,
  createGoogleBooksClient,
} = require("../../src/services/googleBooksClient");
const { createFetchStub, jsonResponse, textResponse } = require("../../test-helpers/http");

function buildExpectedUrl(baseUrl, endpoint, params = {}) {
  const url = new URL(endpoint.replace(/^\/+/, ""), `${baseUrl.replace(/\/+$/, "")}/`);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    const serialisedValue = Array.isArray(value) ? value.join(",") : String(value);
    url.searchParams.append(key, serialisedValue);
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

test("createGoogleBooksClient rejects a missing fetch implementation", () => {
  assert.throws(
    () => createGoogleBooksClient({ fetchImpl: 0 }),
    /fetch is not available/,
  );
});

test("request adds query params and optional API key for public lookups", async () => {
  const { calls, fetchImpl } = createFetchStub(() => jsonResponse(200, { kind: "books#volumes" }));
  const client = createGoogleBooksClient({
    apiBaseUrl: "https://books.example/api",
    fetchImpl,
  });

  const data = await client.request("/volumes", {
    q: "dune",
    projection: "lite",
    langRestrict: "en",
  });

  assert.deepEqual(data, { kind: "books#volumes" });
  assert.equal(calls.length, 1);
  assert.equal(
    calls[0].url,
    buildExpectedUrl("https://books.example/api", "/volumes", {
      q: "dune",
      projection: "lite",
      langRestrict: "en",
    }),
  );
  assert.equal(calls[0].init.method, "GET");
  assert.equal(calls[0].init.headers.accept, "application/json");
});

test("request wraps network failures in a GoogleBooksApiError", async () => {
  const client = createGoogleBooksClient({
    apiBaseUrl: "https://books.example/api",
    fetchImpl: async () => {
      throw new Error("socket hang up");
    },
  });

  await assert.rejects(
    () => client.request("/volumes", { q: "dune" }),
    (error) => {
      assert.ok(error instanceof GoogleBooksApiError);
      assert.equal(error.status, 0);
      assert.equal(error.message, "Google Books request failed before a response was received.");
      assert.equal(error.url, "https://books.example/api/volumes?q=dune");
      assert.equal(error.cause.message, "socket hang up");
      return true;
    },
  );
});

test("request exposes API error details from an error response body", async () => {
  const { fetchImpl } = createFetchStub(() =>
    jsonResponse(403, {
      error: {
        message: "Daily limit exceeded",
        errors: [{ reason: "quotaExceeded" }],
      },
    }),
  );
  const client = createGoogleBooksClient({
    apiBaseUrl: "https://books.example/api",
    fetchImpl,
  });

  await assert.rejects(
    () => client.request("/volumes", { q: "dune" }),
    (error) => {
      assert.ok(error instanceof GoogleBooksApiError);
      assert.equal(error.status, 403);
      assert.equal(error.message, "Daily limit exceeded");
      assert.deepEqual(error.googleBooksErrors, [{ reason: "quotaExceeded" }]);
      assert.equal(error.url, "https://books.example/api/volumes?q=dune");
      return true;
    },
  );
});

test("request falls back to an HTTP status message when the response body is not JSON", async () => {
  const { fetchImpl } = createFetchStub(() => textResponse(500, "upstream broke"));
  const client = createGoogleBooksClient({
    apiBaseUrl: "https://books.example/api",
    fetchImpl,
  });

  await assert.rejects(
    () => client.request("/volumes", { q: "dune" }),
    (error) => {
      assert.ok(error instanceof GoogleBooksApiError);
      assert.equal(error.status, 500);
      assert.equal(error.message, "Google Books request failed with HTTP 500.");
      assert.equal(error.body, null);
      return true;
    },
  );
});

test("searchVolumes and getVolume call the expected public volume endpoints", async (t) => {
  const cases = [
    {
      name: "searchVolumes",
      invoke: (client) =>
        client.searchVolumes("flowers inauthor:keyes", {
          filter: "free-ebooks",
          orderBy: "newest",
          printType: "books",
          projection: "lite",
          download: "epub",
          langRestrict: "en",
          maxResults: 20,
          startIndex: 5,
        }),
      path: "/volumes",
      query: {
        q: "flowers inauthor:keyes",
        filter: "free-ebooks",
        orderBy: "newest",
        printType: "books",
        projection: "lite",
        download: "epub",
        langRestrict: "en",
        maxResults: 20,
        startIndex: 5,
      },
    },
    {
      name: "getVolume",
      invoke: (client) =>
        client.getVolume("zyTCAlFPjgYC", {
          projection: "full",
          country: "US",
          partner: "bookflix",
        }),
      path: "/volumes/zyTCAlFPjgYC",
      query: {
        projection: "full",
        country: "US",
        partner: "bookflix",
      },
    },
  ];

  for (const testCase of cases) {
    await t.test(testCase.name, async () => {
      const { calls, fetchImpl } = createFetchStub(() => jsonResponse(200, { ok: testCase.name }));
      const client = createGoogleBooksClient({
        apiBaseUrl: "https://books.example/api",
        fetchImpl,
      });

      const result = await testCase.invoke(client);

      assert.deepEqual(result, { ok: testCase.name });
      assert.equal(calls.length, 1);
      assertUrlMatches(
        calls[0].url,
        buildExpectedUrl("https://books.example/api", testCase.path, testCase.query),
      );
    });
  }
});

test("Google Books client validates public search and detail inputs before fetching", async (t) => {
  const { calls, fetchImpl } = createFetchStub(() => jsonResponse(200, { ok: true }));
  const client = createGoogleBooksClient({
    apiBaseUrl: "https://books.example/api",
    fetchImpl,
  });

  const cases = [
    {
      name: "search requires a query",
      invoke: () => client.searchVolumes(""),
      expected: /query is required/,
    },
    {
      name: "search rejects an invalid filter",
      invoke: () => client.searchVolumes("dune", { filter: "preview" }),
      expected: /filter must be one of/,
    },
    {
      name: "search rejects an invalid sort order",
      invoke: () => client.searchVolumes("dune", { orderBy: "popular" }),
      expected: /orderBy must be one of/,
    },
    {
      name: "search rejects an invalid printType",
      invoke: () => client.searchVolumes("dune", { printType: "comics" }),
      expected: /printType must be one of/,
    },
    {
      name: "search rejects an invalid projection",
      invoke: () => client.searchVolumes("dune", { projection: "summary" }),
      expected: /projection must be one of/,
    },
    {
      name: "search rejects an invalid download type",
      invoke: () => client.searchVolumes("dune", { download: "pdf" }),
      expected: /download must be one of/,
    },
    {
      name: "search rejects a maxResults value above the API limit",
      invoke: () => client.searchVolumes("dune", { maxResults: 41 }),
      expected: /maxResults must be an integer between 1 and 40/,
    },
    {
      name: "search rejects a negative startIndex",
      invoke: () => client.searchVolumes("dune", { startIndex: -1 }),
      expected: /startIndex must be an integer between 0 and/,
    },
    {
      name: "getVolume requires a volume ID",
      invoke: () => client.getVolume(""),
      expected: /volumeId is required/,
    },
    {
      name: "getVolume rejects an invalid projection",
      invoke: () => client.getVolume("zyTCAlFPjgYC", { projection: "summary" }),
      expected: /projection must be one of/,
    },
  ];

  for (const testCase of cases) {
    await t.test(testCase.name, () => {
      assert.throws(
        testCase.invoke,
        (error) => {
          assert.ok(error instanceof GoogleBooksInputError);
          assert.match(error.message, testCase.expected);
          assert.equal(error.status, 400);
          return true;
        },
      );
      assert.equal(calls.length, 0);
    });
  }
});
