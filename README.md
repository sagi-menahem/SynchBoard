# SynchBoard - Real-time Collaborative Whiteboard

A full-stack collaborative whiteboard application built with Spring Boot backend and React frontend, featuring real-time synchronization, user authentication, and team collaboration tools.

## 🚀 Running the Application

This project supports two deployment modes:

### Option 1: Docker Deployment (Recommended for Quick Start)

Perfect for testing and evaluation - everything runs with a single command.

```bash
# 1. Clone the repository
git clone https://github.com/sagi-menahem/SynchBoard.git
cd synchboard

# 2. Copy the example environment file
cp .env.example .env

# 3. Start all services
docker-compose up --build

# 4. Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8080
# ActiveMQ Console: http://localhost:8161 (admin/admin)
```

### Option 2: Local Development Mode

For development and debugging with IDE support.

**Prerequisites:**
- PostgreSQL 17+ running locally
- ActiveMQ Artemis 2.37+ running locally
- Java 24+ and Node.js 20+

```bash
# 1. Set up infrastructure (using Docker for databases only)
docker-compose up -d postgres activemq

# 2. Configure backend
cd backend
cp ../.env.example .env
# Edit .env: change DB_URL to localhost, CLIENT_ORIGIN_URL to http://localhost:5173
./gradlew bootRun  # Or run from IDE

# 3. Configure frontend (in new terminal)
cd frontend
cp ../.env.example .env
# Edit .env: set VITE_API_BASE_URL=http://localhost:8080/api
npm install
npm run dev

# 4. Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8080
```

### 📝 Configuration Notes

- **Email Features**: Optional. Leave `SENDGRID_API_KEY` empty to disable email verification
- **Google Login**: Optional. Leave `GOOGLE_CLIENT_ID` empty to disable OAuth2
- **Default Credentials**: The `.env.example` includes working defaults for development
- **Security**: Never use the default `JWT_SECRET_KEY` in production!

### 🔧 Feature Availability

The application gracefully handles missing API keys:
- Without SendGrid: Registration works without email verification
- Without Google OAuth: Traditional email/password login only
- Check `/api/config/features` to see which features are enabled

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Java 24 with Spring Boot 3.5.5
- Spring Security with JWT authentication
- Spring WebSocket with STOMP protocol
- PostgreSQL 17 for data persistence
- ActiveMQ Artemis for message brokering
- SendGrid for email services
- OAuth2 with Google provider

**Frontend:**
- React 19.1.1 with TypeScript 5.9.2
- Vite 7.0.0 build tool
- SCSS modules for styling
- @stomp/stompjs for WebSocket communication
- React Router for navigation
- i18next for internationalization
- Axios for HTTP requests

**Infrastructure:**
- Docker & Docker Compose for containerization
- Nginx for serving frontend and proxying API requests
- Multi-stage Docker builds for optimized images

## 📁 Project Structure

```
synchboard/
├── backend/               # Spring Boot backend application
│   ├── src/              # Source code
│   ├── build.gradle      # Gradle build configuration
│   └── Dockerfile        # Backend container configuration
├── frontend/             # React frontend application
│   ├── src/              # Source code
│   ├── package.json      # NPM dependencies
│   ├── nginx.conf        # Nginx configuration for production
│   └── Dockerfile        # Frontend container configuration
├── docker-compose.yml    # Docker services orchestration
├── .env.example         # Environment variables template
└── README.md           # This file
```

## 🔧 Configuration

### Environment Variables

The application uses environment variables for configuration. See `.env.example` for all available options:

- **Database**: PostgreSQL connection settings
- **Message Broker**: ActiveMQ configuration
- **JWT Security**: Secret key for token signing
- **Email Service**: SendGrid API configuration (optional)
- **OAuth2**: Google OAuth credentials (optional)

### Default Credentials

For development/testing with default configuration:
- PostgreSQL: `synchboard_user` / `test12345`
- ActiveMQ: `admin` / `admin`
- pgAdmin: `admin@synchboard.local` / `admin`

## 🛠️ Development

### Running Without Docker

**Backend:**
```bash
cd backend
./gradlew bootRun  # Unix/Mac
gradlew.bat bootRun # Windows
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Available Scripts

**Backend:**
- `./gradlew test` - Run tests
- `./gradlew build` - Build the application
- `./gradlew bootJar` - Create executable JAR

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

**Root Level:**
- `npm run format:all` - Format entire project
- `npm run build:backend` - Build backend
- `npm run build:frontend` - Build frontend

## 📋 Features

- **Real-time Collaboration**: Multiple users can draw and edit simultaneously
- **User Authentication**: JWT-based authentication with email verification
- **OAuth2 Integration**: Sign in with Google
- **Board Management**: Create, share, and manage collaborative boards
- **Drawing Tools**: Various shapes, lines, text, and colors
- **Chat System**: Real-time messaging within boards
- **Member Management**: Invite users, manage permissions
- **Responsive Design**: Works on desktop and tablet devices
- **Internationalization**: Support for multiple languages (English, Hebrew)

## 🧪 Testing the Application

1. Register a new account or use OAuth2 (Google) login
2. Create a new board or join an existing one
3. Invite team members via email
4. Start collaborating in real-time!

## 📝 API Documentation

When the application is running, API documentation is available at:
`http://localhost:8080/swagger-ui.html`

## 🔒 Security Notes

- Never commit `.env` files with real credentials
- Always use HTTPS in production
- Rotate JWT secret keys regularly
- Configure CORS appropriately for your domain

## 🐛 Troubleshooting

**Port Conflicts:**
- Ensure ports 80, 8080, 5432, 61613, 61616, 8161 are free
- Modify port mappings in `.env` if needed

**Docker Issues:**
- Run `docker-compose down -v` to clean up volumes
- Rebuild with `docker-compose build --no-cache`

**Database Connection:**
- Verify PostgreSQL is healthy: `docker-compose ps`
- Check logs: `docker-compose logs postgres`

## 📄 License

This project is submitted as part of university coursework.

## 👥 Contributors

- Sagi Menahem - Full Stack Developer

---

For any issues or questions, please open an issue in the GitHub repository.
