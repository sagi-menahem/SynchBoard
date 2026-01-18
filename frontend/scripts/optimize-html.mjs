import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '../dist');
const htmlPath = path.join(distDir, 'index.html');

/**
 * Post-build script to optimize HTML for better performance:
 * 1. Make main CSS non-render-blocking using media="print" trick
 * 2. Add preload hints for critical resources
 */
async function optimizeHtml() {
  console.log('Optimizing HTML for performance...\n');

  if (!fs.existsSync(htmlPath)) {
    console.log('No dist/index.html found. Run npm run build first.');
    return;
  }

  let html = fs.readFileSync(htmlPath, 'utf-8');

  // Find the main CSS file link and make it non-render-blocking
  // Pattern: <link rel="stylesheet" crossorigin href="/assets/index-XXX.css">
  const cssLinkRegex = /<link\s+rel="stylesheet"\s+crossorigin\s+href="(\/assets\/index-[^"]+\.css)">/g;

  let match;
  const cssLinks = [];
  while ((match = cssLinkRegex.exec(html)) !== null) {
    cssLinks.push({ fullMatch: match[0], href: match[1] });
  }

  if (cssLinks.length === 0) {
    console.log('No main CSS link found. Skipping optimization.');
    return;
  }

  for (const { fullMatch, href } of cssLinks) {
    // Replace with preload + non-blocking pattern
    const optimizedLink = `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="${href}"></noscript>`;

    html = html.replace(fullMatch, optimizedLink);
    console.log(`Made CSS non-blocking: ${href}`);
  }

  fs.writeFileSync(htmlPath, html);
  console.log('\nHTML optimization complete!');
}

optimizeHtml().catch(console.error);
