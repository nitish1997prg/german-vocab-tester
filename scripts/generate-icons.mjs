
import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const outputDir = join(process.cwd(), "public", "icons");

await mkdir(outputDir, { recursive: true });

const source = await readFile(
  join(outputDir, "icon-source.svg")
);

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "icon-maskable-512.png", size: 512 },
];

for (const { name, size } of sizes) {
  await sharp(source)
    .resize(size, size)
    .png()
    .toFile(join(outputDir, name));

  console.log(`Generated ${name}`);
}
