# Azure Hosting Security Checklist

Use this checklist before moving BookFlix from local development to Azure-hosted deployment.

## Required

- Set a real `JWT_SECRET` in Azure App Settings.
- Do not rely on the local fallback JWT secret in production.
- Set `NODE_ENV=production`.
- Set `FRONTEND_ORIGIN` to the exact deployed frontend origin.
- Keep database credentials only in Azure environment settings, not in tracked files.
- Confirm the backend is served over HTTPS.
- Confirm auth cookies are sent with `Secure=true` in production.
- Confirm the Azure MySQL firewall allows only the required client/app addresses.
- Confirm the backend still connects to MySQL using TLS verification.

## Auth Behavior

- Verify signup still stores `password_hash`, not plaintext passwords.
- Verify login sets an HTTP-only cookie.
- Verify `/auth/test` succeeds only with a valid session cookie.
- Verify `/pair` and `/user` redirect when unauthenticated.
- Verify `POST /api/pairs/save` returns `401` or `403` when unauthenticated.
- Verify logout clears the auth cookie and blocks protected routes again.

## Cross-Origin And Cookie Checks

- If frontend and backend use different origins, confirm cookie settings still work in the browser.
- If cross-site cookies are required, review `SameSite` policy and use `Secure=true`.
- Confirm CORS allows only the intended frontend origin and still uses `credentials: true`.

## Abuse And Hardening Follow-Up

- Add login and signup rate limiting before public exposure.
- Reduce account-enumeration behavior in registration and login error responses.
- Add stronger validation for usernames, emails, passwords, and pair payload fields.
- Review whether voting should also require authentication.

## Final Smoke Test

- Open the deployed frontend.
- Create a new account.
- Log in.
- Refresh the page and confirm the session persists.
- Create a pair.
- Log out.
- Confirm protected pages and protected writes are blocked.
