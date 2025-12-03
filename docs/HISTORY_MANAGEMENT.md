# History Management

This document describes the undo/redo history system in SynchBoard, including action tracking, state restoration, and multi-user collaboration.

## Overview

SynchBoard uses a database-backed action history system that:

- Tracks all drawing operations per board
- Stores object state snapshots for restoration
- Uses soft deletion for reversible object removal
- Broadcasts changes to all board members in real-time

## Action Types

Three action types are tracked:

| Action          | Description        | Undo Behavior          | Redo Behavior      |
| --------------- | ------------------ | ---------------------- | ------------------ |
| `OBJECT_ADD`    | New object created | Soft delete object     | Restore object     |
| `OBJECT_UPDATE` | Object modified    | Restore previous state | Apply new state    |
| `OBJECT_DELETE` | Object deleted     | Restore object         | Soft delete object |

## Data Model

### ActionHistory Entity

```java
@Entity
@Table(name = "action_history")
public class ActionHistory {

  @Id
  @GeneratedValue
  private Long actionId;

  @ManyToOne
  private GroupBoard board;

  @ManyToOne
  private User user;

  @ManyToOne
  private BoardObject boardObject;

  private String actionType; // CREATE, UPDATE, DELETE
  private LocalDateTime timestamp;

  @JdbcTypeCode(SqlTypes.JSON)
  private String stateBefore; // Object state before action

  @JdbcTypeCode(SqlTypes.JSON)
  private String stateAfter; // Object state after action

  private boolean isUndone; // Tracks undo state
}
```

### State Snapshots

| Action | stateBefore   | stateAfter  |
| ------ | ------------- | ----------- |
| ADD    | `null`        | Object JSON |
| UPDATE | Previous JSON | New JSON    |
| DELETE | Object JSON   | `null`      |

### Soft Delete

Objects use `isActive` flag for soft deletion:

```java
@Column(name = "is_active")
private boolean isActive; // true: visible, false: deleted
```

This allows:

- Reversible deletion
- Audit trail preservation
- Clean undo/redo semantics

## Undo/Redo Algorithm

### Undo

1. Find most recent action where `isUndone = false`
2. Process based on action type:
   - **ADD**: Set `boardObject.isActive = false`
   - **UPDATE**: Restore `stateBefore` to object
   - **DELETE**: Set `boardObject.isActive = true`
3. Mark action as `isUndone = true`
4. Broadcast result to all board members

### Redo

1. Find most recent action where `isUndone = true`
2. Process based on action type:
   - **ADD**: Set `boardObject.isActive = true`
   - **UPDATE**: Apply `stateAfter` to object
   - **DELETE**: Set `boardObject.isActive = false`
3. Mark action as `isUndone = false`
4. Broadcast result to all board members

### Stack Behavior

```
New action created:
├─ redoCount = 0      (redo stack cleared)
└─ undoCount += 1

Undo performed:
├─ isUndone = true
├─ undoCount -= 1
└─ redoCount += 1

Redo performed:
├─ isUndone = false
├─ undoCount += 1
└─ redoCount -= 1
```

New actions clear the redo stack (standard UX pattern).

## API Endpoints

| Method | Path                         | Response                          |
| ------ | ---------------------------- | --------------------------------- |
| POST   | `/api/boards/{boardId}/undo` | 200 with action or 204 No Content |
| POST   | `/api/boards/{boardId}/redo` | 200 with action or 204 No Content |

### Response Format

```json
{
  "type": "OBJECT_DELETE",
  "payload": {
    /* restored object data */
  },
  "sender": "system-undo-redo",
  "instanceId": "abc123"
}
```

## Frontend State Management

### useBoardActions Hook

```typescript
const {
  undoCount, // Number of undoable actions
  redoCount, // Number of redoable actions
  isUndoAvailable, // Boolean for button state
  isRedoAvailable, // Boolean for button state
  handleUndo, // Trigger undo
  handleRedo, // Trigger redo
  resetCounts, // Initialize on board load
  incrementUndo, // Called when new action created
} = useBoardActions(boardId);
```

### UI Integration

The `FloatingActions` component displays undo/redo buttons:

```typescript
<Button
  onClick={handleUndo}
  disabled={!isUndoAvailable}
>
  <Undo2 />
</Button>
<Button
  onClick={handleRedo}
  disabled={!isRedoAvailable}
>
  <Redo2 />
</Button>
```

Features:

- Buttons disabled when stack empty
- Toast notifications for empty stacks
- RTL/LTR aware positioning

## Multi-User Considerations

### Per-Board History

- Single action timeline shared across all board members
- Actions queried by timestamp (most recent first)
- Any member can undo/redo any action

### Real-Time Broadcasting

1. User triggers undo/redo via HTTP POST
2. Backend processes and updates database
3. Result broadcast via WebSocket to `/topic/board/{boardId}`
4. All members' canvases update in real-time

### Access Control

- Validates user is board member before operations
- Throws `AccessDeniedException` if unauthorized

## State Lifecycle Example

```
User draws rectangle:
├─ Canvas emits action via WebSocket
├─ Backend saves BoardObject (isActive=true)
├─ Backend creates ActionHistory (isUndone=false)
├─ Broadcast to all members
└─ Frontend: undoCount++

User clicks Undo:
├─ HTTP POST /api/boards/{id}/undo
├─ Backend: Set boardObject.isActive=false
├─ Backend: Set actionHistory.isUndone=true
├─ Broadcast OBJECT_DELETE to members
└─ Frontend: undoCount--, redoCount++

User clicks Redo:
├─ HTTP POST /api/boards/{id}/redo
├─ Backend: Set boardObject.isActive=true
├─ Backend: Set actionHistory.isUndone=false
├─ Broadcast OBJECT_ADD to members
└─ Frontend: undoCount++, redoCount--
```

## Database Schema

```sql
CREATE TABLE action_history (
  action_id BIGINT PRIMARY KEY,
  board_group_id BIGINT REFERENCES group_boards,
  user_email VARCHAR REFERENCES users,
  object_id BIGINT REFERENCES board_objects,
  action_type VARCHAR NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  state_before JSONB,
  state_after JSONB,
  is_undone BOOLEAN DEFAULT false
);

CREATE INDEX idx_action_history_board_undone
  ON action_history(board_group_id, is_undone, timestamp DESC);
```

## History Limits

Currently, all actions are retained indefinitely. Cleanup occurs:

- When board is deleted: `deleteAllByBoard_BoardGroupId()`
- When user account is deleted: `deleteAllByUser_Email()`

## Error Handling

| Scenario           | Backend Response | Frontend Behavior        |
| ------------------ | ---------------- | ------------------------ |
| No actions to undo | 204 No Content   | Toast: "Nothing to undo" |
| No actions to redo | 204 No Content   | Toast: "Nothing to redo" |
| User not member    | 403 Forbidden    | Error toast              |
| Object not found   | 404 Not Found    | Error toast              |

## Key Files

### Backend

| File                                      | Purpose                 |
| ----------------------------------------- | ----------------------- |
| `entity/ActionHistory.java`               | History entity          |
| `entity/BoardObject.java`                 | Object with soft delete |
| `service/board/ActionHistoryService.java` | Undo/redo logic         |
| `repository/ActionHistoryRepository.java` | History queries         |
| `controller/GroupBoardController.java`    | REST endpoints          |

### Frontend

| File                                                      | Purpose          |
| --------------------------------------------------------- | ---------------- |
| `features/board/hooks/workspace/useBoardActions.ts`       | State management |
| `features/board/components/workspace/FloatingActions.tsx` | UI buttons       |
| `features/board/services/boardService.ts`                 | API calls        |
