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

All root scripts are cross-platform and work as written on Windows, macOS and
Linux. Backend scripts go through `scripts/gradlew.mjs`, which selects
`gradlew.bat` or `./gradlew` for the platform.

- `npm run install:all` installs root and frontend dependencies.
- `npm run check` is the gate: lint, then typecheck, then `format:check`.
- `npm run lint` / `npm run typecheck` run the frontend halves individually.
- `npm run format:all` formats Java, TypeScript, TSX, SCSS, and related files.
- `npm run format:check` checks root formatting.
- `npm test` runs both suites; `npm run test:frontend` (vitest) and
  `npm run test:backend` (JUnit) run one each.
- `npm run build:frontend` builds the frontend.
- `npm run build:backend` builds the backend.
- `npm run dev:frontend` and `npm run dev:backend` start the dev servers; each
  frees its port first (5173 and 8080). `npm run kill-port` frees both.
- `npm run gradle -- <args>` runs an arbitrary Gradle task, e.g.
  `npm run gradle -- dependencyUpdates`.

The backend needs a JDK 25 with `JAVA_HOME` pointing at it — a JRE is not
enough. The Gradle scripts fail early with instructions if it is unset.

## Migrations

- Migrations are hand-written and forward-only. The SQL files under
  `backend/src/main/resources/db/migration` are the authority for the schema;
  the JPA entities describe types only.
- Never edit a migration that has already run — Flyway validates checksums and
  will refuse to start. Reverse a change with a new forward migration.
- There are no undo scripts, and `spring.flyway.clean-disabled=true`.
- `JPA_DDL_AUTO` is `validate`. Hibernate must never create or alter tables.
- After changing an entity, add the matching migration. `SchemaBaselineTest`
  regenerates the DDL from the entities and fails if the two have diverged.

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

- For frontend work, run `npm run check` and `npm run test:frontend`.
- For backend work, run `npm run build:backend` (which runs the tests).
- For UI changes, verify the relevant flow in the Codex in-app Browser when
  the dev server is running.
- Production app with a live deployment; a server migration was performed on
  2026-06-02. Treat backend/deploy changes as production-affecting, and verify
  builds before declaring done.
