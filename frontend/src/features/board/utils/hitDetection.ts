import type { ActionPayload, Point } from 'features/board/types/BoardObjectTypes';

// =============================================================================
// TYPES
// =============================================================================

export interface HitResult {
  hit: boolean;
  object?: ActionPayload;
  hitType?: 'fill' | 'stroke' | 'object';
}

interface HitTestContext {
  clickPoint: Point;
  canvasWidth: number;
  canvasHeight: number;
}

type HitTestHandler = (obj: ActionPayload, ctx: HitTestContext) => HitResult | null;

/**
 * Tests if a point lies within the bounds of a rectangle using normalized coordinates.
 * Converts normalized rectangle coordinates to pixel coordinates and performs
 * boundary checking to determine if the point falls inside the rectangular area.
 * Essential for hit detection on rectangular shapes and UI elements.
 *
 * @param point - Point coordinates in pixels to test
 * @param x - Rectangle left edge in normalized coordinates (0-1)
 * @param y - Rectangle top edge in normalized coordinates (0-1)
 * @param width - Rectangle width in normalized coordinates (0-1)
 * @param height - Rectangle height in normalized coordinates (0-1)
 * @param canvasWidth - Canvas width in pixels for coordinate conversion
 * @param canvasHeight - Canvas height in pixels for coordinate conversion
 * @returns True if point is inside the rectangle bounds
 */
export const isPointInRectangle = (
  point: Point,
  x: number,
  y: number,
  width: number,
  height: number,
  canvasWidth: number,
  canvasHeight: number,
): boolean => {
  const rectX = x * canvasWidth;
  const rectY = y * canvasHeight;
  const rectWidth = width * canvasWidth;
  const rectHeight = height * canvasHeight;

  return (
    point.x >= rectX &&
    point.x <= rectX + rectWidth &&
    point.y >= rectY &&
    point.y <= rectY + rectHeight
  );
};

/**
 * Tests if a point lies on the border/stroke of a rectangle with tolerance for stroke width.
 * Uses stroke width to create a tolerance zone around each edge of the rectangle,
 * allowing for accurate hit detection on rectangle borders even with thick strokes.
 * Checks all four edges (left, right, top, bottom) for proximity to the point.
 *
 * @param point - Point coordinates in pixels to test
 * @param x - Rectangle left edge in normalized coordinates (0-1)
 * @param y - Rectangle top edge in normalized coordinates (0-1)
 * @param width - Rectangle width in normalized coordinates (0-1)
 * @param height - Rectangle height in normalized coordinates (0-1)
 * @param strokeWidth - Stroke thickness for tolerance calculation
 * @param canvasWidth - Canvas width in pixels for coordinate conversion
 * @param canvasHeight - Canvas height in pixels for coordinate conversion
 * @returns True if point is within stroke tolerance of rectangle border
 */
export const isPointOnRectangleBorder = (
  point: Point,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeWidth: number,
  canvasWidth: number,
  canvasHeight: number,
): boolean => {
  const rectX = x * canvasWidth;
  const rectY = y * canvasHeight;
  const rectWidth = width * canvasWidth;
  const rectHeight = height * canvasHeight;
  const tolerance = Math.max(strokeWidth / 2, 3); // Minimum 3px ensures clickable border even for thin strokes

  const nearLeftEdge =
    Math.abs(point.x - rectX) <= tolerance &&
    point.y >= rectY - tolerance &&
    point.y <= rectY + rectHeight + tolerance;
  const nearRightEdge =
    Math.abs(point.x - (rectX + rectWidth)) <= tolerance &&
    point.y >= rectY - tolerance &&
    point.y <= rectY + rectHeight + tolerance;
  const nearTopEdge =
    Math.abs(point.y - rectY) <= tolerance &&
    point.x >= rectX - tolerance &&
    point.x <= rectX + rectWidth + tolerance;
  const nearBottomEdge =
    Math.abs(point.y - (rectY + rectHeight)) <= tolerance &&
    point.x >= rectX - tolerance &&
    point.x <= rectX + rectWidth + tolerance;

  return nearLeftEdge || nearRightEdge || nearTopEdge || nearBottomEdge;
};

/**
 * Tests if a point lies within the bounds of a circle using normalized coordinates.
 * Calculates the distance from the point to the circle center and compares it
 * to the circle radius to determine if the point is inside the circular area.
 * Uses Euclidean distance formula for precise circular boundary detection.
 *
 * @param point - Point coordinates in pixels to test
 * @param centerX - Circle center X coordinate in normalized coordinates (0-1)
 * @param centerY - Circle center Y coordinate in normalized coordinates (0-1)
 * @param radius - Circle radius in normalized coordinates (0-1)
 * @param canvasWidth - Canvas width in pixels for coordinate conversion
 * @param canvasHeight - Canvas height in pixels for coordinate conversion
 * @returns True if point is inside the circle bounds
 */
export const isPointInCircle = (
  point: Point,
  centerX: number,
  centerY: number,
  radius: number,
  canvasWidth: number,
  canvasHeight: number,
): boolean => {
  const circleX = centerX * canvasWidth;
  const circleY = centerY * canvasHeight;
  const circleRadius = radius * canvasWidth;

  const distance = Math.sqrt(Math.pow(point.x - circleX, 2) + Math.pow(point.y - circleY, 2));
  return distance <= circleRadius;
};

/**
 * Tests if a point lies on the border/stroke of a circle with tolerance for stroke width.
 * Calculates the distance from the point to the circle center and checks if it's
 * approximately equal to the radius within the stroke width tolerance. Essential
 * for detecting clicks on circle outlines and borders in drawing applications.
 *
 * @param point - Point coordinates in pixels to test
 * @param centerX - Circle center X coordinate in normalized coordinates (0-1)
 * @param centerY - Circle center Y coordinate in normalized coordinates (0-1)
 * @param radius - Circle radius in normalized coordinates (0-1)
 * @param strokeWidth - Stroke thickness for tolerance calculation
 * @param canvasWidth - Canvas width in pixels for coordinate conversion
 * @param canvasHeight - Canvas height in pixels for coordinate conversion
 * @returns True if point is within stroke tolerance of circle border
 */
export const isPointOnCircleBorder = (
  point: Point,
  centerX: number,
  centerY: number,
  radius: number,
  strokeWidth: number,
  canvasWidth: number,
  canvasHeight: number,
): boolean => {
  const circleX = centerX * canvasWidth;
  const circleY = centerY * canvasHeight;
  const circleRadius = radius * canvasWidth;
  const tolerance = Math.max(strokeWidth / 2, 3); // Minimum 3px ensures clickable border even for thin strokes

  const distance = Math.sqrt(Math.pow(point.x - circleX, 2) + Math.pow(point.y - circleY, 2));
  return Math.abs(distance - circleRadius) <= tolerance;
};

/**
 * Tests if a point lies within the bounds of a triangle using barycentric coordinates.
 * Uses mathematical barycentric coordinate calculation to determine if a point
 * is inside the triangle formed by three vertices. Handles degenerate triangles
 * by checking for near-zero denominators and returns false for invalid triangles.
 *
 * @param point - Point coordinates in pixels to test
 * @param x1 - First vertex X coordinate in normalized coordinates (0-1)
 * @param y1 - First vertex Y coordinate in normalized coordinates (0-1)
 * @param x2 - Second vertex X coordinate in normalized coordinates (0-1)
 * @param y2 - Second vertex Y coordinate in normalized coordinates (0-1)
 * @param x3 - Third vertex X coordinate in normalized coordinates (0-1)
 * @param y3 - Third vertex Y coordinate in normalized coordinates (0-1)
 * @param canvasWidth - Canvas width in pixels for coordinate conversion
 * @param canvasHeight - Canvas height in pixels for coordinate conversion
 * @returns True if point is inside the triangle bounds
 */
export const isPointInTriangle = (
  point: Point,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  canvasWidth: number,
  canvasHeight: number,
): boolean => {
  const p1x = x1 * canvasWidth;
  const p1y = y1 * canvasHeight;
  const p2x = x2 * canvasWidth;
  const p2y = y2 * canvasHeight;
  const p3x = x3 * canvasWidth;
  const p3y = y3 * canvasHeight;

  // Calculate triangle area using cross product determinant
  const denominator = (p2y - p3y) * (p1x - p3x) + (p3x - p2x) * (p1y - p3y);
  if (Math.abs(denominator) < 1e-10) {
    // Numerical precision threshold for degenerate triangle detection (collinear points)
    return false;
  }

  // Calculate barycentric coordinates using cross products - mathematical approach for point-in-triangle testing
  const a = ((p2y - p3y) * (point.x - p3x) + (p3x - p2x) * (point.y - p3y)) / denominator;
  const b = ((p3y - p1y) * (point.x - p3x) + (p1x - p3x) * (point.y - p3y)) / denominator;
  const c = 1 - a - b; // Third coordinate calculated from constraint that a+b+c=1

  return a >= 0 && b >= 0 && c >= 0;
};

/**
 * Tests if a point lies on the border/stroke of a triangle with tolerance for stroke width.
 * Checks the distance from the point to each of the three triangle edges,
 * using line segment distance calculation to determine if the point is close
 * enough to any edge to be considered a hit on the triangle border.
 *
 * @param point - Point coordinates in pixels to test
 * @param x1 - First vertex X coordinate in normalized coordinates (0-1)
 * @param y1 - First vertex Y coordinate in normalized coordinates (0-1)
 * @param x2 - Second vertex X coordinate in normalized coordinates (0-1)
 * @param y2 - Second vertex Y coordinate in normalized coordinates (0-1)
 * @param x3 - Third vertex X coordinate in normalized coordinates (0-1)
 * @param y3 - Third vertex Y coordinate in normalized coordinates (0-1)
 * @param strokeWidth - Stroke thickness for tolerance calculation
 * @param canvasWidth - Canvas width in pixels for coordinate conversion
 * @param canvasHeight - Canvas height in pixels for coordinate conversion
 * @returns True if point is within stroke tolerance of triangle border
 */
export const isPointOnTriangleBorder = (
  point: Point,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  strokeWidth: number,
  canvasWidth: number,
  canvasHeight: number,
): boolean => {
  const tolerance = Math.max(strokeWidth / 2, 3); // Minimum 3px ensures clickable border even for thin strokes

  const edges = [
    { x1: x1 * canvasWidth, y1: y1 * canvasHeight, x2: x2 * canvasWidth, y2: y2 * canvasHeight },
    { x1: x2 * canvasWidth, y1: y2 * canvasHeight, x2: x3 * canvasWidth, y2: y3 * canvasHeight },
    { x1: x3 * canvasWidth, y1: y3 * canvasHeight, x2: x1 * canvasWidth, y2: y1 * canvasHeight },
  ];

  return edges.some(
    (edge) => distanceToLineSegment(point, edge.x1, edge.y1, edge.x2, edge.y2) <= tolerance,
  );
};

/**
 * Tests if a point lies within the bounds of a regular polygon using ray casting algorithm.
 * Generates polygon vertices mathematically based on center, radius, and side count,
 * then uses the ray casting algorithm to determine if the point is inside the polygon.
 * Works with any regular polygon (pentagon, hexagon, octagon, etc.).
 *
 * @param point - Point coordinates in pixels to test
 * @param centerX - Polygon center X coordinate in normalized coordinates (0-1)
 * @param centerY - Polygon center Y coordinate in normalized coordinates (0-1)
 * @param radius - Polygon radius in normalized coordinates (0-1)
 * @param sides - Number of polygon sides (e.g., 5 for pentagon, 6 for hexagon)
 * @param canvasWidth - Canvas width in pixels for coordinate conversion
 * @param canvasHeight - Canvas height in pixels for coordinate conversion
 * @returns True if point is inside the polygon bounds
 */
export const isPointInPolygon = (
  point: Point,
  centerX: number,
  centerY: number,
  radius: number,
  sides: number,
  canvasWidth: number,
  canvasHeight: number,
): boolean => {
  const radiusScale = Math.min(canvasWidth, canvasHeight);
  const actualRadius = radius * radiusScale;
  const actualCenterX = centerX * canvasWidth;
  const actualCenterY = centerY * canvasHeight;

  const vertices: Point[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    vertices.push({
      x: actualCenterX + actualRadius * Math.cos(angle),
      y: actualCenterY + actualRadius * Math.sin(angle),
    });
  }

  // Ray casting algorithm: cast horizontal ray from point and count intersections
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    // Check if edge crosses the horizontal ray from the test point
    if (
      vertices[i].y > point.y !== vertices[j].y > point.y &&
      // Calculate X intersection of edge with horizontal ray through test point
      point.x <
        ((vertices[j].x - vertices[i].x) * (point.y - vertices[i].y)) /
          (vertices[j].y - vertices[i].y) +
          vertices[i].x
    ) {
      // Toggle inside state for each intersection (odd = inside, even = outside)
      inside = !inside;
    }
  }

  return inside;
};

/**
 * Tests if a point lies within the bounds of a five-pointed star using ray casting algorithm.
 * Generates star vertices with alternating outer and inner radii to create the classic
 * star shape, then uses ray casting to determine point inclusion. The inner radius
 * is calculated as 40% of the outer radius for proper star proportions.
 *
 * @param point - Point coordinates in pixels to test
 * @param centerX - Star center X coordinate in normalized coordinates (0-1)
 * @param centerY - Star center Y coordinate in normalized coordinates (0-1)
 * @param radius - Star outer radius in normalized coordinates (0-1)
 * @param canvasWidth - Canvas width in pixels for coordinate conversion
 * @param canvasHeight - Canvas height in pixels for coordinate conversion
 * @returns True if point is inside the star bounds
 */
export const isPointInStar = (
  point: Point,
  centerX: number,
  centerY: number,
  radius: number,
  canvasWidth: number,
  canvasHeight: number,
): boolean => {
  const radiusScale = Math.min(canvasWidth, canvasHeight);
  const outerRadius = radius * radiusScale;
  const innerRadius = outerRadius * 0.4; // 40% inner radius creates classic star proportions
  const actualCenterX = centerX * canvasWidth;
  const actualCenterY = centerY * canvasHeight;
  const points = 5; // Five-pointed star is the standard star shape

  const vertices: Point[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    vertices.push({
      x: actualCenterX + r * Math.cos(angle),
      y: actualCenterY + r * Math.sin(angle),
    });
  }

  // Ray casting algorithm: cast horizontal ray from point and count intersections
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    // Check if edge crosses the horizontal ray from the test point
    if (
      vertices[i].y > point.y !== vertices[j].y > point.y &&
      // Calculate X intersection of edge with horizontal ray through test point
      point.x <
        ((vertices[j].x - vertices[i].x) * (point.y - vertices[i].y)) /
          (vertices[j].y - vertices[i].y) +
          vertices[i].x
    ) {
      // Toggle inside state for each intersection (odd = inside, even = outside)
      inside = !inside;
    }
  }

  return inside;
};

/**
 * Calculates the minimum distance from a point to a line segment.
 * Uses vector projection to find the closest point on the line segment,
 * handling cases where the closest point is beyond the segment endpoints
 * by clamping to the segment bounds. Essential for line hit detection.
 *
 * @param point - Point coordinates in pixels
 * @param x1 - Line segment start X coordinate in pixels
 * @param y1 - Line segment start Y coordinate in pixels
 * @param x2 - Line segment end X coordinate in pixels
 * @param y2 - Line segment end Y coordinate in pixels
 * @returns Minimum distance from point to line segment in pixels
 */
export const distanceToLineSegment = (
  point: Point,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number => {
  const A = point.x - x1;
  const B = point.y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  // Calculate dot product for vector projection
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;

  // Handle degenerate case where line segment has zero length
  if (lenSq === 0) {
    return Math.sqrt(A * A + B * B);
  }

  // Calculate projection parameter and clamp to segment bounds [0,1]
  let param = dot / lenSq; // Vector projection: dot product divided by squared length gives parameter t
  param = Math.max(0, Math.min(1, param)); // Clamp to prevent extrapolation beyond segment endpoints

  const xx = x1 + param * C;
  const yy = y1 + param * D;

  const dx = point.x - xx;
  const dy = point.y - yy;

  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Tests if a point lies on a line segment with tolerance for stroke width.
 * Converts normalized line coordinates to pixels and calculates the distance
 * from the point to the line segment. Returns true if the distance is within
 * the stroke width tolerance, enabling accurate line hit detection.
 *
 * @param point - Point coordinates in pixels to test
 * @param x1 - Line start X coordinate in normalized coordinates (0-1)
 * @param y1 - Line start Y coordinate in normalized coordinates (0-1)
 * @param x2 - Line end X coordinate in normalized coordinates (0-1)
 * @param y2 - Line end Y coordinate in normalized coordinates (0-1)
 * @param strokeWidth - Line stroke thickness for tolerance calculation
 * @param canvasWidth - Canvas width in pixels for coordinate conversion
 * @param canvasHeight - Canvas height in pixels for coordinate conversion
 * @returns True if point is within stroke tolerance of the line
 */
export const isPointOnLine = (
  point: Point,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  strokeWidth: number,
  canvasWidth: number,
  canvasHeight: number,
): boolean => {
  const tolerance = Math.max(strokeWidth / 2, 3); // Minimum 3px ensures clickable line even for thin strokes
  const lineX1 = x1 * canvasWidth;
  const lineY1 = y1 * canvasHeight;
  const lineX2 = x2 * canvasWidth;
  const lineY2 = y2 * canvasHeight;

  const distance = distanceToLineSegment(point, lineX1, lineY1, lineX2, lineY2);
  return distance <= tolerance;
};

/**
 * Tests if a point lies within the bounds of a text box using rectangle hit detection.
 * Delegates to the rectangle hit detection function since text boxes are rectangular
 * in nature. Provides a semantic wrapper for text-specific hit detection while
 * leveraging the existing rectangle boundary checking logic.
 *
 * @param point - Point coordinates in pixels to test
 * @param x - Text box left edge in normalized coordinates (0-1)
 * @param y - Text box top edge in normalized coordinates (0-1)
 * @param width - Text box width in normalized coordinates (0-1)
 * @param height - Text box height in normalized coordinates (0-1)
 * @param canvasWidth - Canvas width in pixels for coordinate conversion
 * @param canvasHeight - Canvas height in pixels for coordinate conversion
 * @returns True if point is inside the text box bounds
 */
export const isPointInTextBox = (
  point: Point,
  x: number,
  y: number,
  width: number,
  height: number,
  canvasWidth: number,
  canvasHeight: number,
): boolean => {
  return isPointInRectangle(point, x, y, width, height, canvasWidth, canvasHeight);
};

// =============================================================================
// HIT TEST HANDLERS (Strategy Pattern)
// =============================================================================

/**
 * Hit test handler for rectangle and square shapes.
 * Checks both fill area and stroke border, prioritizing stroke hits.
 */
const hitTestRectangle: HitTestHandler = (obj, ctx) => {
  if (!('x' in obj && 'y' in obj && 'width' in obj && 'height' in obj)) {
    return null;
  }

  const { clickPoint, canvasWidth, canvasHeight } = ctx;
  const rect = obj as { x: number; y: number; width: number; height: number; strokeWidth?: number };

  if (!isPointInRectangle(clickPoint, rect.x, rect.y, rect.width, rect.height, canvasWidth, canvasHeight)) {
    return null;
  }

  // Prioritize stroke hit over fill hit
  if (
    rect.strokeWidth !== undefined &&
    isPointOnRectangleBorder(clickPoint, rect.x, rect.y, rect.width, rect.height, rect.strokeWidth, canvasWidth, canvasHeight)
  ) {
    return { hit: true, object: obj, hitType: 'stroke' };
  }
  return { hit: true, object: obj, hitType: 'fill' };
};

/**
 * Hit test handler for circle shapes.
 * Checks both fill area and stroke border, prioritizing stroke hits.
 */
const hitTestCircle: HitTestHandler = (obj, ctx) => {
  if (!('x' in obj && 'y' in obj && 'radius' in obj)) {
    return null;
  }

  const { clickPoint, canvasWidth, canvasHeight } = ctx;
  const circle = obj as { x: number; y: number; radius: number; strokeWidth?: number };

  if (!isPointInCircle(clickPoint, circle.x, circle.y, circle.radius, canvasWidth, canvasHeight)) {
    return null;
  }

  // Prioritize stroke hit over fill hit
  if (
    circle.strokeWidth !== undefined &&
    isPointOnCircleBorder(clickPoint, circle.x, circle.y, circle.radius, circle.strokeWidth, canvasWidth, canvasHeight)
  ) {
    return { hit: true, object: obj, hitType: 'stroke' };
  }
  return { hit: true, object: obj, hitType: 'fill' };
};

/**
 * Hit test handler for triangle shapes.
 * Checks both fill area and stroke border, prioritizing stroke hits.
 */
const hitTestTriangle: HitTestHandler = (obj, ctx) => {
  if (!('x1' in obj && 'y1' in obj && 'x2' in obj && 'y2' in obj && 'x3' in obj && 'y3' in obj)) {
    return null;
  }

  const { clickPoint, canvasWidth, canvasHeight } = ctx;
  const triangle = obj as { x1: number; y1: number; x2: number; y2: number; x3: number; y3: number; strokeWidth?: number };

  if (!isPointInTriangle(clickPoint, triangle.x1, triangle.y1, triangle.x2, triangle.y2, triangle.x3, triangle.y3, canvasWidth, canvasHeight)) {
    return null;
  }

  // Prioritize stroke hit over fill hit
  if (
    triangle.strokeWidth !== undefined &&
    isPointOnTriangleBorder(clickPoint, triangle.x1, triangle.y1, triangle.x2, triangle.y2, triangle.x3, triangle.y3, triangle.strokeWidth, canvasWidth, canvasHeight)
  ) {
    return { hit: true, object: obj, hitType: 'stroke' };
  }
  return { hit: true, object: obj, hitType: 'fill' };
};

/**
 * Hit test handler for polygon shapes (pentagon, hexagon).
 * Only checks fill area as polygons don't have separate stroke detection.
 */
const hitTestPolygon: HitTestHandler = (obj, ctx) => {
  if (!('x' in obj && 'y' in obj && 'radius' in obj && 'sides' in obj)) {
    return null;
  }

  const { clickPoint, canvasWidth, canvasHeight } = ctx;
  const polygon = obj as { x: number; y: number; radius: number; sides: number };

  if (isPointInPolygon(clickPoint, polygon.x, polygon.y, polygon.radius, polygon.sides, canvasWidth, canvasHeight)) {
    return { hit: true, object: obj, hitType: 'fill' };
  }
  return null;
};

/**
 * Hit test handler for star shapes.
 * Only checks fill area as stars don't have separate stroke detection.
 */
const hitTestStar: HitTestHandler = (obj, ctx) => {
  if (!('x' in obj && 'y' in obj && 'radius' in obj)) {
    return null;
  }

  const { clickPoint, canvasWidth, canvasHeight } = ctx;
  const star = obj as { x: number; y: number; radius: number };

  if (isPointInStar(clickPoint, star.x, star.y, star.radius, canvasWidth, canvasHeight)) {
    return { hit: true, object: obj, hitType: 'fill' };
  }
  return null;
};

/**
 * Hit test handler for line shapes (solid and dotted lines).
 * Uses line segment distance for hit detection.
 */
const hitTestLine: HitTestHandler = (obj, ctx) => {
  if (!('x1' in obj && 'y1' in obj && 'x2' in obj && 'y2' in obj && 'strokeWidth' in obj)) {
    return null;
  }

  const { clickPoint, canvasWidth, canvasHeight } = ctx;
  const line = obj as { x1: number; y1: number; x2: number; y2: number; strokeWidth: number };

  if (isPointOnLine(clickPoint, line.x1, line.y1, line.x2, line.y2, line.strokeWidth, canvasWidth, canvasHeight)) {
    return { hit: true, object: obj, hitType: 'object' };
  }
  return null;
};

/**
 * Hit test handler for text boxes.
 * Uses rectangular bounds for hit detection.
 */
const hitTestText: HitTestHandler = (obj, ctx) => {
  if (!('x' in obj && 'y' in obj && 'width' in obj && 'height' in obj)) {
    return null;
  }

  const { clickPoint, canvasWidth, canvasHeight } = ctx;
  const textBox = obj as { x: number; y: number; width: number; height: number };

  if (isPointInTextBox(clickPoint, textBox.x, textBox.y, textBox.width, textBox.height, canvasWidth, canvasHeight)) {
    return { hit: true, object: obj, hitType: 'object' };
  }
  return null;
};

/**
 * Hit test handler for brush and eraser strokes.
 * Checks each line segment in the stroke path.
 */
const hitTestBrushStroke: HitTestHandler = (obj, ctx) => {
  if (!('points' in obj && 'lineWidth' in obj)) {
    return null;
  }

  const { clickPoint, canvasWidth, canvasHeight } = ctx;
  const stroke = obj as { points: { x: number; y: number }[]; lineWidth: number };

  // Check each line segment in the brush stroke
  for (let j = 0; j < stroke.points.length - 1; j++) {
    const p1 = stroke.points[j];
    const p2 = stroke.points[j + 1];
    if (isPointOnLine(clickPoint, p1.x, p1.y, p2.x, p2.y, stroke.lineWidth, canvasWidth, canvasHeight)) {
      return { hit: true, object: obj, hitType: 'object' };
    }
  }
  return null;
};

// =============================================================================
// HIT TEST HANDLER MAP
// =============================================================================

/**
 * Map of tool types to their hit test handlers.
 * Uses strategy pattern for cleaner, more maintainable hit detection logic.
 */
const hitTestHandlers: Record<string, HitTestHandler> = {
  square: hitTestRectangle,
  rectangle: hitTestRectangle,
  circle: hitTestCircle,
  triangle: hitTestTriangle,
  pentagon: hitTestPolygon,
  hexagon: hitTestPolygon,
  star: hitTestStar,
  line: hitTestLine,
  dottedLine: hitTestLine,
  arrow: hitTestLine,
  text: hitTestText,
  brush: hitTestBrushStroke,
  eraser: hitTestBrushStroke,
};

// =============================================================================
// MAIN HIT DETECTION
// =============================================================================

/**
 * Detects which canvas object (if any) was clicked at a given point.
 * Iterates through canvas objects in reverse order (top to bottom) to find
 * the topmost object that intersects with the click point. Distinguishes between
 * fill hits, stroke hits, and object hits for different types of drawing elements.
 * This is the main entry point for object interaction and selection logic.
 *
 * @param clickPoint - Mouse click coordinates in pixels
 * @param objects - Array of canvas objects to test for hit detection
 * @param canvasWidth - Canvas width in pixels for coordinate conversion
 * @param canvasHeight - Canvas height in pixels for coordinate conversion
 * @returns Hit result containing hit status, object reference, and hit type
 */
export const detectObjectHit = (
  clickPoint: Point,
  objects: ActionPayload[],
  canvasWidth: number,
  canvasHeight: number,
): HitResult => {
  const ctx: HitTestContext = { clickPoint, canvasWidth, canvasHeight };

  // Iterate through objects in reverse order (top to bottom) to find topmost hit
  // Reverse iteration ensures the most recently drawn object (highest z-index) is checked first
  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i];
    const handler = hitTestHandlers[obj.tool];

    if (handler) {
      const result = handler(obj, ctx);
      if (result) {
        return result;
      }
    }
  }

  return { hit: false };
};
