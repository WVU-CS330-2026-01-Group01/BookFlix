const env = require("../config/env");

const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const TMDB_TRENDING_WINDOWS = Object.freeze(["day", "week"]);
const TMDB_SEARCH_TYPES = Object.freeze([
  "movie",
  "tv",
  "person",
  "collection",
  "company",
  "keyword",
  "multi",
]);
const TMDB_DISCOVER_TYPES = Object.freeze(["movie", "tv"]);
const TMDB_DETAIL_TYPES = Object.freeze(["movie", "tv", "person"]);
const TMDB_CHANGE_TYPES = Object.freeze(["movie", "tv", "person"]);
const TMDB_GENRE_TYPES = Object.freeze(["movie", "tv"]);
const TMDB_LIST_CATEGORIES = Object.freeze({
  movie: Object.freeze(["popular", "top_rated", "upcoming", "now_playing", "latest"]),
  tv: Object.freeze(["popular", "top_rated", "airing_today", "on_the_air", "latest"]),
  person: Object.freeze(["popular", "latest"]),
});
const TMDB_RESOURCES = Object.freeze({
  movie: Object.freeze([
    "credits",
    "images",
    "keywords",
    "release_dates",
    "reviews",
    "recommendations",
    "similar",
    "translations",
    "videos",
    "watch/providers",
  ]),
  tv: Object.freeze([
    "aggregate_credits",
    "content_ratings",
    "credits",
    "images",
    "keywords",
    "reviews",
    "recommendations",
    "similar",
    "translations",
    "videos",
    "watch/providers",
  ]),
  person: Object.freeze([
    "combined_credits",
    "external_ids",
    "images",
    "movie_credits",
    "tagged_images",
    "translations",
    "tv_credits",
  ]),
});
const PARAM_ALIASES = Object.freeze({
  appendToResponse: "append_to_response",
  includeImageLanguage: "include_image_language",
  sessionId: "session_id",
  externalSource: "external_source",
});

// Route handlers preserve these details in JSON error responses without
// leaking fetch internals to the React app.
class TmdbInputError extends Error {
  constructor(message) {
    super(message);
    this.name = "TmdbInputError";
    this.status = 400;
  }
}

class TmdbApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "TmdbApiError";
    this.status = details.status ?? 500;
    this.tmdbCode = details.tmdbCode ?? null;
    this.tmdbMessage = details.tmdbMessage ?? null;
    this.url = details.url ?? null;
    this.body = details.body ?? null;
    this.cause = details.cause;
  }
}

function requireValue(value, label) {
  if (value === undefined || value === null || value === "") {
    throw new TmdbInputError(`${label} is required.`);
  }
}

function requireOneOf(options, value, label) {
  if (!options.includes(value)) {
    throw new TmdbInputError(`${label} must be one of: ${options.join(", ")}.`);
  }
}

function toQueryString(params = {}) {
  // The frontend uses camelCase names in a few places; translate them once here
  // before calling TMDB's snake_case API.
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    const tmdbKey = PARAM_ALIASES[key] ?? key;
    const serialisedValue = Array.isArray(value) ? value.join(",") : String(value);
    searchParams.append(tmdbKey, serialisedValue);
  }

  return searchParams.toString();
}

function createTmdbClient(options = {}) {
  const token = options.token ?? env.tmdbToken;
  const apiBaseUrl = options.apiBaseUrl ?? TMDB_API_BASE_URL;
  const imageBaseUrl = options.imageBaseUrl ?? TMDB_IMAGE_BASE_URL;
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;

  if (!token) {
    throw new Error(
      "TMDB_TOKEN is missing. Add it to backend/.env or pass { token } into createTmdbClient().",
    );
  }

  if (typeof fetchImpl !== "function") {
    throw new Error(
      "fetch is not available in this runtime. Use Node 18+ or pass { fetchImpl } into createTmdbClient().",
    );
  }

  // This service only knows how to talk to TMDB. Route handlers and frontend
  // response shaping live elsewhere.
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
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      throw new TmdbApiError("TMDB request failed before a response was received.", {
        status: 0,
        url: url.toString(),
        cause: error,
      });
    }

    let body = null;

    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (!response.ok || body?.success === false) {
      throw new TmdbApiError(
        body?.status_message || `TMDB request failed with HTTP ${response.status}.`,
        {
          status: response.status,
          tmdbCode: body?.status_code ?? null,
          tmdbMessage: body?.status_message ?? null,
          url: url.toString(),
          body,
        },
      );
    }

    return body;
  }

  function buildImageUrl(filePath, size = "original") {
    // TMDB returns image paths separately from host/size information, so the UI
    // can ask the backend for a fully qualified poster URL when needed.
    if (!filePath) {
      return null;
    }

    const cleanPath = String(filePath).replace(/^\/+/, "");
    return `${imageBaseUrl.replace(/\/+$/, "")}/${size}/${cleanPath}`;
  }

  return {
    request,
    validateKey: () => request("/authentication"),
    getConfiguration: () => request("/configuration"),
    getCountries: () => request("/configuration/countries"),
    getJobs: () => request("/configuration/jobs"),
    getLanguages: () => request("/configuration/languages"),
    getPrimaryTranslations: () => request("/configuration/primary_translations"),
    getTimezones: () => request("/configuration/timezones"),
    buildImageUrl,
    getTrending: (mediaType = "all", timeWindow = "day", optionsForRequest = {}) => {
      requireOneOf(["all", "movie", "tv", "person"], mediaType, "mediaType");
      requireOneOf(TMDB_TRENDING_WINDOWS, timeWindow, "timeWindow");
      return request(`/trending/${mediaType}/${timeWindow}`, optionsForRequest);
    },
    getList: (mediaType, category, optionsForRequest = {}) => {
      requireOneOf(Object.keys(TMDB_LIST_CATEGORIES), mediaType, "mediaType");
      requireOneOf(TMDB_LIST_CATEGORIES[mediaType], category, "category");
      return request(`/${mediaType}/${category}`, optionsForRequest);
    },
    search: (mediaType, query, optionsForRequest = {}) => {
      requireOneOf(TMDB_SEARCH_TYPES, mediaType, "mediaType");
      requireValue(query, "query");
      return request(`/search/${mediaType}`, { ...optionsForRequest, query });
    },
    discover: (mediaType, filters = {}) => {
      requireOneOf(TMDB_DISCOVER_TYPES, mediaType, "mediaType");
      return request(`/discover/${mediaType}`, filters);
    },
    findByExternalId: (externalId, externalSource, optionsForRequest = {}) => {
      requireValue(externalId, "externalId");
      requireValue(externalSource, "externalSource");

      return request(`/find/${encodeURIComponent(externalId)}`, {
        ...optionsForRequest,
        externalSource,
      });
    },
    getDetails: (mediaType, id, optionsForRequest = {}) => {
      requireOneOf(TMDB_DETAIL_TYPES, mediaType, "mediaType");
      requireValue(id, "id");
      return request(`/${mediaType}/${id}`, optionsForRequest);
    },
    getResource: (mediaType, id, resource, optionsForRequest = {}) => {
      requireOneOf(TMDB_DETAIL_TYPES, mediaType, "mediaType");
      requireValue(id, "id");
      requireOneOf(TMDB_RESOURCES[mediaType], resource, "resource");
      return request(`/${mediaType}/${id}/${resource}`, optionsForRequest);
    },
    getGenres: (mediaType, optionsForRequest = {}) => {
      requireOneOf(TMDB_GENRE_TYPES, mediaType, "mediaType");
      return request(`/genre/${mediaType}/list`, optionsForRequest);
    },
    getChangeList: (mediaType, optionsForRequest = {}) => {
      requireOneOf(TMDB_CHANGE_TYPES, mediaType, "mediaType");
      return request(`/${mediaType}/changes`, optionsForRequest);
    },
    getItemChanges: (mediaType, id, optionsForRequest = {}) => {
      requireOneOf(TMDB_CHANGE_TYPES, mediaType, "mediaType");
      requireValue(id, "id");
      return request(`/${mediaType}/${id}/changes`, optionsForRequest);
    },
    getCollectionDetails: (collectionId, optionsForRequest = {}) => {
      requireValue(collectionId, "collectionId");
      return request(`/collection/${collectionId}`, optionsForRequest);
    },
    getCompanyDetails: (companyId, optionsForRequest = {}) => {
      requireValue(companyId, "companyId");
      return request(`/company/${companyId}`, optionsForRequest);
    },
    getNetworkDetails: (networkId, optionsForRequest = {}) => {
      requireValue(networkId, "networkId");
      return request(`/network/${networkId}`, optionsForRequest);
    },
    getKeywordDetails: (keywordId, optionsForRequest = {}) => {
      requireValue(keywordId, "keywordId");
      return request(`/keyword/${keywordId}`, optionsForRequest);
    },
    getAccountDetails: (accountId, sessionId) => {
      requireValue(accountId, "accountId");
      requireValue(sessionId, "sessionId");
      return request(`/account/${accountId}`, { sessionId });
    },
    getTvSeasonDetails: (tvId, seasonNumber, optionsForRequest = {}) => {
      requireValue(tvId, "tvId");
      requireValue(seasonNumber, "seasonNumber");
      return request(`/tv/${tvId}/season/${seasonNumber}`, optionsForRequest);
    },
    getTvEpisodeDetails: (tvId, seasonNumber, episodeNumber, optionsForRequest = {}) => {
      requireValue(tvId, "tvId");
      requireValue(seasonNumber, "seasonNumber");
      requireValue(episodeNumber, "episodeNumber");
      return request(
        `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`,
        optionsForRequest,
      );
    },
  };
}

module.exports = {
  createTmdbClient,
  TmdbApiError,
  TmdbInputError,
  TMDB_API_BASE_URL,
  TMDB_IMAGE_BASE_URL,
  TMDB_TRENDING_WINDOWS,
  TMDB_SEARCH_TYPES,
  TMDB_DISCOVER_TYPES,
  TMDB_DETAIL_TYPES,
  TMDB_CHANGE_TYPES,
  TMDB_GENRE_TYPES,
  TMDB_LIST_CATEGORIES,
  TMDB_RESOURCES,
};
