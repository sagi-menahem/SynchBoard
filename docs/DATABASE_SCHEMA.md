# Database Schema

This document describes the PostgreSQL database schema for SynchBoard, including entity relationships, JSONB structures, and design patterns.

## Entity Relationship Diagram

```
┌─────────────────────┐
│       User          │
│  (PK: email)        │
└─────────┬───────────┘
          │
          ├──────────────────────────────────────────────────────────┐
          │                                                          │
          ▼                                                          │
┌─────────────────────┐      ┌─────────────────────┐                │
│    GroupBoard       │◄─────│    GroupMember      │                │
│  (PK: boardGroupId) │      │  (PK: email+boardId)│                │
└─────────┬───────────┘      └────────────────────┬┘                │
          │                                       │                  │
          ├──────────────────┬────────────────────┘                  │
          │                  │                                       │
          ▼                  ▼                                       ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│    BoardObject      │    │      Message        │    │ PendingRegistration │
│  (PK: objectId)     │    │  (PK: messageId)    │    │    (PK: email)      │
└─────────┬───────────┘    └─────────────────────┘    └─────────────────────┘
          │
          ▼
┌─────────────────────┐
│   ActionHistory     │
│  (PK: actionId)     │
└─────────────────────┘
```

## Tables

### users

Primary user account table with authentication and preference storage.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| email | VARCHAR | PK, NOT NULL, UNIQUE | Primary identifier and login username |
| password | VARCHAR | NULL | Bcrypt hash; null for OAuth2 users |
| first_name | VARCHAR | NOT NULL | Display name |
| last_name | VARCHAR | NULL | Optional surname |
| gender | VARCHAR | NULL | Optional |
| auth_provider | VARCHAR | NOT NULL, DEFAULT 'LOCAL' | `LOCAL` or `GOOGLE` |
| provider_id | VARCHAR | NULL | OAuth2 provider user ID |
| phone_number | VARCHAR | NULL | Optional contact |
| date_of_birth | DATE | NULL | Optional |
| profile_picture_url | VARCHAR | NULL | Avatar image path |
| creation_date | TIMESTAMP | NOT NULL | Account creation time |
| email_verification_token | VARCHAR | NULL | Pending verification token |
| reset_code | VARCHAR(6) | NULL | Password reset code |
| reset_expiry | TIMESTAMP | NULL | Reset code expiration |

**User Preferences (stored in same table):**

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| board_background_setting | VARCHAR | NULL | Default board background |
| canvas_chat_split_ratio | INTEGER | 70 | Canvas/chat panel ratio |
| is_chat_open | BOOLEAN | true | Chat panel visibility |
| canvas_zoom_scale | DOUBLE | 1.0 | Default zoom (0.1-5.0) |
| default_tool | VARCHAR | 'brush' | Selected drawing tool |
| default_stroke_color | VARCHAR | '#000000' | Stroke color hex |
| default_stroke_width | INTEGER | 3 | Stroke width in pixels |
| dock_anchor | VARCHAR(20) | 'bottom-center' | Toolbar position |
| is_dock_minimized | BOOLEAN | false | Toolbar collapsed state |
| preferred_language | VARCHAR | 'en' | UI language code |
| theme_preference | VARCHAR(10) | 'light' | `light` or `dark` |
| board_list_view_mode | VARCHAR | 'grid' | `grid` or `list` |

---

### group_boards

Collaborative whiteboard definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| board_group_id | BIGSERIAL | PK | Auto-generated board ID |
| board_group_name | VARCHAR | NOT NULL | Display name |
| created_by_user | VARCHAR | FK → users.email, NULL | Creator; null if user deleted |
| invite_code | VARCHAR | UNIQUE | Shareable join code |
| group_picture_url | VARCHAR | NULL | Board thumbnail/cover |
| group_description | VARCHAR | NULL | Board description |
| creation_date | TIMESTAMP | NOT NULL | Board creation time |
| last_modified_date | TIMESTAMP | NULL | Last activity timestamp |
| canvas_background_color | VARCHAR | '#FFFFFF' | Canvas background hex |
| canvas_width | INTEGER | 3000 | Canvas width in pixels |
| canvas_height | INTEGER | 2000 | Canvas height in pixels |

---

### group_members

Join table for user-board membership with role assignment.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_email | VARCHAR | PK (composite), FK → users.email | Member email |
| board_group_id | BIGINT | PK (composite), FK → group_boards.board_group_id | Board ID |
| is_admin | BOOLEAN | NOT NULL | Admin role flag |
| join_date | TIMESTAMP | NOT NULL | Membership start time |

**Composite Primary Key:** `(user_email, board_group_id)`

---

### board_objects

Canvas drawing objects stored with JSONB data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| object_id | BIGSERIAL | PK | Auto-generated object ID |
| instance_id | VARCHAR | NOT NULL | Client-generated UUID |
| board_group_id | BIGINT | FK → group_boards.board_group_id, NOT NULL | Parent board |
| created_by_user | VARCHAR | FK → users.email, NULL | Creator |
| object_type | VARCHAR | NOT NULL | `shape`, `line`, `text`, `image`, etc. |
| object_data | JSONB | NULL | Complete object properties |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Soft delete flag |
| creation_timestamp | TIMESTAMP | NOT NULL | Object creation time |
| last_edited_timestamp | TIMESTAMP | NULL | Last modification time |
| last_edited_by_user | VARCHAR | FK → users.email, NULL | Last editor |

**Unique Constraint:** `(instance_id, board_group_id)` - Ensures unique instance IDs per board

---

### messages

Board chat messages.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| message_id | BIGSERIAL | PK | Auto-generated message ID |
| board_group_id | BIGINT | FK → group_boards.board_group_id, NOT NULL | Parent board |
| sender | VARCHAR | FK → users.email, NULL | Message author |
| message_content | TEXT | NOT NULL | Message body |
| sender_full_name_snapshot | VARCHAR | NOT NULL | Sender name at send time |
| timestamp | TIMESTAMP | NOT NULL | Send time |

---

### action_history

Undo/redo history with state snapshots.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| action_id | BIGSERIAL | PK | Auto-generated action ID |
| board_group_id | BIGINT | FK → group_boards.board_group_id, NOT NULL | Parent board |
| user_email | VARCHAR | FK → users.email, NOT NULL | Actor |
| board_object_id | BIGINT | FK → board_objects.object_id, NOT NULL | Affected object |
| action_type | VARCHAR | NOT NULL | `ADD`, `UPDATE`, `DELETE` |
| state_before | JSONB | NULL | Object state before action |
| state_after | JSONB | NULL | Object state after action |
| is_undone | BOOLEAN | NOT NULL, DEFAULT false | Undo status flag |
| timestamp | TIMESTAMP | NOT NULL | Action time |

---

### pending_registrations

Temporary storage for unverified registrations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| email | VARCHAR | PK, NOT NULL, UNIQUE | Registration email |
| first_name | VARCHAR | NOT NULL | User's first name |
| last_name | VARCHAR | NULL | Optional surname |
| hashed_password | VARCHAR | NOT NULL | Bcrypt hash |
| gender | VARCHAR | NULL | Optional |
| phone_number | VARCHAR | NULL | Optional |
| date_of_birth | DATE | NULL | Optional |
| verification_code | VARCHAR(6) | NOT NULL | 6-digit code |
| expiry_time | TIMESTAMP | NOT NULL | Code expiration |
| attempts | INTEGER | NOT NULL, DEFAULT 0 | Verification attempts |
| created_at | TIMESTAMP | NOT NULL | Registration time |

---

## JSONB Schemas

### BoardObject.objectData

The `object_data` column stores drawing object properties as JSONB. Structure varies by `object_type`:

**Common Properties (all types):**
```json
{
  "x": 100,
  "y": 200,
  "rotation": 0,
  "opacity": 1.0,
  "strokeColor": "#000000",
  "strokeWidth": 2,
  "fillColor": "#FFFFFF"
}
```

**Shape-specific (`rectangle`, `ellipse`, `triangle`):**
```json
{
  "width": 150,
  "height": 100,
  "cornerRadius": 0
}
```

**Line/Arrow:**
```json
{
  "points": [0, 0, 100, 50],
  "startArrow": false,
  "endArrow": true
}
```

**Freehand (`brush`, `pencil`):**
```json
{
  "points": [0, 0, 5, 3, 10, 8, ...],
  "tension": 0.5
}
```

**Text:**
```json
{
  "text": "Hello World",
  "fontSize": 16,
  "fontFamily": "Arial",
  "fontStyle": "normal",
  "textAlign": "left"
}
```

**Image:**
```json
{
  "src": "/uploads/image-uuid.png",
  "width": 300,
  "height": 200,
  "cropX": 0,
  "cropY": 0
}
```

### ActionHistory.stateBefore / stateAfter

Complete snapshots of `BoardObject` state for undo/redo:

```json
{
  "instanceId": "uuid-string",
  "objectType": "rectangle",
  "objectData": { /* same structure as above */ },
  "isActive": true
}
```

---

## Design Patterns

### Soft Deletes

`BoardObject` uses the `is_active` boolean flag instead of hard deletes. This enables:
- Undo/redo functionality (restoring deleted objects)
- Audit trail preservation
- Cascading relationship integrity

Query pattern: Always filter with `WHERE is_active = true` for active objects.

### Composite Keys

`GroupMember` uses a composite primary key `(user_email, board_group_id)` instead of a surrogate key. Benefits:
- Natural representation of the many-to-many relationship
- Prevents duplicate memberships at the database level
- Efficient lookups by either user or board

### Snapshot Pattern

`Message.sender_full_name_snapshot` captures the sender's display name at message creation time. This ensures:
- Historical accuracy if users change their names
- Display consistency in chat history
- No need for complex joins when displaying old messages

### Lazy Loading

All JPA relationships use `FetchType.LAZY` to prevent N+1 query issues and reduce memory overhead. Related entities are loaded only when explicitly accessed.

---

## Schema Management

The schema is managed through JPA/Hibernate DDL auto-update:

```properties
JPA_DDL_AUTO=update
```

- **Development:** Uses `update` mode for automatic schema evolution
- **Production:** Consider using `validate` with manual migrations

No explicit migration tool (Flyway/Liquibase) is currently configured. Schema changes are applied automatically based on entity modifications.
