#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const src = path.join(root, "public/logo.png");
const outDir = path.join(root, "public/icons");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

if (!fs.existsSync(src)) {
  console.error("Missing public/logo.png");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

for (const size of sizes) {
  await sharp(src)
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(path.join(outDir, `icon-${size}.png`));
}

await sharp(src)
  .resize(180, 180, { fit: "cover" })
  .png()
  .toFile(path.join(outDir, "apple-touch-icon.png"));

// Maskable safe zone (~80% of canvas)
await sharp(src)
  .resize(410, 410, { fit: "cover" })
  .extend({
    top: 51,
    bottom: 51,
    left: 51,
    right: 51,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  })
  .png()
  .toFile(path.join(outDir, "icon-maskable-512.png"));

console.log("PWA icons written to public/icons/");
