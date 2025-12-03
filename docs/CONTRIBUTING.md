# Contributing to SynchBoard

Thank you for your interest in contributing to SynchBoard! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of Conduct

Please be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive environment for all contributors.

---

## Getting Started

### Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 9.0.0
- **Java** 24+
- **Docker** and **Docker Compose** (recommended)

### Setup

1. **Fork and clone the repository:**

   ```bash
   git clone https://github.com/your-username/SynchBoard.git
   cd SynchBoard
   ```

2. **Copy environment configuration:**

   ```bash
   cp .env.example .env
   ```

3. **Start with Docker (recommended):**

   ```bash
   docker-compose up --build
   ```

   Or for local development without Docker, see the [Installation Guide](INSTALLATION.md).

---

## Development Workflow

### Running the Application

**With Docker:**

```bash
docker-compose up --build
```

**Without Docker:**

```bash
# Terminal 1 - Start infrastructure
docker-compose up -d postgres activemq

# Terminal 2 - Backend (from backend/)
gradlew.bat bootRun    # Windows
./gradlew bootRun      # Linux/Mac

# Terminal 3 - Frontend (from frontend/)
npm run dev
```

### Access Points

| Service         | URL                      |
| --------------- | ------------------------ |
| Frontend        | http://localhost:5173    |
| Backend API     | http://localhost:8080    |
| ActiveMQ Console| http://localhost:8161    |

---

## Code Style Guidelines

### Formatting

All code must be formatted before committing. Run the formatter from the project root:

```bash
npm run format:all
```

To check formatting without modifying files:

```bash
npm run format:check
```

### Backend (Java)

- Use **Lombok** annotations (`@Slf4j`, `@RequiredArgsConstructor`, `@Builder`)
- Add **Javadoc** to all public classes and methods with `@author`, `@param`, `@return`, `@throws` tags
- Use custom exceptions mapped via `GlobalExceptionHandler`:
  - `ResourceNotFoundException` → 404
  - `InvalidRequestException` → 400
  - `ResourceConflictException` → 409
- Use `@Transactional` with read-only where appropriate
- Follow the existing package structure under `backend/src/main/java/io/github/sagimenahem/synchboard/`

### Frontend (TypeScript/React)

- Use **SCSS modules** for component-scoped styling
- Add **JSDoc** comments to exported functions and components
- Use path aliases: `features/*`, `shared/*`, `locales/*`, `assets/*`
- Follow strict TypeScript settings (`strict: true`, `noUnusedLocals`, `noUnusedParameters`)
- Use `toast.success()` and `toast.error()` from react-hot-toast for user feedback
- Add `@fileoverview` comments to barrel export files (index.ts)

### SCSS Guidelines

- Import styles using: `@use '@/styles' as theme;`
- Use mixins: `@include theme.flex-center;`, `@include theme.button-base;`, etc.
- Reference design tokens from `_design-tokens.scss`
- Use glass morphism mixins from `_glass.scss` for panel styling

---

## Commit Message Guidelines

We follow a conventional commit format. Each commit message should be structured as:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type       | Description                                      |
| ---------- | ------------------------------------------------ |
| `feat`     | New feature                                      |
| `fix`      | Bug fix                                          |
| `docs`     | Documentation changes                            |
| `style`    | Code style changes (formatting, no logic change) |
| `refactor` | Code refactoring                                 |
| `perf`     | Performance improvements                         |
| `test`     | Adding or updating tests                         |
| `chore`    | Build, config, or tooling changes                |

### Scopes

| Scope      | Description                    |
| ---------- | ------------------------------ |
| `auth`     | Authentication feature         |
| `board`    | Board/canvas feature           |
| `chat`     | Chat feature                   |
| `settings` | User settings feature          |
| `websocket`| WebSocket/real-time feature    |
| `api`      | Backend API changes            |
| `ui`       | Shared UI components           |
| `config`   | Configuration changes          |
| `deps`     | Dependency updates             |

### Examples

```
feat(board): add radial dock toolbar for drawing tools

fix(auth): resolve token expiration handling in interceptor

docs(api): add curl examples to API documentation

refactor(websocket): extract connection logic into custom hook
```

---

## Pull Request Process

1. **Create a feature branch** from `main` (see [Branch Naming Conventions](#branch-naming-conventions))

2. **Make your changes** following the code style guidelines

3. **Format your code:**

   ```bash
   npm run format:all
   ```

4. **Lint frontend code:**

   ```bash
   cd frontend && npm run lint
   ```

5. **Commit your changes** following the commit message guidelines

6. **Push to your fork** and create a Pull Request

7. **Fill out the PR template** with:
   - Summary of changes
   - Related issue (if applicable)
   - Testing performed
   - Screenshots (for UI changes)

8. **Address review feedback** promptly

### PR Requirements

- All code must be formatted
- No ESLint errors in frontend code
- Clear description of changes
- Follows existing code patterns
- Documentation updated if needed

---

## Branch Naming Conventions

Use the following format for branch names:

```
<type>/<short-description>
```

### Examples

| Branch Name                     | Description                          |
| ------------------------------- | ------------------------------------ |
| `feat/radial-dock-toolbar`      | New radial dock feature              |
| `fix/websocket-reconnection`    | Fix for WebSocket reconnection       |
| `docs/api-examples`             | Documentation improvements           |
| `refactor/auth-hooks`           | Refactoring authentication hooks     |
| `chore/update-dependencies`     | Dependency updates                   |

---

## Testing

> **Note:** The project currently does not have a test suite. This is an area for future improvement.

When tests are added, they should:

- Cover critical business logic
- Include both unit and integration tests
- Be placed alongside the code they test or in a `__tests__` directory

---

## Documentation

### Code Documentation

- **Java:** Add Javadoc to all public classes and methods
- **TypeScript:** Add JSDoc to exported functions and components
- **Index files:** Add `@fileoverview` comments to barrel exports

### External Documentation

Documentation files are located in the `docs/` directory:

| File                       | Purpose                              |
| -------------------------- | ------------------------------------ |
| `API_DOCUMENTATION.md`     | REST API reference                   |
| `INSTALLATION.md`          | Setup and deployment guide           |
| `DATABASE_SCHEMA.md`       | Database structure                   |
| `WEBSOCKET_ARCHITECTURE.md`| Real-time communication details      |
| `SECURITY.md`              | Security considerations              |

When making significant changes, please update the relevant documentation.

---

## Questions?

If you have questions about contributing, please open an issue on GitHub.

---

**Author:** Sagi Menahem
