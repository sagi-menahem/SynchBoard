# Repository Guidance

## Project

SynchBoard is a full-stack collaborative whiteboard app. The backend is Java 25
with Spring Boot, WebSocket/STOMP, PostgreSQL, and ActiveMQ Artemis. The
frontend is React 19, TypeScript, Vite, SCSS modules, and i18next.

## Commands

- `npm run format:check` checks root formatting.
- `npm run build:frontend` builds the frontend.
- `npm run install:all` installs frontend dependencies.
- On Windows, run backend Gradle commands from `backend/` with `gradlew.bat`.
- `backend\gradlew.bat build` builds the backend.
- `frontend\npm run dev` starts the frontend dev server.

## Rules

- Do not use root backend npm scripts that call Unix `./gradlew` on Windows;
  use `backend\gradlew.bat` directly.
- Validate board access through the existing board access services before board
  operations.
- Preserve JWT handling for HTTP and WebSocket/STOMP flows.
- Add translations in both English and Hebrew locale namespaces when changing
  user-facing frontend text.
- Keep constants centralized in the existing backend `constants/` package and
  frontend `shared/constants/` area.
- Do not print or expose `.env` values, JWT secrets, database credentials, or
  broker credentials.

## Verification

Before finishing meaningful changes, run the narrowest relevant checks. For
frontend work, prefer `npm run build:frontend` or the frontend lint/build
scripts. For backend work, run `backend\gradlew.bat build`. For UI changes,
verify the relevant flow in the Codex in-app Browser when the dev server is
running.
