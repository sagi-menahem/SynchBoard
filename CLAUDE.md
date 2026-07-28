@AGENTS.md

# Claude-only notes

- The line above is a real **import** (`@AGENTS.md`), not a markdown link — it loads `AGENTS.md` into context. Keep all project substance in `AGENTS.md`; this file holds only Claude-specific extras.
- Monorepo: backend is Java/Spring Boot (Gradle), frontend is React/Vite. Use the root `package.json` scripts to drive both halves.
- Hard guarantees are enforced by `.claude/settings.json` `deny` rules, not by prose here — those survive context compaction. Today that file denies reads of every `.env` variant and denies force-push in any form, and puts plain `git push` behind an `ask`. This mirrors the AGENTS.md rules on secrets and pushing; change the two together or they drift.
- `.claude/verify.json` runs `npm run check` (lint, then typecheck, then `format:check`) as the Stop gate. Tests are deliberately not in that gate — they run in CI and via `npm test`, so the per-turn gate stays fast.
- `.claude/settings.local.json` is gitignored personal overrides. Nothing machine-specific belongs in the committed `.claude/` files.
- There is no `.claude/skills/` or `.claude/rules/` in this repo. If you add either, say so here — an entry describing a directory that does not exist is worse than no entry.
