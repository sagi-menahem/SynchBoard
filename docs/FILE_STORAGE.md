# File Storage

This document describes the file storage system in SynchBoard, including upload handling, validation, security measures, and serving configuration.

## Overview

SynchBoard uses a local file storage system for:
- User profile pictures
- Board pictures

Files are validated, stored with UUID naming, and served publicly via Spring MVC resource handlers or Nginx (in Docker).

## Storage Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `UPLOAD_DIRECTORY` | `./uploads` | Root directory for files |
| `MAX_FILE_SIZE_MB` | `10` | Spring multipart max file size |
| `MAX_REQUEST_SIZE_MB` | `10` | Spring max HTTP request size |

### Directory Structure

```
uploads/
├── [uuid].jpg
├── [uuid].png
├── [uuid].webp
├── [uuid].gif
└── [uuid].svg
```

UUID naming prevents:
- Filename conflicts
- Path traversal attacks
- Enumeration attacks

## File Validation

### Size Limits

- **Application Limit**: 5 MB (enforced in `FileStorageService`)
- **Spring Boot Limit**: 10 MB (configurable via `MAX_FILE_SIZE_MB`)

### Allowed MIME Types

```
image/jpeg
image/png
image/gif
image/webp
image/svg+xml
```

### Allowed Extensions

```
.jpg .jpeg .png .gif .webp .svg
```

### Binary Signature Validation

Files are validated by their binary headers to prevent type spoofing:

| Format | Signature |
|--------|-----------|
| JPEG | `0xFF 0xD8` |
| PNG | `0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A` |
| GIF | `0x47 0x49 0x46 0x38` |
| WebP | `RIFF` header + `WebP` marker |
| SVG | Content-based validation |

### SVG Security

SVG files are scanned for dangerous patterns:

**Blocked Content:**
- `<script>` tags
- JavaScript URLs (`javascript:`)
- Event handlers (`onclick`, `onload`, `onerror`, etc.)
- Embedded content (`<iframe>`, `<embed>`, `<object>`)
- Data URIs (`data:text/html`, `data:text/javascript`)
- DOM manipulation (`eval(`, `document.write`, `.innerHTML`)

## Upload Flow

### User Profile Picture

```
POST /api/user/profile-picture
Content-Type: multipart/form-data

file: [binary image data]
```

**Steps:**
1. Controller extracts user from JWT
2. Service deletes existing picture (if any)
3. FileStorageService validates and stores file
4. User entity updated with new URL
5. Broadcast update to shared boards

### Board Picture

```
POST /api/boards/{boardId}/picture
Content-Type: multipart/form-data

file: [binary image data]
```

**Steps:**
1. Controller validates user is board member
2. Service deletes existing picture (if any)
3. FileStorageService validates and stores file
4. Board entity updated with new URL
5. Broadcast update to board members

## FileStorageService Validation

```java
public String store(MultipartFile file) {
    // 1. Check file not empty
    // 2. Extract and clean filename
    // 3. Check for path traversal (.. sequences)
    // 4. Validate file size (< 5 MB)
    // 5. Validate MIME type in whitelist
    // 6. Validate extension in whitelist
    // 7. Validate binary signature matches type
    // 8. For SVG: scan for malicious patterns
    // 9. Generate UUID filename
    // 10. Store file
    // 11. Return path: /images/[uuid.ext]
}
```

## File Serving

### Local Development

Spring MVC serves files directly:

```java
registry.addResourceHandler("/images/**")
        .addResourceLocations("file:" + uploadDir + "/");
```

**Security Configuration:**
- `GET /images/**` is public (no authentication)
- `POST/DELETE /images/**` blocked

### Docker Deployment

**Backend Container:**
- Volume: `backend_uploads:/app/uploads`
- Files stored at `/app/uploads`

**Frontend Container (Nginx):**
- Same volume mounted read-only at `/usr/share/nginx/html/images`
- Nginx serves images directly (no backend proxy)

## Delete Operations

### User Profile Picture

```
DELETE /api/user/profile-picture
```

1. Extract filename from stored URL
2. Delete physical file
3. Set `profilePictureUrl` to null
4. Broadcast update

### Board Picture

```
DELETE /api/boards/{boardId}/picture
```

1. Validate user is board member
2. Delete physical file
3. Set `groupPictureUrl` to null
4. Broadcast update

**Note:** File deletion failures are logged but don't rollback database changes.

## URL Download

The system can download and store images from URLs:

```java
public String downloadAndStoreImageFromUrl(String imageUrl)
```

Used for:
- Google OAuth profile pictures
- URL-based board images

Features:
- Connection timeout: 5 seconds
- Read timeout: 10 seconds
- Same validation as uploads
- Returns null on failure

## Security Measures

| Measure | Purpose |
|---------|---------|
| Empty file check | Prevent empty uploads |
| Path traversal prevention | Block `..` sequences |
| Size limit (5 MB) | Prevent resource exhaustion |
| MIME type whitelist | Allow only images |
| Extension whitelist | Consistent with MIME types |
| Binary signature check | Prevent type spoofing |
| SVG content scan | Block XSS vectors |
| UUID naming | Prevent enumeration |
| Public GET only | Block unauthorized modifications |

## Error Messages

| Error | Condition |
|-------|-----------|
| "Cannot upload empty file" | File is empty |
| "File must have a name" | Missing filename |
| "Filename contains invalid path sequence" | Contains `..` |
| "File size exceeds maximum allowed size of 5 MB" | > 5 MB |
| "File type not allowed" | MIME type not in whitelist |
| "File extension not allowed" | Extension not in whitelist |
| "File content does not match its declared type" | Signature mismatch |
| "SVG file contains potentially malicious content" | Dangerous patterns |

## Database Storage

Pictures are stored as URL paths in entities:

```java
// User entity
private String profilePictureUrl;  // /images/[uuid].jpg

// GroupBoard entity
private String groupPictureUrl;    // /images/[uuid].png
```

## API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/user/profile-picture` | Required | Upload profile picture |
| DELETE | `/api/user/profile-picture` | Required | Delete profile picture |
| POST | `/api/boards/{id}/picture` | Member | Upload board picture |
| DELETE | `/api/boards/{id}/picture` | Member | Delete board picture |
| GET | `/images/**` | Public | Serve images |

## Key Files

| File | Purpose |
|------|---------|
| `service/storage/FileStorageService.java` | Core storage and validation |
| `constants/FileConstants.java` | Limits and allowed types |
| `config/MvcConfig.java` | Static file serving |
| `controller/UserController.java` | Profile picture endpoints |
| `controller/GroupBoardController.java` | Board picture endpoints |

## Troubleshooting

### "Uploads directory not found"

Ensure `UPLOAD_DIRECTORY` is set and the directory is writable.

### "Permission denied"

Check file system permissions:
- Local: Writable by user running backend
- Docker: Writable by container user

### "File content does not match type"

The file's binary header doesn't match its MIME type. Verify the actual file format.

### SVG upload rejected

Remove dangerous patterns:
- Script tags
- Event handlers
- Embedded objects
- Data URIs
