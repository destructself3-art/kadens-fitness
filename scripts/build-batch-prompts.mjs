// Builds docs/BATCH_PROMPTS.md: the whole shot list as four self-contained texts
// (one per priority) that can be pasted into a chat-based image model as-is.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "docs/shot-list.json"), "utf8"));

const modeLines = Object.entries(data.modes)
  .map(([id, m]) => {
    const text = `${m.light.replace(/^Light: /, "")} ${m.palette}`.replaceAll("{rim}", "the colour given for the shot");
    return `${id.toUpperCase()}: ${text}`;
  })
  .join("\n");

const BIBLE = `STYLE BIBLE (applies to every image)
This is one continuous evening photoshoot for "Kadens", a large three-storey fitness club in Kazan where every workout is planned around the member's heart rate. The club's name never appears in any image. Every image shows the same club:
- a black rubber floor made of compressed crumb with fine grey and scarlet flecks
- raw board-formed concrete walls, blackened steel, black acoustic baffles on the ceiling
- thin scarlet-red LED lines: the club's signature light
- matte-black, unbranded equipment; black bumper plates with no markings
- smoked oak only in the calm zones (yoga and pilates studios, spa, locker room)
- members wear black, graphite or white sportswear; coaches wear black with a thin scarlet stripe on the sleeve

LIGHT MODES (every shot names its mode)
${modeLines}

Photo style: ${data.style}
People: adults of different ages, genders and body types, shown only as silhouettes, from behind or cropped. Never a visible face.
Never: text, lettering, numbers or weight markings, logos or brand marks, readable screens, watermarks, visible faces, children, collages or grids.`;

const RULES = `HOW TO WORK
1. Generate every shot below as a separate photorealistic image, in the listed order, at the listed aspect ratio and the highest resolution you can.
2. Right before each image, write its file name on its own line (for example: hero.jpg).
3. One image per shot. Do not combine shots into a grid or collage.
4. A shot marked TWIN must reuse the image of the shot it names as its base: keep the same camera angle, framing and subject and change only what the shot describes. If that image is not in this chat, ask me to attach it.
5. Coach portraits are one series: the same backdrop, camera distance, figure scale and light for every coach. Only the pose and the rim colour change.
6. If you can only make a few images per reply, stop after them and wait. When I write "continue", resume from the next number.`;

const order = { A: 0, B: 1, C: 2, D: 3 };
const sectionIndex = Object.fromEntries(data.sections.map((s, i) => [s.id, i]));
const shots = [...data.shots].sort(
  (a, b) => order[a.priority] - order[b.priority] || sectionIndex[a.section] - sectionIndex[b.section],
);
// Twins must come right after their base shot.
const sorted = [];
for (const s of shots) {
  if (sorted.includes(s)) continue;
  if (s.editFrom && !sorted.some((x) => x.id === s.editFrom)) continue;
  sorted.push(s);
  for (const t of shots) if (t.editFrom === s.id && !sorted.includes(t) && t.priority === s.priority) sorted.push(t);
}
for (const s of shots) if (!sorted.includes(s)) sorted.push(s);

const num = new Map(sorted.map((s, i) => [s.id, String(i + 1).padStart(2, "0")]));

function entry(s) {
  const n = num.get(s.id);
  const light = s.mode === "rim" ? `RIM light, ${data.rims[s.zone].label} (${s.zone})` : `${s.mode.toUpperCase()} light`;
  const lines = [`[${n}] ${s.id}.jpg | ${s.ratio} | ${light}`];
  if (s.editFrom) {
    const base = `[${num.get(s.editFrom)}] ${s.editFrom}.jpg`;
    const change = s.edit.replace(/^Edit the attached image\. /, "").replace(/ No text, no logos, no watermark\.$/, "");
    lines.push(`TWIN of ${base}: ${change}`);
  } else {
    lines.push(s.subject);
  }
  const framing = data.sections.find((x) => x.id === s.section)?.framing;
  if (framing) lines.push(framing);
  if (s.light) lines.push(`Light for this shot: ${s.light.replace(/^Light: /, "")}`);
  if (s.people === "none") lines.push("No people in this shot.");
  if (s.people === "silhouette") lines.push("People only as silhouettes, from behind or with faces turned away into shadow.");
  if (s.people === "cropped") lines.push("Only parts of the body in the frame, cropped so that no face is visible.");
  return lines.join("\n");
}

const passes = [
  { p: "A", title: "the club: hero, pulse check, zones and six studios" },
  { p: "B", title: "class covers for the schedule" },
  { p: "C", title: "coach portraits, one series" },
  { p: "D", title: "vertical hero, goal cards, details and service rooms" },
];

const blocks = passes.map(({ p, title }, i) => {
  const list = sorted.filter((s) => s.priority === p);
  const first = num.get(list[0].id);
  const last = num.get(list[list.length - 1].id);
  return [
    `PASS ${i + 1} OF ${passes.length}: ${title} (${list.length} images, shots ${first} to ${last})`,
    "",
    BIBLE,
    "",
    RULES,
    "",
    "SHOTS",
    "",
    list.map(entry).join("\n\n"),
    "",
    `When all ${list.length} images of this pass are done, write: PASS ${i + 1} DONE.`,
  ].join("\n");
});

const md = [
  "# Kadens — batch prompts",
  "",
  `${passes.length} self-contained texts, one per pass. Paste a whole block into a chat-based image model (in one chat, in order).`,
  "Generated from `docs/shot-list.json` by `scripts/build-batch-prompts.mjs`.",
  "",
  ...blocks.flatMap((b, i) => [`## Pass ${i + 1}`, "", "```text", b, "```", ""]),
].join("\n");

writeFileSync(join(root, "docs/BATCH_PROMPTS.md"), md, "utf8");
blocks.forEach((b, i) => console.log(`pass ${i + 1}: ${b.length} chars`));
