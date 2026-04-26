import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src", "icon.svg");
const OUT = join(ROOT, "dist", "icons");
const SIZES = [16, 32, 48, 128];

const svg = readFileSync(SRC, "utf-8");
mkdirSync(OUT, { recursive: true });

await Promise.all(
  SIZES.map(async (size) => {
    const file = join(OUT, `icon-${size}.png`);
    await sharp(Buffer.from(svg), { density: size * 4 })
      .resize(size, size)
      .png()
      .toFile(file);
    console.log(`[icons] wrote dist/icons/icon-${size}.png`);
  }),
);
