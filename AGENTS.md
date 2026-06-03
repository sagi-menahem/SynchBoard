This file is the **single source of truth** for AI coding agents on this project
(Claude Code reads it via `CLAUDE.md`'s `@AGENTS.md` import; Codex and Antigravity
read it natively). Keep all project-specific stack, conventions, and architecture
here so the project is fully specified without any machine-level config.

# SynchBoard

> Real-time collaborative whiteboard (synchboard.com). Full-stack monorepo: Spring Boot backend + React SPA frontend, WebSocket-powered sync, JWT/OAuth2 auth.

## Stack

### Backend (`backend/`) — Java
- **Spring Boot 4.0.6** on **Java 25** (Gradle, `./gradlew`).
- **Web:** `spring-boot-starter-web`. **Real-time:** `spring-boot-starter-websocket` (STOMP).
- **Data:** JPA/Hibernate + **PostgreSQL** (`backend/sql/init.sql`). **Messaging:** ActiveMQ.
- **Auth:** Spring Security + OAuth2 client + JWT. **Ops:** Actuator. **Validation:** starter-validation.

### Frontend (`frontend/`) — TypeScript
- **React 19 + Vite 8** SPA. TypeScript strict. No `any` → `unknown`; `satisfies` over `as`.
- **HTTP:** axios. **Real-time client:** WebSocket/STOMP (`features/websocket`).
- **Styling:** SCSS (`index.scss`, `styles/`). RTL logical props only (`ps-`/`pe-`/`ms-`/`me-`).
- **Motion:** currently `framer-motion`. Standard is `motion/react` — migrate when next touching animation code (not a standalone task on this production app).
- **i18n:** `locales/` — no hardcoded user-facing strings; Hebrew + English parity.

## Architecture

- **Monorepo:** `backend/` (Spring Boot) + `frontend/` (Vite SPA), orchestrated from root `package.json`.
- **Frontend features** (`frontend/src/features/`): `auth`, `board`, `chat`, `landing`, `legal`, `settings`, `websocket`. Shared code in `frontend/src/shared/`.
- **Deploy:** dockerized — `docker-compose.yml` (dev) + `docker-compose.prod.yml` (prod), `deploy.sh`, `server-config/`.

## Commands (from repo root)

```bash
npm run install:all     # install frontend deps
npm run dev:backend     # cd backend && ./gradlew bootRun
npm run dev:frontend    # cd frontend && vite dev
npm run build:backend   # ./gradlew build  (run before declaring backend work done)
npm run build:frontend  # vite build       (run before declaring frontend work done)
npm run format:all      # prettier across java + ts/tsx/scss
```

## Secrets & git

- Secrets live only in `.env` (gitignored). `.env.example` lists names, never values. Never print a secret value into chat — a secret that appears in chat is burned → rotate it.
- Commit + GitHub operations (add/commit/branch/merge/`gh`) run freely. **Only `git push` requires explicit approval.** Never force-push or push to `main` without approval.

## Notes

- Production app with a live deployment; a server migration was performed 2026-06-02. Treat backend/deploy changes as production-affecting — verify builds before declaring done.
