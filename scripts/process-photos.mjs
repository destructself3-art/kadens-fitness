// Turns the generated photos into site assets.
//   photos-raw/<shot-id>.(jpg|jpeg|png|webp|avif)  ->  public/photos/<shot-id>.jpg
// Each photo is cropped (centered) to the ratio of its shot, resized, compressed, and gets a tiny blur
// placeholder. src/data/photo-manifest.json is rebuilt from everything in public/photos, so MediaFrame
// switches from the drawn placeholder to the real photo automatically.
//
// Usage: npm run photos            process new files and print what is still missing
//        npm run photos -- --force re-process every file, even if the output is newer
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(root, "photos-raw");
const OUT = join(root, "public/photos");
const MANIFEST = join(root, "src/data/photo-manifest.json");
const force = process.argv.includes("--force");

const { shots } = JSON.parse(readFileSync(join(root, "docs/shot-list.json"), "utf8"));
const byId = new Map(shots.map((s) => [s.id, s]));

/** "Coach-Boxing (1).PNG" -> "coach-boxing" */
function toId(file) {
  return file
    .slice(0, -extname(file).length)
    .toLowerCase()
    .replace(/\s*\(\d+\)$/, "")
    .replace(/[\s_]+/g, "-")
    .replace(/\.jpg$/, "")
    .trim();
}

const WIDE = (id) => ["hero", "facade-night", "zone-gym-floor", "detail-led-line", "empty-gym"].includes(id);

function longSide(id) {
  return WIDE(id) ? 2880 : 2000;
}

/** Full-screen shots are upscaled to this long side when the source is smaller (sharpened, lanczos3). */
const MIN_WIDE = 2560;

mkdirSync(RAW, { recursive: true });
mkdirSync(OUT, { recursive: true });

const files = readdirSync(RAW).filter((f) => /\.(jpe?g|png|webp|avif|tiff?)$/i.test(f));
const unknown = [];
let processed = 0;

for (const file of files) {
  const id = toId(file);
  const shot = byId.get(id);
  if (!shot) {
    unknown.push(file);
    continue;
  }
  const src = join(RAW, file);
  const dest = join(OUT, `${id}.jpg`);
  if (!force && existsSync(dest) && statSync(dest).mtimeMs > statSync(src).mtimeMs) continue;

  const image = sharp(src).rotate();
  const { width = 0, height = 0 } = await image.metadata();
  const [rw, rh] = shot.ratio.split(":").map(Number);
  const target = rw / rh;
  let w = width;
  let h = height;
  if (w / h > target) w = Math.round(h * target);
  else h = Math.round(w / target);
  const left = Math.round((width - w) / 2);
  const top = Math.round((height - h) / 2);
  const long = Math.max(w, h);
  const scale = WIDE(id) && long < MIN_WIDE ? MIN_WIDE / long : Math.min(1, longSide(id) / long);

  let pipeline = sharp(src)
    .rotate()
    .extract({ left, top, width: w, height: h })
    .resize(Math.round(w * scale), Math.round(h * scale), { kernel: "lanczos3" });
  if (scale > 1) pipeline = pipeline.sharpen({ sigma: 0.7, m1: 0.6, m2: 1.4 });
  await pipeline.jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: "4:4:4" }).toFile(dest);
  processed++;
  const small = scale > 1 ? `  (upscaled from ${w}×${h})` : long < 1100 ? "  (small source: may look soft on large screens)" : "";
  console.log(`✓ ${file} -> public/photos/${id}.jpg ${Math.round(w * scale)}×${Math.round(h * scale)}${small}`);
}

// Rebuild the manifest from what is actually in public/photos.
const manifest = {};
for (const file of readdirSync(OUT).filter((f) => f.endsWith(".jpg")).sort()) {
  const id = file.slice(0, -4);
  if (!byId.has(id)) continue;
  const path = join(OUT, file);
  const { width, height } = await sharp(path).metadata();
  const blur = await sharp(path).resize(16).jpeg({ quality: 50 }).toBuffer();
  manifest[id] = { src: `/photos/${file}`, width, height, blur: `data:image/jpeg;base64,${blur.toString("base64")}` };
}
writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

const missing = shots.filter((s) => !manifest[s.id]);
const byPriority = (p) => missing.filter((s) => s.priority === p).map((s) => s.id);
console.log(`\nPhotos on the site: ${Object.keys(manifest).length} of ${shots.length}. Processed now: ${processed}.`);
if (unknown.length) console.log(`Not matched to any shot (rename them to a shot id): ${unknown.join(", ")}`);
for (const p of ["A", "B", "C", "D"]) {
  const list = byPriority(p);
  if (list.length) console.log(`Missing ${p} (${list.length}): ${list.join(", ")}`);
}
