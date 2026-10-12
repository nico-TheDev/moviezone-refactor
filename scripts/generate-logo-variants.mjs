import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

/*
 * The brand logo ships a white wordmark, which only works over the hero image
 * and over a dark canvas. The light scheme needs the same mark with the
 * wordmark in ink, so this derives `logo-light.png` from `logo.png` by
 * recolouring the white pixels and leaving the brand red untouched.
 *
 * Alpha is preserved, so the antialiased letter edges stay smooth. Only the
 * wordmark is affected: every white pixel in the source sits at x >= 74, well
 * clear of the camera roundel on the left.
 *
 * Run with: npm run generate:logo
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const sourcePath = join(root, "public/img/logo.png");
const targetPath = join(root, "public/img/logo-light.png");

// Matches --mz-ink for the light scheme in app/app.css.
const INK = { r: 0x20, g: 0x18, b: 0x18 };
const WHITE_FLOOR = 250;

const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

let recoloured = 0;

for (let i = 0; i < info.width * info.height; i += 1) {
    const offset = i * info.channels;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];

    if (r < WHITE_FLOOR || g < WHITE_FLOOR || b < WHITE_FLOOR) continue;

    data[offset] = INK.r;
    data[offset + 1] = INK.g;
    data[offset + 2] = INK.b;
    recoloured += 1;
}

await sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
})
    .png()
    .toFile(targetPath);

console.log(`Wrote ${targetPath} (${recoloured} wordmark pixels recoloured to ink)`);
