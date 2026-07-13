import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Manual } from "./manuals";

export type { Manual };

const EVENT = "manuals_store_change";

// In-memory cache so navigations don't flash empty state.
let cache: Manual[] = [];
let loaded = false;
let inflight: Promise<Manual[]> | null = null;

type Row = {
  id: string;
  brand: string;
  model: string;
  board_model: string | null;
  pdf_url: string;
  price: number | string | null;
  is_premium: boolean | null;
};

function rowToManual(r: Row): Manual {
  const price = Number(r.price ?? 0) || 0;
  return {
    id: r.id,
    brand: r.brand,
    model: r.model,
    boardModel: r.board_model ?? "",
    pdfUrl: r.pdf_url,
    price,
    isPremium: r.is_premium ?? price > 0,
  };
}

function manualToRow(m: Manual): Row {
  return {
    id: m.id,
    brand: m.brand,
    model: m.model,
    board_model: m.boardModel ?? "",
    pdf_url: m.pdfUrl,
    price: Number(m.price) || 0,
    is_premium: (Number(m.price) || 0) > 0,
  };
}

function emit() {
  window.dispatchEvent(new Event(EVENT));
}

async function fetchAll(): Promise<Manual[]> {
  const { data, error } = await supabase
    .from("manuals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[manuals] fetch failed", error);
    return cache;
  }
  cache = (data as Row[]).map(rowToManual);
  loaded = true;
  return cache;
}

export function getManuals(): Manual[] {
  if (!loaded && !inflight) {
    inflight = fetchAll().then((list) => {
      inflight = null;
      emit();
      return list;
    });
  }
  return cache;
}

export async function refreshManuals(): Promise<Manual[]> {
  const list = await fetchAll();
  emit();
  return list;
}

export async function upsertManual(m: Manual): Promise<void> {
  const row = manualToRow(m);
  const { error } = await supabase.from("manuals").upsert(row, { onConflict: "id" });
  if (error) throw error;
  await refreshManuals();
}

export async function deleteManual(id: string): Promise<void> {
  const { error } = await supabase.from("manuals").delete().eq("id", id);
  if (error) throw error;
  await refreshManuals();
}

export async function resetManuals(): Promise<void> {
  // No-op destructive reset; just re-fetch what the DB currently has.
  await refreshManuals();
}

export function useManuals() {
  const [list, setList] = useState<Manual[]>(() => getManuals());

  useEffect(() => {
    let cancelled = false;
    const sync = () => {
      if (!cancelled) setList([...cache]);
    };

    // Initial + refresh on mount so the homepage always reflects DB state.
    refreshManuals().then(sync).catch(() => {});

    window.addEventListener(EVENT, sync);

    // Realtime: any change in the manuals table triggers a refresh so admin
    // add/edit/delete propagates instantly across every open browser.
    const channel = supabase
      .channel("manuals-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "manuals" },
        () => {
          refreshManuals().then(sync).catch(() => {});
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      window.removeEventListener(EVENT, sync);
      supabase.removeChannel(channel);
    };
  }, []);

  return list;
}
