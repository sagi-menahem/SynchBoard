<div align="center">
  <img src="assets/logo.png" alt="SynchBoard Logo" width="150"/>
  <h1>SynchBoard - Real-time Collaborative Whiteboard</h1>
  <p>A full-stack collaborative whiteboard application featuring real-time synchronization, user authentication, and team collaboration tools.</p>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Java-24-blue?logo=openjdk" alt="Java">
  <img src="https://img.shields.io/badge/Spring_Boot-3.5.5-green?logo=spring" alt="Spring Boot">
  <img src="https://img.shields.io/badge/React-19.1.1-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.9.2-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Docker-gray?logo=docker" alt="Docker">
</div>

---

## ✨ Preview

<div align="center">
  <img src="assets/preview.png" alt="SynchBoard Application Preview" />
  <p><i>SynchBoard workspace showing real-time collaborative drawing and team chat functionality</i></p>
</div>

---

## 🚀 Key Features

- **Real-time Collaboration**: Multiple users can draw and edit simultaneously with instant synchronization.
- **User Authentication**: Secure JWT-based authentication with email verification and password reset.
- **OAuth2 Integration**: Sign in with Google for seamless access.
- **Board Management**: Create, share, and manage collaborative boards with team members.
- **Drawing Tools**: Comprehensive set of drawing tools including shapes, lines, text, and colors.
- **Chat System**: Real-time messaging within boards for effective team communication.
- **Member Management**: Invite users via email and manage board permissions (Admin/Member).
- **Responsive Design**: Optimized for desktop and tablet devices.
- **Internationalization**: Full support for English and Hebrew (RTL).
- **Theme Support**: Light and Dark visual themes for a personalized experience.

---

## 🌟 Features Showcase

<div align="center">
  <img src="assets/features-showcase.png" alt="Features Showcase" />
  <p><i>Multiple screens showcasing different themes, languages, and collaborative features</i></p>
</div>

---

## 🛠️ Tech Stack

| Backend | Frontend | Infrastructure |
|:-----------------------------:|:-----------------------------------:|:---------------------------:|
| Java 24 + Spring Boot 3.5.5 | React 19.1.1 + TypeScript 5.9.2 | Docker & Docker Compose |
| Spring Security + JWT | Vite 7.0.0 + SCSS Modules | Nginx Reverse Proxy |
| Spring WebSocket + STOMP | @stomp/stompjs WebSocket | PostgreSQL 17 Database |
| PostgreSQL + ActiveMQ Artemis | React Router + i18next | ActiveMQ Message Broker |
| SendGrid Email + OAuth2 Google| Axios HTTP Client | Multi-stage Docker Builds |

---

## 🏁 Getting Started

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/sagi-menahem/SynchBoard.git](https://github.com/sagi-menahem/SynchBoard.git)
    cd SynchBoard
    ```

2.  **Copy environment file**
    ```bash
    cp .env.example .env
    ```
    > **Note:** The `.env` file includes optional API keys for email and Google login features. For basic operation, no changes are needed.

3.  **Start the application**
    ```bash
    docker-compose up --build
    ```

4.  **Access the application**
    -   **Frontend**: http://localhost
    -   **Backend API**: http://localhost:8080
    -   **ActiveMQ Console**: http://localhost:8161 (admin/admin)

---

## 📚 Full Documentation

-   **[User Manual](docs/User_Manual.pdf)** - Comprehensive technical guide covering all features and functionality.
-   **[Functional Document](docs/Functional_Document.pdf)** - Screen-by-screen feature walkthrough with visual examples.
-   **[API Documentation](docs/API_DOCUMENTATION.md)** - Detailed API endpoint guide for developers.
-   **[Installation Guide](docs/INSTALLATION.md)** - Advanced setup instructions and local development guide.

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Sagi Menahem** - Full Stack Developer
<br />
GitHub: [@sagi-menahem](https://github.com/sagi-menahem)