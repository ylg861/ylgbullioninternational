# Copilot Instructions — YLG Bullion

This document gives AI coding agents the essential, repo-specific knowledge to be productive quickly.

1) Big-picture architecture
- Backend: `backend/server.js` — an Express + Mongoose service (MongoDB at `mongodb://127.0.0.1:27017/gold_trading`) listening on port 3000. It implements core APIs (register/login, trades, chat, deposit/withdraw, admin controls).
- Frontend: Static HTML/CSS/JS files in the repo root and `Admin/` (no build system). Pages are standalone (open `index.html` or serve the folder to test).

2) Key files and examples
- `backend/server.js`: single-file API server. Important endpoints:
  - `POST /api/register` — payload: `{ userId, userName, password }` (creates user with default balance 1000)
  - `POST /api/login` — payload: `{ userId, password }` (returns `userId`, `userName`, `balance`, `tradeControl`)
  - `POST /api/trades/place` — payload: `{ userId, amount, duration, position }` (debited immediately; result decided after `duration` seconds)
  - `POST /api/admin/control-user` — payload: `{ userId, status }` with `status` in `NORMAL|WIN|LOSS`
  - `POST /api/chat/send`, `GET /api/chat/history/:userId`
  - `POST /api/deposit`, `POST /api/withdraw`
- `backend/package.json`: lists runtime deps used by the server (express, mongoose, cors, body-parser). Root `package.json` contains libraries (`bcryptjs`, `jsonwebtoken`) not used by `backend/server.js` currently — review before changing auth.

3) Data models & domain rules (important for correctness)
- `User` model fields: `userId` (unique), `userName`, `password` (currently stored/checked in plaintext in the server), `balance`, `tradeControl` (values: `NORMAL`, `WIN`, `LOSS`).
- Trade flow: placing a trade debits `balance` immediately. After `duration` seconds a `setTimeout` resolves the trade; payout percent depends on amount tiers (see `server.js`). Admin `tradeControl` can override random outcome.

4) Developer workflows (how to run & debug)
- Start backend (no start script):
  - Open terminal in `backend/` and run:

    npm install
    node server.js

  - Server logs to console (Mongo connect messages, trade result logs). MongoDB must be running at `127.0.0.1:27017`.
- Serve frontend (static): either open `index.html` in a browser, or serve the repo root (recommended) for relative asset paths, e.g.:

    npx http-server . -p 8000

  Then open `http://localhost:8000/index.html` and point API calls to `http://localhost:3000`.

5) Project-specific conventions & gotchas
- No front-end framework — pages use inline styles and vanilla JS; modify carefully to avoid breaking global CSS selectors (see `index.html` for patterns).
- Authentication: server currently returns plain user info; there is no JWT/session flow implemented. Look at `root package.json` only if you intend to add token-based auth — it contains `jsonwebtoken` and `bcryptjs` but the server doesn't use them yet.
- DB & data assumptions: test users are created with a default `balance: 1000` on `POST /api/register`. Many endpoints expect `userId` strings (not Mongo _id).
- Admin behavior: changing `tradeControl` for a user changes trade outcomes globally for that user (see `POST /api/admin/control-user`).

6) Integration points and testing targets
- External services: MongoDB only. No third-party providers required for core flows.
- Areas to test after edits: trade settlement logic (`setTimeout`), immediate balance mutation on trade placement, deposit/withdraw flows (status field transitions), and chat history ordering.

7) When you change code
- Keep API shapes stable (clients are static pages). Use the endpoints listed above as canonical.
- If adding authentication, update front-end pages that call `/api/*` to include tokens and update `backend/server.js` handlers.

If anything here is unclear or you'd like more detail (example payloads, pointer to a specific UI file), tell me which part to expand. I'll update this file accordingly.
