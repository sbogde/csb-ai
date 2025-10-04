#!/usr/bin/env node
/**
 * Generate PWA PNG icons from the source SVGs.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  ".."
);
const publicDir = path.join(root, "public");
const iconsDir = path.join(publicDir, "icons");

const sourceSvg = path.join(iconsDir, "csb-icon.svg");
const maskableSvg = path.join(iconsDir, "csb-icon-maskable.svg");

if (!fs.existsSync(sourceSvg)) {
  console.error("Missing source SVG:", sourceSvg);
  process.exit(1);
}

if (!fs.existsSync(maskableSvg)) {
  console.error("Missing maskable SVG:", maskableSvg);
  process.exit(1);
}

const sizes = [48, 72, 96, 144, 192, 256, 384, 512];

async function generate() {
  console.log("Generating standard icons...");
  for (const size of sizes) {
    const out = path.join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(sourceSvg)
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log("Wrote", out);
  }

  console.log("Generating maskable icons...");
  for (const size of sizes) {
    const out = path.join(iconsDir, `icon-${size}x${size}-maskable.png`);
    await sharp(maskableSvg)
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log("Wrote", out);
  }

  console.log("Done.");
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
