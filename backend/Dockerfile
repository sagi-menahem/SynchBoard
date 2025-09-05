# Multi-stage build for Spring Boot backend
FROM eclipse-temurin:24-jdk-alpine AS builder

# Set working directory
WORKDIR /app

# Copy gradle wrapper and build files
COPY gradlew gradlew.bat ./
COPY gradle ./gradle
COPY build.gradle settings.gradle gradle.properties ./

# Download dependencies (this layer will be cached)
RUN ./gradlew dependencies --no-daemon

# Copy source code
COPY src ./src

# Build the application
RUN ./gradlew bootJar --no-daemon

# Runtime stage
FROM eclipse-temurin:24-jre-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1000 spring && \
    adduser -D -u 1000 -G spring spring

# Set working directory
WORKDIR /app

# Create necessary directories
RUN mkdir -p /app/uploads /app/logs && \
    chown -R spring:spring /app

# Copy jar from builder stage
COPY --from=builder --chown=spring:spring /app/build/libs/*.jar app.jar

# Switch to non-root user
USER spring

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# JVM flags for Java 24
ENTRYPOINT ["java", \
    "--add-opens=java.base/sun.misc=ALL-UNNAMED", \
    "-XX:+UnlockExperimentalVMOptions", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", \
    "app.jar"]