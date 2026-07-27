This file is the single source of truth for AI coding agents on this project
(Claude Code reads it via `CLAUDE.md`'s `@AGENTS.md` import; Codex and
Antigravity read it natively). Keep all project-specific stack, conventions,
and architecture here so the project is fully specified without any
machine-level config.

# SynchBoard

Real-time collaborative whiteboard (synchboard.com). Full-stack monorepo:
Spring Boot backend + React SPA frontend, WebSocket-powered sync, JWT/OAuth2
auth.

## Stack

### Backend (`backend/`) - Java

- Spring Boot 4.0.6 on Java 25 (Gradle).
- Web: `spring-boot-starter-web`.
- Real-time: `spring-boot-starter-websocket` (STOMP).
- Data: JPA/Hibernate + PostgreSQL (`backend/sql/init.sql`).
- Messaging: ActiveMQ Artemis.
- Auth: Spring Security + OAuth2 client + JWT.
- Ops: Actuator.
- Validation: starter-validation.

### Frontend (`frontend/`) - TypeScript

- React 19 + Vite 8 SPA.
- TypeScript strict. No `any`; use `unknown`, and prefer `satisfies` over `as`.
- HTTP: axios.
- Real-time client: WebSocket/STOMP (`features/websocket`).
- Styling: SCSS (`index.scss`, `styles/`). Use RTL logical props/classes only.
- Motion: `motion/react`. Never import from `framer-motion` — it is the
  deprecated name of the same package and is no longer a dependency.
- i18n: `locales/`. No hardcoded user-facing strings; keep Hebrew and English
  parity.

## Architecture

- Monorepo: `backend/` (Spring Boot) + `frontend/` (Vite SPA), orchestrated
  from root `package.json`.
- Frontend features live under `frontend/src/features/`: `auth`, `board`,
  `chat`, `landing`, `legal`, `settings`, `websocket`.
- Shared frontend code lives under `frontend/src/shared/`.
- Deploy is dockerized: `docker-compose.yml`, `docker-compose.prod.yml`,
  `deploy.sh`, and `server-config/`.

## Commands

- `npm run install:all` installs frontend dependencies.
- `npm run format:check` checks root formatting.
- `npm run format:all` formats Java, TypeScript, TSX, SCSS, and related files.
- `npm run build:frontend` builds the frontend.
- `npm run build:backend` builds the backend through the root script.
- On Windows, run backend Gradle commands from `backend/` with `gradlew.bat`.
- Do not use root backend npm scripts that call Unix `./gradlew` on Windows;
  use `backend\gradlew.bat` directly.
- `backend\gradlew.bat build` builds the backend on Windows.
- `frontend\npm run dev` starts the frontend dev server.

## Rules

- Validate board access through the existing board access services before board
  operations.
- Preserve JWT handling for HTTP and WebSocket/STOMP flows.
- Add translations in both English and Hebrew locale namespaces when changing
  user-facing frontend text.
- Keep constants centralized in the existing backend `constants/` package and
  frontend `shared/constants/` area.
- Do not print or expose `.env` values, JWT secrets, database credentials, or
  broker credentials.
- Secrets live only in `.env` (gitignored). `.env.example` lists names, never
  values.
- Commit + GitHub operations can run freely. Only `git push` requires explicit
  approval. Never force-push or push to `main` without approval.

## Verification

Before finishing meaningful changes, run the narrowest relevant checks.

- For frontend work, prefer `npm run build:frontend` or the frontend
  lint/build scripts.
- For backend work, run `backend\gradlew.bat build`.
- For UI changes, verify the relevant flow in the Codex in-app Browser when
  the dev server is running.
- Production app with a live deployment; a server migration was performed on
  2026-06-02. Treat backend/deploy changes as production-affecting, and verify
  builds before declaring done.
