# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SynchBoard is a real-time collaborative whiteboard application built with Spring Boot (backend) and React (frontend). It enables users to create, manage, and collaborate on digital boards with real-time synchronization, chat functionality, and user management.

## Development Commands

### Backend (Spring Boot with Gradle)

```bash
# Windows
gradlew.bat build          # Build application
gradlew.bat bootRun        # Run application (port 8080)
gradlew.bat test           # Run tests
gradlew.bat checkstyleMain # Code style check

# Linux/Mac
./gradlew build
./gradlew bootRun
./gradlew test
./gradlew checkstyleMain
```

### Frontend (React with Vite)

```bash
npm run dev      # Start development server (port 5173)
npm run build    # Production build
npm run lint     # Lint code with ESLint
npm run format   # Format code with Prettier
npm run preview  # Preview production build
```

## Architecture

### Backend Architecture

-   **Layered Architecture**: Controller → Service → Repository → Entity
-   **Authentication**: JWT-based stateless authentication with Spring Security
-   **Real-time Communication**: WebSocket with STOMP protocol + ActiveMQ message broker
-   **Database**: PostgreSQL with Spring Data JPA
-   **Code Style**: Google Java Style enforced with Checkstyle

**Key Backend Packages:**

-   `com.synchboard.backend.controller` - REST endpoints and WebSocket controllers
-   `com.synchboard.backend.service` - Business logic layer
-   `com.synchboard.backend.repository` - Data access layer
-   `com.synchboard.backend.model` - Entity classes
-   `com.synchboard.backend.config` - Configuration classes
-   `com.synchboard.backend.security` - Security and JWT handling

### Frontend Architecture

-   **Component-based React** with TypeScript
-   **State Management**: React Context API for global state
-   **Routing**: React Router DOM for navigation
-   **API Layer**: Axios with centralized service classes
-   **Styling**: CSS Modules for component-scoped styles
-   **Internationalization**: i18next for multi-language support (English/Hebrew)

**Key Frontend Structure:**

-   `src/components/` - Reusable UI components
-   `src/pages/` - Route-level page components
-   `src/contexts/` - React context providers for global state
-   `src/services/` - API service abstraction layer
-   `src/hooks/` - Custom React hooks
-   `src/utils/` - Utility functions

## Key Features & Technical Details

### Real-time Collaboration

-   WebSocket connections managed through STOMP protocol
-   Message broker pattern with ActiveMQ for scalable real-time updates
-   Board state synchronization across connected clients

### Authentication Flow

-   JWT tokens for stateless authentication
-   Token-based API authorization
-   User session management with React Context

### Database Schema

-   PostgreSQL with JPA entities for users, boards, and board members
-   Relational data model supporting board ownership and member permissions

## Development Notes

### Code Standards

-   Backend follows Google Java Style Guide (enforced by Checkstyle)
-   Frontend uses ESLint + Prettier configuration
-   TypeScript strict mode enabled for type safety

### Testing

-   Backend uses Spring Boot Test framework
-   Test coverage includes controller, service, and repository layers

### Configuration

-   Backend configuration in `application.properties` and `application-dev.properties`
-   Frontend environment variables for API endpoints and WebSocket URLs
-   CORS configuration for local development between ports 5173 and 8080

**PLAYWRIGHT MCP** - use playwright mcp to test and debug every change and implements
