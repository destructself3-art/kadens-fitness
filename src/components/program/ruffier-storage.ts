// The last Ruffier result in this browser. The test writes it; the program builder attaches it to the program
// a visitor sends to a coach (the admin reads the "ruffier" key, see src/components/admin/lead-program.ts).

const KEY = "kadens:ruffier";

/** Per-minute pulse values, the index and the grade label. */
export type StoredRuffier = { index: number; grade: string; p1: number; p2: number; p3: number; date: string };

export function saveRuffier(value: StoredRuffier) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Private mode or blocked storage: the result still shows, it just is not remembered.
  }
}

export function readRuffier(): StoredRuffier | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<StoredRuffier>;
    const nums = [v.index, v.p1, v.p2, v.p3];
    if (!nums.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
    return { index: v.index!, grade: String(v.grade ?? ""), p1: v.p1!, p2: v.p2!, p3: v.p3!, date: String(v.date ?? "") };
  } catch {
    return null;
  }
}
