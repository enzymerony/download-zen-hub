import { useEffect, useState } from "react";
import { manuals as seedManuals, Manual } from "./manuals";

export type { Manual };

const STORAGE_KEY = "manuals_store_v1";
const EVENT = "manuals_store_change";
const LEGACY_MOZILLA_PDF = /cdn\.mozilla\.net\/pdfjs\/tracemonkey\.pdf/i;

function normalize(list: Manual[]): { list: Manual[]; changed: boolean } {
  let changed = false;
  const seedById = new Map(seedManuals.map((m) => [m.id, m.pdfUrl]));
  const fallbackPdf = seedManuals[0]?.pdfUrl ?? "";
  const normalized = list.map((manual) => {
    if (!LEGACY_MOZILLA_PDF.test(manual.pdfUrl || "")) return manual;
    changed = true;
    return {
      ...manual,
      pdfUrl: seedById.get(manual.id) ?? fallbackPdf,
    };
  });
  return { list: normalized, changed };
}

function load(): Manual[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      // First run only — seed defaults and persist so future loads trust storage.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedManuals));
      return seedManuals;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const normalized = normalize(parsed);
      if (normalized.changed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized.list));
      }
      return normalized.list;
    }
  } catch {}
  return seedManuals;
}

function save(list: Manual[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function getManuals(): Manual[] {
  return load();
}

export function upsertManual(m: Manual) {
  const list = load();
  const idx = list.findIndex((x) => x.id === m.id);
  const next: Manual = { ...m, isPremium: (m.price ?? 0) > 0 };
  if (idx >= 0) list[idx] = next;
  else list.unshift(next);
  save(list);
}

export function deleteManual(id: string) {
  save(load().filter((m) => m.id !== id));
}

export function resetManuals() {
  save(seedManuals);
}

export function useManuals() {
  const [list, setList] = useState<Manual[]>(() => load());
  useEffect(() => {
    const handler = () => setList(load());
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return list;
}
