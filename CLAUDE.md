# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SynchBoard is a real-time collaborative whiteboard application built with Spring Boot (backend) and React (frontend). It enables users to create, manage, and collaborate on digital boards with real-time synchronization, chat functionality, and user management.

## Development Commands

### Backend (Spring Boot with Gradle)

```bash
# Windows - Direct commands from backend directory
cd backend
gradlew.bat build          # Build application
gradlew.bat bootRun        # Run application (port 8080)
gradlew.bat test           # Run tests
gradlew.bat test --tests ClassName     # Run specific test class
gradlew.bat test --tests ClassName.methodName  # Run specific test method
gradlew.bat clean          # Clean build directory
gradlew.bat bootJar       # Create executable JAR

# Linux/Mac
./gradlew build
./gradlew bootRun
./gradlew test
./gradlew test --tests ClassName
```

**Environment Variables Required for Backend:**
- `DB_URL`: PostgreSQL connection URL
- `DB_USERNAME`: Database username  
- `DB_PASSWORD`: Database password
- `JPA_DDL_AUTO`: Hibernate DDL mode (update/create/validate)
- `JWT_SECRET_KEY`: Secret key for JWT token signing
- `STOMP_BROKER_HOST`: STOMP broker hostname
- `STOMP_BROKER_PORT`: STOMP broker port
- `ACTIVEMQ_BROKER_URL`: ActiveMQ broker URL
- `ACTIVEMQ_USER`: ActiveMQ username
- `ACTIVEMQ_PASSWORD`: ActiveMQ password

### Frontend (React with Vite)

```bash
cd frontend
npm run dev      # Start development server (port 5173)
npm run build    # Production build
npm run lint     # Lint code with ESLint
npm run lint:fix # Auto-fix linting issues
npm run preview  # Preview production build
```

## Architecture

### Backend Architecture

- **Layered Architecture**: Controller → Service → Repository → Entity
- **Authentication**: JWT-based stateless authentication with Spring Security
- **Real-time Communication**: WebSocket with STOMP protocol + ActiveMQ message broker
- **Database**: PostgreSQL with Spring Data JPA
- **Java Version**: Java 24 (configured in build.gradle)

**Key Backend Packages:**
- `io.github.sagimenahem.synchboard.controller` - REST endpoints and WebSocket controllers
- `io.github.sagimenahem.synchboard.service` - Business logic layer
- `io.github.sagimenahem.synchboard.repository` - Data access layer
- `io.github.sagimenahem.synchboard.entity` - JPA entities
- `io.github.sagimenahem.synchboard.dto` - Data transfer objects
- `io.github.sagimenahem.synchboard.config` - Configuration classes (Security, WebSocket, MVC)
- `io.github.sagimenahem.synchboard.exception` - Custom exceptions and global handler
- `io.github.sagimenahem.synchboard.constants` - Application constants

### Frontend Architecture

- **Component-based React** with TypeScript (strict mode)
- **State Management**: React Context API for global state (Auth, Board, Preferences, WebSocket)
- **Routing**: React Router DOM v7 for navigation
- **API Layer**: Axios with centralized service classes
- **Styling**: CSS Modules for component-scoped styles
- **Internationalization**: i18next for multi-language support (English/Hebrew)
- **Error Handling**: Error boundaries at page and component levels

**Key Frontend Structure:**
- `src/components/` - Reusable UI components organized by feature
- `src/pages/` - Route-level page components
- `src/contexts/` - React context providers for global state
- `src/services/` - API service abstraction layer
- `src/hooks/` - Custom React hooks organized by feature domain
- `src/utils/` - Utility functions
- `src/types/` - TypeScript type definitions

## Key Features & Technical Details

### Real-time Collaboration
- WebSocket connections managed through STOMP protocol (@stomp/stompjs)
- Message broker pattern with ActiveMQ for scalable real-time updates
- Board state synchronization across connected clients
- Real-time chat with message read status tracking

### Authentication Flow
- JWT tokens for stateless authentication
- Token stored in localStorage and included in API headers
- Protected routes using ProtectedRoute component
- User session management with AuthContext

### Database Schema
- PostgreSQL with JPA entities
- Key entities: User, GroupBoard, GroupMember, BoardObject, Message, ActionHistory
- Composite keys for many-to-many relationships (GroupMemberId, MessageReadId)
- File uploads stored in `./uploads` directory

### WebSocket Message Types
- Board updates (draw actions, object changes)
- Chat messages
- User status updates (join/leave)
- Board member notifications

## Development Notes

### Code Standards
- Frontend uses ESLint with TypeScript strict configuration
- Import ordering enforced (builtin → external → internal)
- Max line length: 120 characters
- React hooks rules enforced
- Accessibility rules via jsx-a11y plugin

### Environment Configuration
- Backend: Environment variables for database, JWT, ActiveMQ, and STOMP broker
- Frontend: Vite environment for API endpoints
- CORS enabled for local development between ports 5173 and 8080

### Testing
- Backend: Spring Boot Test framework with JUnit
- Frontend: No test runner configured (consider adding Vitest)

### File Upload Configuration
- Max file size: 10MB
- Supported for user profile pictures and board images
- Stored locally in `./uploads` directory

### VS Code Integration
- Spring Boot Dashboard can be used to run backend with environment variables
- Backend can also be run via command line with proper environment variables set