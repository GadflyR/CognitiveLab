/* very small helper that stores progress by word id */
export interface SRRecord {
    ef: number;      // easiness factor
    i: number;       // repetition count
    due: number;     // next due timestamp (ms)
  }
  const KEY = "cnVocabProgress";
  
  export type ProgressMap = Record<string, SRRecord>;
  
  export const loadProgress = (): ProgressMap =>
    JSON.parse(localStorage.getItem(KEY) || "{}");
  
  export const saveProgress = (db: ProgressMap) =>
    localStorage.setItem(KEY, JSON.stringify(db));
  
  /* SM-2 lite update */
  export const gradeAnswer = (
    db: ProgressMap,
    id: string,
    correct: boolean
  ) => {
    const now = Date.now();
    const rec = db[id] || { ef: 2.5, i: 0, due: now };
    const q = correct ? 5 : 2;             // crude 0-5 score
    const ef = Math.max(1.3, rec.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    const next =
      q < 3
        ? now + 12 * 3600 * 1000           // 12h if failed
        : now +
          (rec.i <= 1 ? 1 : Math.round(rec.i - 1)) * 24 * 3600 * 1000 * ef;
    db[id] = { ef, i: q < 3 ? 0 : rec.i + 1, due: next };
  };
  