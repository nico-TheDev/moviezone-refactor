import sharp from "sharp";
import toIco from "to-ico";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const iconsDir = join(root, "public/icons");
const logoPath = join(root, "public/img/logo.png");

const BACKGROUND = { r: 0, g: 0, b: 0, alpha: 1 };

async function createIcon(size, outName, padding = 0.18) {
    const logo = await sharp(logoPath).resize({
        width: Math.round(size * (1 - padding * 2)),
        fit: "inside",
        withoutEnlargement: false,
    });

    const logoMeta = await logo.metadata();
    const logoBuffer = await logo.png().toBuffer();

    const left = Math.round((size - (logoMeta.width ?? size)) / 2);
    const top = Math.round((size - (logoMeta.height ?? size)) / 2);

    await sharp({
        create: {
            width: size,
            height: size,
            channels: 4,
            background: BACKGROUND,
        },
    })
        .composite([{ input: logoBuffer, left, top }])
        .png()
        .toFile(join(iconsDir, outName));
}

async function createFaviconIco() {
    const sizes = [16, 32];
    const buffers = await Promise.all(
        sizes.map((size) =>
            sharp(logoPath)
                .resize(size, size, { fit: "contain", background: BACKGROUND })
                .png()
                .toBuffer(),
        ),
    );
    writeFileSync(join(iconsDir, "favicon.ico"), await toIco(buffers));
}

async function main() {
    await createIcon(192, "icon-192.png");
    await createIcon(512, "icon-512.png", 0.22);
    await createIcon(512, "icon-maskable-512.png", 0.12);
    await createFaviconIco();
    console.log("Generated PWA icons in public/icons/");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
