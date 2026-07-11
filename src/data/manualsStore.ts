import { useEffect, useState } from "react";
import { manuals as seedManuals, Manual } from "./manuals";

export type { Manual };

const STORAGE_KEY = "manuals_store_v1";
const EVENT = "manuals_store_change";

function load(): Manual[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedManuals;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
