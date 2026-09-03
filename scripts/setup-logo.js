import fs from 'fs';
import path from 'path';

const sourceImage = path.resolve('image.png');
const publicDir = path.resolve('public');
const assetsDir = path.resolve('src/assets');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

if (fs.existsSync(sourceImage)) {
  fs.copyFileSync(sourceImage, path.join(publicDir, 'logo.png'));
  fs.copyFileSync(sourceImage, path.join(publicDir, 'pwa-192x192.png'));
  fs.copyFileSync(sourceImage, path.join(publicDir, 'pwa-512x512.png'));
  fs.copyFileSync(sourceImage, path.join(publicDir, 'apple-touch-icon.png'));
  fs.copyFileSync(sourceImage, path.join(publicDir, 'favicon.ico'));
  fs.copyFileSync(sourceImage, path.join(assetsDir, 'logo.png'));
  console.log('Logo officiel copie avec succes dans public/ et src/assets/ !');
} else {
  console.error('image.png introuvable a la racine');
}
