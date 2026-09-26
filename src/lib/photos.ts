import manifest from "@/data/photo-manifest.json";
import { SHOT_META, type ShotMode } from "@/data/shot-meta";

export type Photo = { src: string; width: number; height: number; blur: string };

// Filled by `npm run photos` from the files in photos-raw/.
const PHOTOS = manifest as Record<string, Photo>;

export function getPhoto(id?: string | null): Photo | null {
  return id ? (PHOTOS[id] ?? null) : null;
}

export function shotTone(id: string): ShotMode {
  return SHOT_META[id]?.mode ?? "pulse";
}
