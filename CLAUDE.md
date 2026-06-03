@AGENTS.md

# Claude-only notes

- The line above is a real **import** (`@AGENTS.md`), not a markdown link — it loads `AGENTS.md` into context. Keep all project substance in `AGENTS.md`; this file holds only Claude-specific extras.
- Monorepo: backend is Java/Spring Boot (Gradle), frontend is React/Vite. Use the root `package.json` scripts to drive both halves.
- Project skills live in `.claude/skills/`; project rules (path-scoped) in `.claude/rules/`.
- Hard guarantees are enforced by `.claude/settings.json` `deny` rules, not by prose here — those survive context compaction.
