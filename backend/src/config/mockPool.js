// Drop-in replacement for the mysql2 pool used throughout the backend.
// Backs the four tables the app uses (users, movie_book_pairs, pair_votes,
// comments) with a JSON file on disk so the UI demo works with no MySQL.

const fs = require("node:fs");
const path = require("node:path");

const DATA_FILE = path.resolve(__dirname, "../../data/mock_db.json");

function emptyStore() {
  return {
    users: [],
    pairs: {},
    votes: [],
    comments: [],
    nextUserId: 1,
    nextCommentId: 1,
  };
}

let store = null;
let writeQueue = Promise.resolve();

function loadStore() {
  if (store) return store;
  if (fs.existsSync(DATA_FILE)) {
    try {
      store = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    } catch {
      store = emptyStore();
    }
  } else {
    store = emptyStore();
  }
  // Back-fill any missing top-level keys from older snapshots.
  const defaults = emptyStore();
  for (const key of Object.keys(defaults)) {
    if (!(key in store)) store[key] = defaults[key];
  }
  return store;
}

function persist() {
  writeQueue = writeQueue.then(
    () =>
      new Promise((resolve) => {
        fs.mkdir(path.dirname(DATA_FILE), { recursive: true }, () => {
          fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), () => resolve());
        });
      }),
  );
  return writeQueue;
}

function getStore() {
  return loadStore();
}

function replaceStore(next) {
  store = next;
  return persist();
}

// Normalize SQL for matching: collapse whitespace and lowercase.
function norm(sql) {
  return String(sql).replace(/\s+/g, " ").trim().toLowerCase();
}

function ok(rows = [], extra = {}) {
  // mysql2 returns [rows, fields]; tests and routes only read rows.
  return [rows, []];
}

function affected(count, insertId = 0) {
  return [{ affectedRows: count, insertId }, []];
}

async function run(sql, params = []) {
  const s = norm(sql);
  const db = getStore();

  // ───────── users ─────────
  if (s.startsWith("select id from users where username = ? or email = ?")) {
    const [username, email] = params;
    const found = db.users.find((u) => u.username === username || u.email === email);
    return ok(found ? [{ id: found.id }] : []);
  }

  if (s.startsWith("insert into users")) {
    const [email, username, password_hash] = params;
    const id = db.nextUserId++;
    db.users.push({
      id,
      email,
      username,
      password_hash,
      pfp_index: 0,
      bio: "",
    });
    await persist();
    return affected(1, id);
  }

  if (s.startsWith("select id, username, password_hash, pfp_index from users where username = ?")) {
    const [username] = params;
    const u = db.users.find((x) => x.username === username);
    return ok(u ? [{ id: u.id, username: u.username, password_hash: u.password_hash, pfp_index: u.pfp_index }] : []);
  }

  if (s.startsWith("select id, username, pfp_index from users where id = ?")) {
    const [id] = params;
    const u = db.users.find((x) => x.id === Number(id));
    return ok(u ? [{ id: u.id, username: u.username, pfp_index: u.pfp_index }] : []);
  }

  if (s.startsWith("select bio from authdb.users where username = ?")) {
    const [username] = params;
    const u = db.users.find((x) => x.username === username);
    return ok(u ? [{ bio: u.bio ?? "" }] : []);
  }

  if (s.startsWith("update authdb.users set bio = ? where username = ?")) {
    const [bio, username] = params;
    const u = db.users.find((x) => x.username === username);
    if (u) {
      u.bio = bio;
      await persist();
      return affected(1);
    }
    return affected(0);
  }

  if (s.startsWith("update authdb.users set pfp_index = ? where username = ?")) {
    const [pfp_index, username] = params;
    const u = db.users.find((x) => x.username === username);
    if (u) {
      u.pfp_index = pfp_index;
      await persist();
      return affected(1);
    }
    return affected(0);
  }

  // ───────── movie_book_pairs ─────────
  if (s.startsWith("insert into pair_data.movie_book_pairs")) {
    const [
      id,
      user,
      score,
      movie_id,
      movie_title,
      movie_poster_path,
      movie_release_date,
      movie_overview,
      movie_popularity,
      movie_genre,
      movie_type,
      book_id,
      book_title,
      book_thumbnail,
      book_publishedDate,
      book_description,
      book_ratings,
      book_categories,
      book_pagecount,
    ] = params;

    db.pairs[id] = {
      id,
      user,
      score,
      movie_id,
      movie_title,
      movie_poster_path,
      movie_release_date,
      movie_overview,
      movie_popularity,
      movie_genre: safeParseJson(movie_genre),
      movie_type,
      book_id,
      book_title,
      book_thumbnail,
      book_publishedDate,
      book_description,
      book_ratings,
      book_categories: safeParseJson(book_categories),
      book_pagecount,
    };
    await persist();
    return affected(1);
  }

  if (s.startsWith("select * from pair_data.movie_book_pairs")) {
    return ok(Object.values(db.pairs));
  }

  // ───────── pair_votes ─────────
  if (s.startsWith("delete from pair_data.pair_votes where user_name = ? and pair_id = ?")) {
    const [user_name, pair_id] = params;
    const before = db.votes.length;
    db.votes = db.votes.filter((v) => !(v.user_name === user_name && v.pair_id === pair_id));
    await persist();
    return affected(before - db.votes.length);
  }

  if (
    s.startsWith("insert into pair_data.pair_votes (user_name, pair_id, vote) values")
  ) {
    const [user_name, pair_id, vote] = params;
    upsertVote(db, { user_name, pair_id, vote });
    await persist();
    return affected(1);
  }

  if (
    s.startsWith("insert into pair_data.pair_votes (user_name, pair_id, vote, book_rating, movie_rating) values")
  ) {
    const [user_name, pair_id, book_rating, movie_rating] = params;
    upsertVote(db, { user_name, pair_id, book_rating, movie_rating });
    await persist();
    return affected(1);
  }

  if (s.startsWith("select coalesce(sum(vote), 0) as score from pair_data.pair_votes where pair_id = ?")) {
    const [pair_id] = params;
    const score = db.votes
      .filter((v) => v.pair_id === pair_id)
      .reduce((acc, v) => acc + (Number(v.vote) || 0), 0);
    return ok([{ score }]);
  }

  if (s.startsWith("select vote from pair_data.pair_votes where user_name = ? and pair_id = ?")) {
    const [user_name, pair_id] = params;
    const v = db.votes.find((x) => x.user_name === user_name && x.pair_id === pair_id);
    return ok(v ? [{ vote: v.vote ?? 0 }] : []);
  }

  if (
    s.startsWith("select vote, book_rating, movie_rating from pair_data.pair_votes where user_name = ? and pair_id = ?")
  ) {
    const [user_name, pair_id] = params;
    const v = db.votes.find((x) => x.user_name === user_name && x.pair_id === pair_id);
    return ok(
      v
        ? [{ vote: v.vote ?? 0, book_rating: v.book_rating ?? 0, movie_rating: v.movie_rating ?? 0 }]
        : [],
    );
  }

  if (
    s.startsWith(
      "select avg(nullif(book_rating, 0)) as avgbook, avg(nullif(movie_rating, 0)) as avgmovie from pair_data.pair_votes where pair_id = ?",
    )
  ) {
    const [pair_id] = params;
    const rel = db.votes.filter((v) => v.pair_id === pair_id);
    const avg = (key) => {
      const nonZero = rel.map((r) => r[key]).filter((x) => Number(x) > 0);
      if (nonZero.length === 0) return null;
      return nonZero.reduce((a, b) => a + Number(b), 0) / nonZero.length;
    };
    return ok([{ avgBook: avg("book_rating"), avgMovie: avg("movie_rating") }]);
  }

  // ───────── comments ─────────
  if (
    s.startsWith("select id, username, body, created_at from pair_data.comments where pair_id = ?")
  ) {
    const [pair_id] = params;
    const rows = db.comments
      .filter((c) => c.pair_id === pair_id)
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(({ id, username, body, created_at }) => ({ id, username, body, created_at }));
    return ok(rows);
  }

  if (s.startsWith("insert into pair_data.comments")) {
    const [pair_id, username, body] = params;
    const id = db.nextCommentId++;
    db.comments.push({
      id,
      pair_id,
      username,
      body,
      created_at: new Date().toISOString(),
    });
    await persist();
    return affected(1, id);
  }

  if (s.startsWith("update pair_data.comments set body = ? where id = ? and username = ?")) {
    const [body, id, username] = params;
    const c = db.comments.find((x) => x.id === Number(id) && x.username === username);
    if (c) {
      c.body = body;
      await persist();
      return affected(1);
    }
    return affected(0);
  }

  if (s.startsWith("delete from pair_data.comments where id = ? and username = ?")) {
    const [id, username] = params;
    const before = db.comments.length;
    db.comments = db.comments.filter((x) => !(x.id === Number(id) && x.username === username));
    await persist();
    return affected(before - db.comments.length);
  }

  throw new Error(`mockPool: unhandled SQL: ${sql}`);
}

function upsertVote(db, patch) {
  const existing = db.votes.find(
    (v) => v.user_name === patch.user_name && v.pair_id === patch.pair_id,
  );
  if (existing) {
    Object.assign(existing, patch);
  } else {
    db.votes.push({
      user_name: patch.user_name,
      pair_id: patch.pair_id,
      vote: patch.vote ?? 0,
      book_rating: patch.book_rating ?? 0,
      movie_rating: patch.movie_rating ?? 0,
    });
  }
}

function safeParseJson(value) {
  if (typeof value !== "string") return value ?? [];
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

const pool = {
  execute: (sql, params) => run(sql, params),
  query: (sql, params) => run(sql, params),
  end: async () => {
    await writeQueue;
  },
};

module.exports = {
  getPool: () => pool,
  getStore,
  replaceStore,
  persist,
  DATA_FILE,
};
