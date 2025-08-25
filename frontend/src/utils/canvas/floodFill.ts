// Simple synchronous flood fill algorithm
export function floodFill(
  canvas: HTMLCanvasElement,
  startX: number,
  startY: number,
  fillColor: string,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Convert fill color to RGB
  const fillRGB = hexToRgb(fillColor);
  if (!fillRGB) return;

  // Get the original color at the start point
  const startIndex = (startY * canvas.width + startX) * 4;
  const originalColor = {
    r: data[startIndex],
    g: data[startIndex + 1],
    b: data[startIndex + 2],
    a: data[startIndex + 3],
  };

  // If the original color is the same as fill color, no need to fill
  if (
    originalColor.r === fillRGB.r &&
    originalColor.g === fillRGB.g &&
    originalColor.b === fillRGB.b
  ) {
    return;
  }

  // Stack-based flood fill to avoid recursion depth issues
  const stack: [number, number][] = [[startX, startY]];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const coords = stack.pop();
    if (!coords) continue;
    const [x, y] = coords;
    
    // Check bounds
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
      continue;
    }

    const key = `${x},${y}`;
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);

    const index = (y * canvas.width + x) * 4;
    const currentColor = {
      r: data[index],
      g: data[index + 1],
      b: data[index + 2],
      a: data[index + 3],
    };

    // Check if current pixel matches the original color
    if (
      currentColor.r !== originalColor.r ||
      currentColor.g !== originalColor.g ||
      currentColor.b !== originalColor.b ||
      currentColor.a !== originalColor.a
    ) {
      continue;
    }

    // Fill the pixel
    data[index] = fillRGB.r;
    data[index + 1] = fillRGB.g;
    data[index + 2] = fillRGB.b;
    data[index + 3] = 255; // Full opacity

    // Add neighbors to stack
    stack.push([x + 1, y]);
    stack.push([x - 1, y]);
    stack.push([x, y + 1]);
    stack.push([x, y - 1]);
  }

  // Apply the changes
  ctx.putImageData(imageData, 0, 0);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}