// Demo branch seed: rebuilds the local mock database with mock users, mock
// votes/ratings/comments, and real movie + book pairs pulled from TMDB and
// Google Books. Runs once on boot when mock_db.json is missing.

const fs = require("node:fs");
const path = require("node:path");

const bcrypt = require("bcryptjs");

const env = require("./env");
const { replaceStore, DATA_FILE } = require("./mockPool");
const { createTmdbClient } = require("../services/tmdbClient");
const { createGoogleBooksClient } = require("../services/googleBooksClient");

const PAIR_DATA_PATH = path.resolve(__dirname, "../../data/pair_data.json");

const TMDB_GENRES = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western",
};

const MOCK_USERS = [
  { username: "demo",    email: "demo@bookflix.dev",    password: "demo1234", pfp_index: 0, bio: "Just here for the pairs." },
  { username: "alice",   email: "alice@bookflix.dev",   password: "alice1234", pfp_index: 1, bio: "Sci-fi stan. The book is (almost) always better." },
  { username: "bob",     email: "bob@bookflix.dev",     password: "bob12345",  pfp_index: 2, bio: "Cozy fantasy + rainy afternoons." },
  { username: "charlie", email: "charlie@bookflix.dev", password: "charlie1",  pfp_index: 3, bio: "Horror completionist. Send recs." },
  { username: "dani",    email: "dani@bookflix.dev",    password: "dani1234",  pfp_index: 4, bio: "Teen romance to prestige TV, I watch it all." },
  { username: "eve",     email: "eve@bookflix.dev",     password: "eve12345",  pfp_index: 5, bio: "Will argue about LOTR for hours." },
];

const SAMPLE_COMMENTS = [
  "The book goes way deeper into the world-building here.",
  "Cast was great but they skipped my favorite subplot.",
  "Honestly preferred the movie for once.",
  "Re-read the book right after and it hit even harder.",
  "Solid adaptation — 4/5 from me.",
  "Wait til you read the sequel, it's even better.",
];

function loadLocalPairs() {
  if (!fs.existsSync(PAIR_DATA_PATH)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(PAIR_DATA_PATH, "utf8"));
    return Object.values(raw);
  } catch {
    return [];
  }
}

async function fetchFreshPairs(tmdb, googleBooks, limit = 12) {
  const results = [];
  try {
    const trending = await tmdb.getTrending("movie", "week", { language: "en-US" });
    const movies = (trending?.results ?? []).slice(0, limit);

    for (const movie of movies) {
      const title = movie.title || movie.name;
      if (!title) continue;
      try {
        const search = await googleBooks.searchVolumes(title, {
          langRestrict: "en",
          maxResults: 3,
          printType: "books",
        });
        const book = (search?.items ?? [])[0];
        if (!book) continue;

        const genres = (movie.genre_ids ?? []).map((id) => TMDB_GENRES[id]).filter(Boolean);
        results.push({
          id: `${movie.id}_${book.id}`,
          user: "demo",
          score: 0,
          movie: {
            id: movie.id,
            title,
            poster_path: movie.poster_path ?? null,
            release_date: movie.release_date ?? movie.first_air_date ?? null,
            overview: movie.overview ?? null,
            popularity: movie.popularity ?? null,
            genre: genres,
            type: movie.media_type ?? "movie",
          },
          book: {
            id: book.id,
            title: book.volumeInfo?.title ?? null,
            thumbnail: book.volumeInfo?.imageLinks?.thumbnail ?? null,
            publishedDate: book.volumeInfo?.publishedDate ?? null,
            description: book.volumeInfo?.description ?? null,
            ratings: book.volumeInfo?.averageRating ?? null,
            categories: book.volumeInfo?.categories ?? [],
            pagecount: book.volumeInfo?.pageCount ?? 0,
          },
        });
      } catch (err) {
        // Keep seeding — a single failed lookup shouldn't abort the demo.
        console.warn(`  · Skipped "${title}":`, err.message);
      }
    }
  } catch (err) {
    console.warn("TMDB trending fetch failed, falling back to local pairs only:", err.message);
  }
  return results;
}

function mergePairs(existing, fresh) {
  const merged = new Map();
  for (const pair of existing) {
    const key = pair.id ?? `${pair.movie?.id}_${pair.book?.id}`;
    merged.set(key, { ...pair, id: key });
  }
  for (const pair of fresh) {
    merged.set(pair.id, pair);
  }
  return [...merged.values()];
}

function pairToRow(pair) {
  return {
    id: pair.id,
    user: pair.user ?? "demo",
    score: pair.score ?? 0,
    movie_id: String(pair.movie?.id ?? ""),
    movie_title: pair.movie?.title ?? null,
    movie_poster_path: pair.movie?.poster_path ?? null,
    movie_release_date: pair.movie?.release_date ?? null,
    movie_overview: pair.movie?.overview ?? null,
    movie_popularity: pair.movie?.popularity ?? null,
    movie_genre: pair.movie?.genre ?? [],
    movie_type: pair.movie?.type ?? "movie",
    book_id: String(pair.book?.id ?? ""),
    book_title: pair.book?.title ?? null,
    book_thumbnail: pair.book?.thumbnail ?? null,
    book_publishedDate: pair.book?.publishedDate ?? null,
    book_description: pair.book?.description ?? null,
    book_ratings: pair.book?.ratings ?? null,
    book_categories: pair.book?.categories ?? [],
    book_pagecount: pair.book?.pagecount ?? null,
  };
}

function synthesizeInteractions(pairRows, users) {
  const votes = [];
  const comments = [];
  let commentId = 1;

  const usernames = users.map((u) => u.username);

  pairRows.forEach((row, idx) => {
    // Rotating upvotes + a down here and there so the feed feels lived-in.
    const upvoters = usernames.slice(0, (idx % usernames.length) + 1);
    for (const user_name of upvoters) {
      votes.push({
        user_name,
        pair_id: row.id,
        vote: 1,
        book_rating: 3 + ((idx + user_name.length) % 3),
        movie_rating: 3 + ((idx + 1) % 3),
      });
    }
    if (idx % 4 === 0 && usernames.length > 1) {
      votes.push({
        user_name: usernames[usernames.length - 1],
        pair_id: row.id,
        vote: -1,
        book_rating: 2,
        movie_rating: 4,
      });
    }

    // One or two comments per pair, sprinkled across users.
    const commenters = [usernames[idx % usernames.length], usernames[(idx + 2) % usernames.length]];
    commenters.forEach((username, i) => {
      comments.push({
        id: commentId++,
        pair_id: row.id,
        username,
        body: SAMPLE_COMMENTS[(idx + i) % SAMPLE_COMMENTS.length],
        created_at: new Date(Date.now() - (idx * 3600 + i * 600) * 1000).toISOString(),
      });
    });
  });

  return { votes, comments, nextCommentId: commentId };
}

async function seedIfEmpty({ force = false } = {}) {
  if (!force && fs.existsSync(DATA_FILE)) {
    return { skipped: true, reason: "mock_db.json already exists" };
  }

  console.log("Seeding mock database…");

  const localPairs = loadLocalPairs();
  console.log(`  · Loaded ${localPairs.length} pair(s) from pair_data.json`);

  let freshPairs = [];
  try {
    const tmdb = createTmdbClient();
    const googleBooks = createGoogleBooksClient({ apiKey: env.googleBooksApiKey });
    freshPairs = await fetchFreshPairs(tmdb, googleBooks, 10);
    console.log(`  · Pulled ${freshPairs.length} fresh pair(s) from TMDB + Google Books`);
  } catch (err) {
    console.warn("  · Skipping live API seed:", err.message);
  }

  const allPairs = mergePairs(localPairs, freshPairs);
  const pairRows = allPairs.map(pairToRow);

  const users = [];
  let userId = 1;
  for (const mock of MOCK_USERS) {
    users.push({
      id: userId++,
      email: mock.email,
      username: mock.username,
      password_hash: bcrypt.hashSync(mock.password, 10),
      pfp_index: mock.pfp_index,
      bio: mock.bio,
    });
  }

  const { votes, comments, nextCommentId } = synthesizeInteractions(pairRows, users);

  const pairs = {};
  for (const row of pairRows) pairs[row.id] = row;

  await replaceStore({
    users,
    pairs,
    votes,
    comments,
    nextUserId: userId,
    nextCommentId,
  });

  console.log(
    `Mock database seeded: ${users.length} users, ${pairRows.length} pairs, ${votes.length} votes, ${comments.length} comments.`,
  );
  console.log("Demo login: username=demo password=demo1234 (plus alice/bob/charlie/dani/eve — all with password <name>1234)");

  return { skipped: false };
}

module.exports = { seedIfEmpty };
