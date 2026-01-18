import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.join(__dirname, '../public/screenshots');

// Images to convert and their responsive sizes
const heroImages = [
  'workspace-en-light.jpg',
  'workspace-en-dark.jpg',
];

const responsiveSizes = [640, 1024];

// Other screenshot images
const otherImages = [
  'auth.jpg',
  'board-list.jpg',
  'board-settings.jpg',
  'user-settings.jpg',
  'mobile-board-list-grid.jpg',
  'mobile-board-list-list.jpg',
  'mobile-canvas.jpg',
  'mobile-chat.jpg',
];

async function generateWebP() {
  console.log('Generating WebP images...\n');

  // Generate hero images with responsive sizes
  for (const img of heroImages) {
    const inputPath = path.join(screenshotsDir, img);
    const baseName = img.replace('.jpg', '');

    if (!fs.existsSync(inputPath)) {
      console.log(`Skipping ${img} - file not found`);
      continue;
    }

    // Full-size WebP
    const fullWebP = path.join(screenshotsDir, `${baseName}.webp`);
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(fullWebP);
    console.log(`Created: ${baseName}.webp`);

    // Responsive sizes
    for (const width of responsiveSizes) {
      const outputPath = path.join(screenshotsDir, `${baseName}-${width}w.webp`);
      await sharp(inputPath)
        .resize(width, null, { withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(outputPath);
      console.log(`Created: ${baseName}-${width}w.webp`);
    }
  }

  // Generate WebP for other screenshot images
  for (const img of otherImages) {
    const inputPath = path.join(screenshotsDir, img);
    const baseName = img.replace('.jpg', '');

    if (!fs.existsSync(inputPath)) {
      console.log(`Skipping ${img} - file not found`);
      continue;
    }

    // Full-size WebP
    const fullWebP = path.join(screenshotsDir, `${baseName}.webp`);
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(fullWebP);
    console.log(`Created: ${baseName}.webp`);

    // Responsive sizes for non-mobile images
    if (!img.startsWith('mobile-')) {
      for (const width of responsiveSizes) {
        const outputPath = path.join(screenshotsDir, `${baseName}-${width}w.webp`);
        await sharp(inputPath)
          .resize(width, null, { withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(outputPath);
        console.log(`Created: ${baseName}-${width}w.webp`);
      }
    }
  }

  console.log('\nDone!');
}

generateWebP().catch(console.error);
