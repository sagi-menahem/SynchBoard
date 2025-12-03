# Canvas Architecture

This document describes the drawing and canvas system in SynchBoard, including object types, tool system, real-time synchronization, and rendering approach.

## Rendering Approach

SynchBoard uses the native **HTML5 Canvas API** with `CanvasRenderingContext2D` for all drawing operations.

### Canvas Component Structure

```
Canvas.tsx
├── Scroll Container (overflow scroll for panning)
│   ├── Canvas Wrapper (CSS transform for zoom)
│   │   └── <canvas> element
│   └── TextInputOverlay (positioned absolutely)
```

Key features:
- Two-finger panning and pinch-to-zoom via Pointer Events API
- Normalized coordinates (0-1) for platform-independent storage
- Inverted Y-axis scroll container positions scrollbar at top

## Object Types

All drawing objects are defined in `frontend/src/features/board/types/BoardObjectTypes.ts`:

| Type | Properties | Description |
|------|------------|-------------|
| **Line** | points[], color, lineWidth, tool (brush/eraser) | Freehand strokes |
| **Rectangle** | x, y, width, height, color, fillColor?, strokeWidth | Rectangles and squares |
| **Circle** | x, y, radius, color, fillColor?, strokeWidth | Perfect circles |
| **Triangle** | x1, y1, x2, y2, x3, y3, color, fillColor?, strokeWidth | Isosceles triangles |
| **Polygon** | x, y, radius, sides, color, fillColor?, strokeWidth | Regular polygons (pentagon, hexagon) |
| **TextBox** | x, y, width, height, text, fontSize, color | Text elements |
| **StraightLine** | x1, y1, x2, y2, color, strokeWidth, dashPattern? | Lines and dotted lines |
| **Arrow** | x1, y1, x2, y2, color, strokeWidth | Lines with arrowheads |

### Common Properties

All objects include:
- `instanceId`: Client-generated UUID for deduplication
- `tool`: Source tool type for rendering logic
- Coordinates normalized to 0-1 range

## Tool System

### Available Tools

Defined in `BoardConstants.ts`:

| Tool | Type | Description |
|------|------|-------------|
| `brush` | Freehand | Draw with stroke color |
| `eraser` | Freehand | Remove portions of drawing |
| `square` | Shape | Perfect squares (equal width/height) |
| `rectangle` | Shape | Independent width/height |
| `circle` | Shape | Perfect circles |
| `triangle` | Shape | Isosceles triangles |
| `pentagon` | Shape | 5-sided regular polygon |
| `hexagon` | Shape | 6-sided regular polygon |
| `star` | Shape | 5-pointed stars |
| `line` | Line | Straight lines |
| `dottedLine` | Line | Dashed lines |
| `arrow` | Line | Lines with arrowheads |
| `text` | Text | Text boxes |
| `colorPicker` | Utility | Sample colors from canvas |
| `recolor` | Utility | Change colors of existing objects |
| `download` | Utility | Export canvas as image |

### Tool Handler Architecture

Tools are implemented via `useDrawingTools.ts` using a handler map pattern:

```typescript
const toolHandlers = {
  brush: handleBrushOrEraser,
  eraser: handleBrushOrEraser,
  square: handleSquare,
  rectangle: handleRectangle,
  // ...
};
```

### Drawing Flow

1. **Pointer Down**: Initialize path (brush/eraser) or start point (shapes)
2. **Pointer Move**: Accumulate points or track current position for preview
3. **Pointer Up**: Generate `ActionPayload`, call `onDraw` callback

## Data Structures

### Frontend Types

```typescript
// Action payload sent to server
interface SendBoardActionRequest {
  boardId: number;
  type: 'OBJECT_ADD' | 'OBJECT_UPDATE' | 'OBJECT_DELETE';
  payload: ActionPayload;  // Union of all payload types
  instanceId: string;
  sender: string;
}

// Response from server broadcast
interface BoardActionResponse {
  type: string;
  payload: ActionPayload;
  sender: string;
  instanceId: string;
}
```

### Backend Entity

```java
@Entity
@Table(name = "board_objects")
public class BoardObject {
    @Id @GeneratedValue
    private Long objectId;

    private String instanceId;      // Client-generated ID

    @ManyToOne
    private GroupBoard board;

    @ManyToOne
    private User createdByUser;

    private String objectType;      // Shape type

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String objectData;      // Complete payload as JSONB

    private boolean isActive;       // Soft delete flag
}
```

## Real-Time Synchronization

### Message Flow

```
User A (Draw)              Backend                  User B (View)
     |                        |                          |
     |--SendBoardActionRequest-->|                       |
     |                        |                          |
     |               Save to DB (JSONB)                 |
     |               Create ActionHistory               |
     |                        |                          |
     |               Broadcast to /topic/board/{id}     |
     |                        |--BoardActionResponse-->  |
     |                        |                          |
     |<--Transaction Confirm--|                     Render
```

### WebSocket Destinations

| Direction | Destination | Purpose |
|-----------|-------------|---------|
| Client → Server | `/app/board.drawAction` | Send drawing actions |
| Server → Clients | `/topic/board/{boardId}` | Broadcast canvas updates |

### Action Types

- `OBJECT_ADD`: Create new drawing object
- `OBJECT_UPDATE`: Modify existing object (recolor)
- `OBJECT_DELETE`: Soft-delete object (undo)

### Optimistic Updates

1. Frontend renders action immediately on send
2. React 19's `useOptimistic` manages pending state
3. Server confirmation updates transaction status to 'confirmed'
4. `WebSocketService` maintains rollback callbacks for conflicts

## Canvas State Management

### Hook Composition

The canvas system uses multiple specialized hooks orchestrated by `useCanvas.ts`:

| Hook | Responsibility |
|------|----------------|
| `useCanvasState` | Core refs, dimensions, drawing state |
| `useCanvasEvents` | Pointer event handling, pan detection |
| `useCanvasInteractions` | Color picker, recolor, text input |
| `useDrawingTools` | Tool-specific drawing logic |
| `useCanvasPreview` | Real-time shape preview rendering |
| `useCanvasPanning` | Pan and pinch-to-zoom |

### State Refs

```typescript
const canvasRef = useRef<HTMLCanvasElement>();      // Canvas element
const containerRef = useRef<HTMLDivElement>();      // Scroll container
const contextRef = useRef<CanvasRenderingContext2D>();
const startPoint = useRef<Point>();                 // Drawing start
const currentPath = useRef<Point[]>();              // Brush path
```

## Coordinate System

### Normalization

All coordinates are stored normalized (0-1 range):

```typescript
// Storage: normalized
const normalizedX = pixelX / canvasWidth;

// Rendering: denormalized
const pixelX = normalizedX * canvasWidth;
```

This enables:
- Platform-independent storage
- Canvas resizing without data loss
- Consistent rendering across devices

### Conversion Functions

Located in `CanvasUtils.ts`:
- `normalizeCoordinates`: pixel → normalized
- `denormalizeCoordinates`: normalized → pixel

## Canvas Configuration

### Dimensions

| Setting | Value |
|---------|-------|
| Default | 1200 × 800 px |
| Minimum | 400 × 300 px |
| Maximum | 4000 × 4000 px |

**Presets**:
- Widescreen: 1920 × 1080
- Square: 1200 × 1200
- Portrait: 1080 × 1920
- Document: 1240 × 1754

### Drawing Parameters

| Parameter | Default | Range |
|-----------|---------|-------|
| Stroke Color | #FFFFFF | Any hex |
| Stroke Width | 3px | 1-50px |
| Line Style | round | - |

### Zoom

| Setting | Value |
|---------|-------|
| Min Zoom | 0.1× |
| Max Zoom | 5.0× |
| Default | 1.0× |

Zoom persisted in user preferences (debounced 500ms).

## Rendering

### Context Setup

```typescript
ctx.strokeStyle = color;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.lineWidth = strokeWidth;
ctx.globalCompositeOperation = 'source-over';
// For eraser: 'destination-out'
```

### Drawing Functions

Located in `CanvasUtils.ts`:

| Function | Object Type |
|----------|-------------|
| `drawLinePayload` | Brush/eraser strokes |
| `drawRectanglePayload` | Rectangles and squares |
| `drawCirclePayload` | Circles |
| `drawTrianglePayload` | Triangles |
| `drawPolygonPayload` | Regular polygons |
| `drawTextPayload` | Text boxes |
| `drawStraightLinePayload` | Straight/dotted lines |
| `drawArrowPayload` | Arrows |

### Point Optimization

For brush strokes, points are decimated before transmission:

```typescript
// Only if > 15 points
optimizeDrawingPoints(points, decimationFactor: 2);
```

Preserves endpoints for fidelity while reducing payload size.

## Panning and Gestures

### Desktop

- **Pan**: Middle mouse button drag
- **Zoom**: Not implemented (keyboard shortcuts planned)

### Mobile

- **Pan**: Two-finger drag
- **Zoom**: Pinch gesture
- **Draw**: Single finger

### Gesture Detection

- Threshold: 15px cumulative movement to disambiguate from clicks
- Two-pointer pinch detected by distance changes
- Gesture type locked once threshold exceeded

## Text Input

### Flow

1. User draws text box area with text tool
2. `handleText` calculates pixel coordinates
3. `TextInputOverlay` positioned over canvas
4. User types text
5. `handleTextSubmit` creates `TextBoxPayload`
6. `OBJECT_ADD` action sent via WebSocket

### Overlay Features

- Positioned absolutely over canvas
- Auto-adjusts for zoom scale
- Supports multiline text
- Inherits canvas color and font settings

## Hit Detection

For color picker and recolor tools:

```typescript
const pixelData = ctx.getImageData(x, y, 1, 1).data;
const isTransparent = pixelData[3] === 0;  // Alpha channel
```

Coordinates adjusted for zoom: `(clientX - rect.left) / zoomScale`

## Key Files

### Frontend

| File | Purpose |
|------|---------|
| `features/board/components/workspace/Canvas.tsx` | Main canvas component |
| `features/board/hooks/workspace/canvas/useCanvas.ts` | Hook orchestrator |
| `features/board/hooks/workspace/canvas/useDrawingTools.ts` | Tool handlers |
| `features/board/utils/CanvasUtils.ts` | Drawing functions |
| `features/board/types/BoardObjectTypes.ts` | TypeScript types |
| `features/board/constants/BoardConstants.ts` | Configuration |

### Backend

| File | Purpose |
|------|---------|
| `entity/BoardObject.java` | JPA entity |
| `service/board/BoardObjectService.java` | CRUD operations |
| `controller/BoardActivityController.java` | WebSocket handler |
| `dto/websocket/BoardActionDTO.java` | Message DTOs |
| `repository/BoardObjectRepository.java` | Data access |
