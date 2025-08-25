import type { ActionPayload, Point } from 'types/BoardObjectTypes';

export interface HitResult {
  hit: boolean;
  object?: ActionPayload;
  hitType?: 'fill' | 'stroke' | 'object'; // fill = inside shape, stroke = on border, object = line/arrow/text
}

/**
 * Test if a point is inside a rectangle
 */
export const isPointInRectangle = (
  point: Point,
  x: number, y: number, width: number, height: number,
  canvasWidth: number, canvasHeight: number,
): boolean => {
  const rectX = x * canvasWidth;
  const rectY = y * canvasHeight;
  const rectWidth = width * canvasWidth;
  const rectHeight = height * canvasHeight;
  
  return point.x >= rectX && 
         point.x <= rectX + rectWidth && 
         point.y >= rectY && 
         point.y <= rectY + rectHeight;
};

/**
 * Test if a point is on a rectangle border (with tolerance for stroke width)
 */
export const isPointOnRectangleBorder = (
  point: Point,
  x: number, y: number, width: number, height: number,
  strokeWidth: number,
  canvasWidth: number, canvasHeight: number,
): boolean => {
  const rectX = x * canvasWidth;
  const rectY = y * canvasHeight;
  const rectWidth = width * canvasWidth;
  const rectHeight = height * canvasHeight;
  const tolerance = Math.max(strokeWidth / 2, 3); // At least 3px tolerance
  
  // Check if point is near any of the four borders
  const nearLeftEdge = Math.abs(point.x - rectX) <= tolerance && 
                       point.y >= rectY - tolerance && 
                       point.y <= rectY + rectHeight + tolerance;
  const nearRightEdge = Math.abs(point.x - (rectX + rectWidth)) <= tolerance && 
                        point.y >= rectY - tolerance && 
                        point.y <= rectY + rectHeight + tolerance;
  const nearTopEdge = Math.abs(point.y - rectY) <= tolerance && 
                      point.x >= rectX - tolerance && 
                      point.x <= rectX + rectWidth + tolerance;
  const nearBottomEdge = Math.abs(point.y - (rectY + rectHeight)) <= tolerance && 
                         point.x >= rectX - tolerance && 
                         point.x <= rectX + rectWidth + tolerance;
  
  return nearLeftEdge || nearRightEdge || nearTopEdge || nearBottomEdge;
};

/**
 * Test if a point is inside a circle
 */
export const isPointInCircle = (
  point: Point,
  centerX: number, centerY: number, radius: number,
  canvasWidth: number, canvasHeight: number,
): boolean => {
  const circleX = centerX * canvasWidth;
  const circleY = centerY * canvasHeight;
  const circleRadius = radius * canvasWidth;
  
  const distance = Math.sqrt(Math.pow(point.x - circleX, 2) + Math.pow(point.y - circleY, 2));
  return distance <= circleRadius;
};

/**
 * Test if a point is on a circle border (with tolerance for stroke width)
 */
export const isPointOnCircleBorder = (
  point: Point,
  centerX: number, centerY: number, radius: number,
  strokeWidth: number,
  canvasWidth: number, canvasHeight: number,
): boolean => {
  const circleX = centerX * canvasWidth;
  const circleY = centerY * canvasHeight;
  const circleRadius = radius * canvasWidth;
  const tolerance = Math.max(strokeWidth / 2, 3); // At least 3px tolerance
  
  const distance = Math.sqrt(Math.pow(point.x - circleX, 2) + Math.pow(point.y - circleY, 2));
  return Math.abs(distance - circleRadius) <= tolerance;
};

/**
 * Test if a point is inside a triangle using barycentric coordinates
 */
export const isPointInTriangle = (
  point: Point,
  x1: number, y1: number, x2: number, y2: number, x3: number, y3: number,
  canvasWidth: number, canvasHeight: number,
): boolean => {
  const p1x = x1 * canvasWidth;
  const p1y = y1 * canvasHeight;
  const p2x = x2 * canvasWidth;
  const p2y = y2 * canvasHeight;
  const p3x = x3 * canvasWidth;
  const p3y = y3 * canvasHeight;
  
  // Calculate barycentric coordinates
  const denominator = (p2y - p3y) * (p1x - p3x) + (p3x - p2x) * (p1y - p3y);
  if (Math.abs(denominator) < 1e-10) return false; // Degenerate triangle
  
  const a = ((p2y - p3y) * (point.x - p3x) + (p3x - p2x) * (point.y - p3y)) / denominator;
  const b = ((p3y - p1y) * (point.x - p3x) + (p1x - p3x) * (point.y - p3y)) / denominator;
  const c = 1 - a - b;
  
  return a >= 0 && b >= 0 && c >= 0;
};

/**
 * Test if a point is on a triangle border (with tolerance for stroke width)
 */
export const isPointOnTriangleBorder = (
  point: Point,
  x1: number, y1: number, x2: number, y2: number, x3: number, y3: number,
  strokeWidth: number,
  canvasWidth: number, canvasHeight: number,
): boolean => {
  const tolerance = Math.max(strokeWidth / 2, 3);
  
  // Check distance to each of the three edges
  const edges = [
    { x1: x1 * canvasWidth, y1: y1 * canvasHeight, x2: x2 * canvasWidth, y2: y2 * canvasHeight },
    { x1: x2 * canvasWidth, y1: y2 * canvasHeight, x2: x3 * canvasWidth, y2: y3 * canvasHeight },
    { x1: x3 * canvasWidth, y1: y3 * canvasHeight, x2: x1 * canvasWidth, y2: y1 * canvasHeight },
  ];
  
  return edges.some((edge) => distanceToLineSegment(point, edge.x1, edge.y1, edge.x2, edge.y2) <= tolerance);
};

/**
 * Test if a point is inside a polygon using ray casting algorithm
 */
export const isPointInPolygon = (
  point: Point,
  centerX: number, centerY: number, radius: number, sides: number,
  canvasWidth: number, canvasHeight: number,
): boolean => {
  const radiusScale = Math.min(canvasWidth, canvasHeight);
  const actualRadius = radius * radiusScale;
  const actualCenterX = centerX * canvasWidth;
  const actualCenterY = centerY * canvasHeight;
  
  // Generate polygon vertices
  const vertices: Point[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    vertices.push({
      x: actualCenterX + actualRadius * Math.cos(angle),
      y: actualCenterY + actualRadius * Math.sin(angle),
    });
  }
  
  // Ray casting algorithm
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    if (((vertices[i].y > point.y) !== (vertices[j].y > point.y)) &&
        (point.x < (vertices[j].x - vertices[i].x) * (point.y - vertices[i].y) / 
         (vertices[j].y - vertices[i].y) + vertices[i].x)) {
      inside = !inside;
    }
  }
  
  return inside;
};

/**
 * Test if a point is inside a star shape
 */
export const isPointInStar = (
  point: Point,
  centerX: number, centerY: number, radius: number,
  canvasWidth: number, canvasHeight: number,
): boolean => {
  const radiusScale = Math.min(canvasWidth, canvasHeight);
  const outerRadius = radius * radiusScale;
  const innerRadius = outerRadius * 0.4;
  const actualCenterX = centerX * canvasWidth;
  const actualCenterY = centerY * canvasHeight;
  const points = 5;
  
  // Generate star vertices
  const vertices: Point[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    vertices.push({
      x: actualCenterX + r * Math.cos(angle),
      y: actualCenterY + r * Math.sin(angle),
    });
  }
  
  // Ray casting algorithm
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    if (((vertices[i].y > point.y) !== (vertices[j].y > point.y)) &&
        (point.x < (vertices[j].x - vertices[i].x) * (point.y - vertices[i].y) / 
         (vertices[j].y - vertices[i].y) + vertices[i].x)) {
      inside = !inside;
    }
  }
  
  return inside;
};

/**
 * Calculate distance from a point to a line segment
 */
export const distanceToLineSegment = (
  point: Point,
  x1: number, y1: number, x2: number, y2: number,
): number => {
  const A = point.x - x1;
  const B = point.y - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) return Math.sqrt(A * A + B * B);
  
  let param = dot / lenSq;
  param = Math.max(0, Math.min(1, param));
  
  const xx = x1 + param * C;
  const yy = y1 + param * D;
  
  const dx = point.x - xx;
  const dy = point.y - yy;
  
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Test if a point is on a line (with tolerance for stroke width)
 */
export const isPointOnLine = (
  point: Point,
  x1: number, y1: number, x2: number, y2: number,
  strokeWidth: number,
  canvasWidth: number, canvasHeight: number,
): boolean => {
  const tolerance = Math.max(strokeWidth / 2, 3);
  const lineX1 = x1 * canvasWidth;
  const lineY1 = y1 * canvasHeight;
  const lineX2 = x2 * canvasWidth;
  const lineY2 = y2 * canvasHeight;
  
  const distance = distanceToLineSegment(point, lineX1, lineY1, lineX2, lineY2);
  return distance <= tolerance;
};

/**
 * Test if a point is inside a text box
 */
export const isPointInTextBox = (
  point: Point,
  x: number, y: number, width: number, height: number,
  canvasWidth: number, canvasHeight: number,
): boolean => {
  return isPointInRectangle(point, x, y, width, height, canvasWidth, canvasHeight);
};

/**
 * Main hit detection function that tests all objects and returns the topmost hit
 */
export const detectObjectHit = (
  clickPoint: Point,
  objects: ActionPayload[],
  canvasWidth: number,
  canvasHeight: number,
): HitResult => {
  // Test objects in reverse order (topmost first)
  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i];
    
    // Handle different object types
    if (obj.tool === 'square' || obj.tool === 'rectangle') {
      const rect = obj as any; // RectanglePayload
      
      // Check if it's inside the shape (for fill)
      if (isPointInRectangle(clickPoint, rect.x, rect.y, rect.width, rect.height, canvasWidth, canvasHeight)) {
        // If inside, check if it's on the border first (border takes priority)
        if (isPointOnRectangleBorder(clickPoint, rect.x, rect.y, rect.width, rect.height, rect.strokeWidth, canvasWidth, canvasHeight)) {
          return { hit: true, object: obj, hitType: 'stroke' };
        }
        return { hit: true, object: obj, hitType: 'fill' };
      }
    } else if (obj.tool === 'circle') {
      const circle = obj as any; // CirclePayload
      
      if (isPointInCircle(clickPoint, circle.x, circle.y, circle.radius, canvasWidth, canvasHeight)) {
        // If inside, check if it's on the border first (border takes priority)
        if (isPointOnCircleBorder(clickPoint, circle.x, circle.y, circle.radius, circle.strokeWidth, canvasWidth, canvasHeight)) {
          return { hit: true, object: obj, hitType: 'stroke' };
        }
        return { hit: true, object: obj, hitType: 'fill' };
      }
    } else if (obj.tool === 'triangle') {
      const triangle = obj as any; // TrianglePayload
      
      if (isPointInTriangle(clickPoint, triangle.x1, triangle.y1, triangle.x2, triangle.y2, triangle.x3, triangle.y3, canvasWidth, canvasHeight)) {
        // If inside, check if it's on the border first (border takes priority)
        if (isPointOnTriangleBorder(clickPoint, triangle.x1, triangle.y1, triangle.x2, triangle.y2, triangle.x3, triangle.y3, triangle.strokeWidth, canvasWidth, canvasHeight)) {
          return { hit: true, object: obj, hitType: 'stroke' };
        }
        return { hit: true, object: obj, hitType: 'fill' };
      }
    } else if (obj.tool === 'pentagon' || obj.tool === 'hexagon') {
      const polygon = obj as any; // PolygonPayload
      
      if (isPointInPolygon(clickPoint, polygon.x, polygon.y, polygon.radius, polygon.sides, canvasWidth, canvasHeight)) {
        return { hit: true, object: obj, hitType: 'fill' };
      }
    } else if (obj.tool === 'star') {
      const star = obj as any; // PolygonPayload
      
      if (isPointInStar(clickPoint, star.x, star.y, star.radius, canvasWidth, canvasHeight)) {
        return { hit: true, object: obj, hitType: 'fill' };
      }
    } else if (obj.tool === 'line' || obj.tool === 'dottedLine') {
      const line = obj as any; // StraightLinePayload
      
      if (isPointOnLine(clickPoint, line.x1, line.y1, line.x2, line.y2, line.strokeWidth, canvasWidth, canvasHeight)) {
        return { hit: true, object: obj, hitType: 'object' };
      }
    } else if (obj.tool === 'arrow') {
      const arrow = obj as any; // ArrowPayload
      
      if (isPointOnLine(clickPoint, arrow.x1, arrow.y1, arrow.x2, arrow.y2, arrow.strokeWidth, canvasWidth, canvasHeight)) {
        return { hit: true, object: obj, hitType: 'object' };
      }
    } else if (obj.tool === 'text') {
      const textBox = obj as any; // TextBoxPayload
      
      if (isPointInTextBox(clickPoint, textBox.x, textBox.y, textBox.width, textBox.height, canvasWidth, canvasHeight)) {
        return { hit: true, object: obj, hitType: 'object' };
      }
    } else if (obj.tool === 'brush' || obj.tool === 'eraser') {
      const line = obj as any; // LinePayload
      
      // Check if point is near any segment of the drawn path
      for (let j = 0; j < line.points.length - 1; j++) {
        const p1 = line.points[j];
        const p2 = line.points[j + 1];
        if (isPointOnLine(clickPoint, p1.x, p1.y, p2.x, p2.y, line.lineWidth, canvasWidth, canvasHeight)) {
          return { hit: true, object: obj, hitType: 'object' };
        }
      }
    }
  }
  
  return { hit: false };
};