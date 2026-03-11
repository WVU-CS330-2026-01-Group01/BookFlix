const GOOGLE_BOOKS_API_BASE_URL = "https://www.googleapis.com/books/v1";
const GOOGLE_BOOKS_FILTERS = Object.freeze([
  "partial",
  "full",
  "free-ebooks",
  "paid-ebooks",
  "ebooks",
]);
const GOOGLE_BOOKS_ORDER_BY = Object.freeze(["relevance", "newest"]);
const GOOGLE_BOOKS_PRINT_TYPES = Object.freeze(["all", "books", "magazines"]);
const GOOGLE_BOOKS_PROJECTIONS = Object.freeze(["full", "lite"]);
const GOOGLE_BOOKS_DOWNLOADS = Object.freeze(["epub"]);

class GoogleBooksInputError extends Error {
  constructor(message) {
    super(message);
    this.name = "GoogleBooksInputError";
    this.status = 400;
  }
}

class GoogleBooksApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "GoogleBooksApiError";
    this.status = details.status ?? 500;
    this.googleBooksErrors = details.googleBooksErrors ?? null;
    this.url = details.url ?? null;
    this.body = details.body ?? null;
    this.cause = details.cause;
  }
}

function requireValue(value, label) {
  if (value === undefined || value === null || value === "") {
    throw new GoogleBooksInputError(`${label} is required.`);
  }
}

function requireOneOf(options, value, label) {
  if (!options.includes(value)) {
    throw new GoogleBooksInputError(`${label} must be one of: ${options.join(", ")}.`);
  }
}

function requireOptionalOneOf(options, value, label) {
  if (value === undefined || value === null || value === "") {
    return;
  }

  requireOneOf(options, value, label);
}

function requireIntegerInRange(value, minimum, maximum, label) {
  if (value === undefined || value === null || value === "") {
    return;
  }

  const number = Number(value);

  if (!Number.isInteger(number) || number < minimum || number > maximum) {
    throw new GoogleBooksInputError(
      `${label} must be an integer between ${minimum} and ${maximum}.`,
    );
  }
}

function toQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    const serialisedValue = Array.isArray(value) ? value.join(",") : String(value);
    searchParams.append(key, serialisedValue);
  }

  return searchParams.toString();
}

function validateSearchOptions(optionsForRequest = {}) {
  requireOptionalOneOf(GOOGLE_BOOKS_FILTERS, optionsForRequest.filter, "filter");
  requireOptionalOneOf(GOOGLE_BOOKS_ORDER_BY, optionsForRequest.orderBy, "orderBy");
  requireOptionalOneOf(GOOGLE_BOOKS_PRINT_TYPES, optionsForRequest.printType, "printType");
  requireOptionalOneOf(GOOGLE_BOOKS_PROJECTIONS, optionsForRequest.projection, "projection");
  requireOptionalOneOf(GOOGLE_BOOKS_DOWNLOADS, optionsForRequest.download, "download");
  requireIntegerInRange(optionsForRequest.maxResults, 1, 40, "maxResults");
  requireIntegerInRange(optionsForRequest.startIndex, 0, Number.MAX_SAFE_INTEGER, "startIndex");
}

function validateVolumeOptions(optionsForRequest = {}) {
  requireOptionalOneOf(GOOGLE_BOOKS_PROJECTIONS, optionsForRequest.projection, "projection");
}

function createGoogleBooksClient(options = {}) {
  const apiBaseUrl = options.apiBaseUrl ?? GOOGLE_BOOKS_API_BASE_URL;
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    throw new Error(
      "fetch is not available in this runtime. Use Node 18+ or pass { fetchImpl } into createGoogleBooksClient().",
    );
  }

  // This service only knows how to talk to the public Google Books API.
  // Route handlers and frontend concerns live elsewhere.
  async function request(endpoint, params = {}) {
    const baseUrl = `${apiBaseUrl.replace(/\/+$/, "")}/`;
    const url = new URL(endpoint.replace(/^\/+/, ""), baseUrl);
    const queryString = toQueryString(params);

    if (queryString) {
      url.search = queryString;
    }

    let response;

    try {
      response = await fetchImpl(url, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      });
    } catch (error) {
      throw new GoogleBooksApiError(
        "Google Books request failed before a response was received.",
        {
          status: 0,
          url: url.toString(),
          cause: error,
        },
      );
    }

    let body = null;

    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (!response.ok || body?.error) {
      const apiError = body?.error ?? null;

      throw new GoogleBooksApiError(
        apiError?.message || `Google Books request failed with HTTP ${response.status}.`,
        {
          status: response.status,
          googleBooksErrors: apiError?.errors ?? null,
          url: url.toString(),
          body,
        },
      );
    }

    return body;
  }

  return {
    request,
    searchVolumes: (query, optionsForRequest = {}) => {
      requireValue(query, "query");
      validateSearchOptions(optionsForRequest);
      return request("/volumes", {
        ...optionsForRequest,
        q: query,
      });
    },
    getVolume: (volumeId, optionsForRequest = {}) => {
      requireValue(volumeId, "volumeId");
      validateVolumeOptions(optionsForRequest);
      return request(`/volumes/${encodeURIComponent(volumeId)}`, optionsForRequest);
    },
  };
}

module.exports = {
  createGoogleBooksClient,
  GoogleBooksApiError,
  GoogleBooksInputError,
  GOOGLE_BOOKS_API_BASE_URL,
  GOOGLE_BOOKS_DOWNLOADS,
  GOOGLE_BOOKS_FILTERS,
  GOOGLE_BOOKS_ORDER_BY,
  GOOGLE_BOOKS_PRINT_TYPES,
  GOOGLE_BOOKS_PROJECTIONS,
};
