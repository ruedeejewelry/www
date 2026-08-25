// Derives every brand asset the site serves from one master file, so the logo
// only ever has to be replaced in one place. Run: npm run brand
//
// Master: design/brand/ruedee-logo.png (1200×1200, transparent)
// Measured content bounds in that file:
//   mark      x 295–939, y 243–748
//   wordmark  x  25–1174, y 836–956

import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const master = join(root, "design/brand/ruedee-logo.png");

/** Cream page background. Matches --color-paper in app/globals.css. */
const PAPER = { r: 0xfa, g: 0xf8, b: 0xf4, alpha: 1 };

const MARK = { left: 295, top: 243, width: 645, height: 506 };
const FULL = { left: 25, top: 243, width: 1150, height: 714 };

const out = (...parts) => join(root, ...parts);

function ensureDirs() {
  for (const dir of ["public", "app"]) mkdirSync(out(dir), { recursive: true });
}

/** The mark on its own, padded to a square so it never looks cropped. */
function squareMark(size, background) {
  const inner = Math.round(size * 0.82);
  return sharp(master)
    .extract(MARK)
    .resize(inner, inner, { fit: "contain", background: { ...PAPER, alpha: 0 } })
    .extend({
      top: Math.round((size - inner) / 2),
      bottom: size - inner - Math.round((size - inner) / 2),
      left: Math.round((size - inner) / 2),
      right: size - inner - Math.round((size - inner) / 2),
      background,
    });
}

async function main() {
  ensureDirs();

  // Header mark. 96px wide covers a 48px slot at 2× on a phone.
  await sharp(master)
    .extract(MARK)
    .resize({ width: 192 })
    .webp({ quality: 90 })
    .toFile(out("public/ruedee-mark.webp"));

  // Full lockup for the about page and anywhere the name should read.
  await sharp(master)
    .extract(FULL)
    .resize({ width: 600 })
    .webp({ quality: 90 })
    .toFile(out("public/ruedee-logo.webp"));

  // Favicon. Transparent, so it sits on whatever the browser chrome is.
  // The mark is flat colour apart from the diamond, so a palette PNG is a
  // fraction of the size with no visible difference at icon sizes.
  await squareMark(256, { ...PAPER, alpha: 0 })
    .png({ palette: true, quality: 90, compressionLevel: 9 })
    .toFile(out("app/icon.png"));

  // iOS composites home-screen icons onto black, so this one gets the cream.
  await squareMark(180, PAPER)
    .png({ palette: true, quality: 90, compressionLevel: 9 })
    .toFile(out("app/apple-icon.png"));

  // What LINE shows when someone shares a link. Cream card, lockup centred.
  const lockup = await sharp(master)
    .extract(FULL)
    .resize({ width: 760 })
    .toBuffer();

  await sharp({
    create: { width: 1200, height: 630, channels: 4, background: PAPER },
  })
    .composite([{ input: lockup, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toFile(out("app/opengraph-image.png"));

  console.log("brand assets written");
}

await main();
