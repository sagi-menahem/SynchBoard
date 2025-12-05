<div align="center">
  <img src="assets/logo.png" alt="SynchBoard Logo" width="120"/>
  <h1>SynchBoard</h1>
  <p><strong>Real-time Collaborative Whiteboard</strong></p>
  <p>A production-ready full-stack application featuring WebSocket-powered real-time synchronization, JWT authentication, and seamless team collaboration.</p>

  <a href="https://synchboard.com">
    <img src="https://img.shields.io/badge/Live_Demo-synchboard.com-2563eb?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Live Demo">
  </a>
</div>

---

<div align="center">

![Java](https://img.shields.io/badge/Java_24-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.5-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript_5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_17-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

</div>

---

## Preview

<div align="center">
  <img src="assets/preview.png" alt="SynchBoard - Collaborative Whiteboard" />
</div>

---

## Features

<table>
<tr>
<td width="50%">

### Real-time Collaboration

- WebSocket/STOMP synchronization via ActiveMQ Artemis
- Optimistic updates with automatic rollback
- Exponential backoff reconnection strategy
- Offline message queue processing

### Drawing Tools

- Freehand brush & eraser
- Shapes: rectangle, square, circle, triangle, pentagon, hexagon, star
- Lines: solid, dotted, arrow
- Text boxes with customizable fonts
- Color picker & recolor tool
- Canvas download functionality

### Board Management

- Create, share, and manage boards
- Role-based permissions (Admin/Member)
- Invite members via email
- Customizable canvas settings (size, background)

</td>
<td width="50%">

### Authentication & Security

- JWT-based authentication
- Google OAuth2 integration
- Email verification with SendGrid
- Password reset functionality
- XSS protection & message sanitization

### User Experience

- Light/Dark theme support
- Internationalization (English & Hebrew RTL)
- Fully responsive design (desktop, tablet & mobile)
- Full undo/redo history per user
- Persistent user preferences

### Developer Experience

- Docker Compose orchestration
- Production-ready deployment scripts
- Swagger/OpenAPI documentation
- Multi-stage Docker builds
- Comprehensive type safety

</td>
</tr>
</table>

---

## Screenshots

<div align="center">

### Theme & Language Support

<table>
<tr>
<td align="center"><strong>English - Dark</strong></td>
<td align="center"><strong>English - Light</strong></td>
</tr>
<tr>
<td><img src="assets/screenshots/workspace-en-dark.jpg" alt="Workspace - English Dark" width="400"/></td>
<td><img src="assets/screenshots/workspace-en-light.jpg" alt="Workspace - English Light" width="400"/></td>
</tr>
<tr>
<td align="center"><strong>Hebrew (RTL) - Dark</strong></td>
<td align="center"><strong>Hebrew (RTL) - Light</strong></td>
</tr>
<tr>
<td><img src="assets/screenshots/workspace-he-dark.jpg" alt="Workspace - Hebrew Dark" width="400"/></td>
<td><img src="assets/screenshots/workspace-he-light.jpg" alt="Workspace - Hebrew Light" width="400"/></td>
</tr>
</table>

### Application Pages

<table>
  <tr>
    <td align="center"><strong>Board List</strong></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/board-list.jpg" alt="Board List" width="100%"/></td>
  </tr>
  <tr>
    <td align="center"><strong>Board Settings</strong></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/board-settings.jpg" alt="Board Settings" width="100%"/></td>
  </tr>
  <tr>
    <td align="center"><strong>User Settings</strong></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/user-settings.jpg" alt="User Settings" width="100%"/></td>
  </tr>
  <tr>
    <td align="center"><strong>Authentication</strong></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/auth.jpg" alt="Authentication" width="100%"/></td>
  </tr>
</table>

### Mobile Experience

<table>
  <tr>
    <td align="center"><strong>Board List - Grid</strong></td>
    <td align="center"><strong>Board List - List</strong></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/mobile-board-list-grid.jpg" alt="Mobile Board List Grid" width="250"/></td>
    <td><img src="assets/screenshots/mobile-board-list-list.jpg" alt="Mobile Board List" width="250"/></td>
  </tr>
  <tr>
    <td align="center"><strong>Canvas</strong></td>
    <td align="center"><strong>Chat</strong></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/mobile-canvas.jpg" alt="Mobile Canvas" width="250"/></td>
    <td><img src="assets/screenshots/mobile-chat.jpg" alt="Mobile Chat" width="250"/></td>
  </tr>
</table>

</div>

---

## Architecture

<div align="center">

![System Architecture Dark](assets/architecture-dark.svg#gh-dark-mode-only)
![System Architecture Light](assets/architecture-light.svg#gh-light-mode-only)

</div>

**Traffic Flow:**

1. HTTPS requests terminate at host Nginx with SSL/TLS
2. Frontend Nginx serves static assets and proxies API/WebSocket
3. Spring Boot handles business logic with JWT validation
4. Real-time updates broadcast via ActiveMQ STOMP relay to subscribed clients

---

## Tech Stack

| Layer              | Technologies                                                    |
| :----------------- | :-------------------------------------------------------------- |
| **Frontend**       | React 19, TypeScript 5.9, Vite 7.2, SCSS Modules, Framer Motion |
| **Backend**        | Java 24, Spring Boot 3.5, Spring Security, Spring WebSocket     |
| **Database**       | PostgreSQL 17, Spring Data JPA                                  |
| **Messaging**      | ActiveMQ Artemis, STOMP Protocol                                |
| **Infrastructure** | Docker, Nginx, Let's Encrypt SSL                                |
| **Authentication** | JWT, OAuth2 (Google), SendGrid Email                            |

---

## Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/sagi-menahem/SynchBoard.git
cd SynchBoard

# Copy environment template
cp .env.example .env

# Start all services
docker-compose up --build
```

**Access Points:**

- Frontend: http://localhost
- Backend API: http://localhost:8080
- ActiveMQ Console: http://localhost:8161 (admin/admin)

### Local Development

```bash
# Start infrastructure only
docker-compose up -d postgres activemq

# Backend (from backend/)
gradlew.bat bootRun   # Windows
./gradlew bootRun     # Linux/Mac

# Frontend (from frontend/)
npm install && npm run dev
```

---

## Documentation

| Document                                                 | Description                               |
| :------------------------------------------------------- | :---------------------------------------- |
| [Installation Guide](docs/INSTALLATION.md)               | Local development & production deployment |
| [API Documentation](docs/API_DOCUMENTATION.md)           | REST API reference with examples          |
| [WebSocket Architecture](docs/WEBSOCKET_ARCHITECTURE.md) | Real-time communication & STOMP protocol  |
| [Authentication](docs/AUTHENTICATION.md)                 | JWT, OAuth2, and security implementation  |
| [Canvas Architecture](docs/CANVAS_ARCHITECTURE.md)       | Drawing system & object management        |
| [Database Schema](docs/DATABASE_SCHEMA.md)               | Entity relationships & data model         |
| [Docker Infrastructure](docs/DOCKER_INFRASTRUCTURE.md)   | Container setup & orchestration           |
| [Nginx Configuration](docs/NGINX_CONFIGURATION.md)       | Reverse proxy & SSL configuration         |
| [Security](docs/SECURITY.md)                             | Security measures & best practices        |
| [Error Handling](docs/ERROR_HANDLING.md)                 | Exception handling & error responses      |
| [Email Service](docs/EMAIL_SERVICE.md)                   | SendGrid integration & email templates    |
| [File Storage](docs/FILE_STORAGE.md)                     | Image uploads & file management           |
| [History Management](docs/HISTORY_MANAGEMENT.md)         | Undo/redo system implementation           |
| [Performance](docs/PERFORMANCE.md)                       | Optimization strategies & caching         |
| [Contributing](docs/CONTRIBUTING.md)                     | Contribution guidelines                   |

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built by Sagi Menahem**

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/sagi-menahem)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/sagi-menahem/)

</div>
