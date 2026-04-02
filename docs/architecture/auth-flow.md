# Auth Flow

This document describes the current BookFlix authentication design.

## Overview

BookFlix uses cookie-based authentication:

- users register with email, username, and password
- passwords are hashed with bcrypt before storage
- login issues a signed JWT
- the JWT is stored in an HTTP-only cookie
- the frontend verifies the session by calling `/auth/test`

## Backend Pieces

- `backend/src/routes/authRoutes.js`
- `backend/src/middleware/authMiddleware.js`
- `backend/src/app.js`
- `backend/src/config/env.js`

## Frontend Pieces

- `frontend/app/src/App.jsx`
- `frontend/app/src/pages/Login.jsx`
- `frontend/app/src/pages/Signup.jsx`
- `frontend/app/src/pages/pair.jsx`
- `frontend/app/src/pages/User.jsx`

## Route Model

Public routes:

- `/`
- `/login`
- `/signup`
- `/BookMovie`

Protected frontend routes:

- `/pair`
- `/user`

Protected backend route:

- `POST /api/pairs/save`

## Runtime Flow

1. User submits signup form.
2. Backend hashes the password and stores the user in `authdb.users`.
3. User submits login form.
4. Backend validates credentials and sets an HTTP-only cookie.
5. Frontend calls `/auth/test` on startup to restore auth state.
6. Protected pages render only when the session is valid.
7. Logout clears the cookie and resets frontend auth state.

## Stored Data

Authentication data stored in `authdb.users`:

- `id`
- `email`
- `username`
- `password_hash`
- `created_at`

Pair attribution stored in `pair_data.movie_book_pairs`:

- `user`

## Deployment Notes

- Set a real `JWT_SECRET` outside local development.
- Set `FRONTEND_ORIGIN` to the deployed frontend origin.
- Cookie settings may need adjustment if frontend and backend are deployed on different origins.
