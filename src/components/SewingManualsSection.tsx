import { useEffect, useMemo, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
// @ts-ignore vite worker url import
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Search, Lock, Wallet, FileText, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { manuals, Manual } from "@/data/manuals";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const PURCHASE_KEY = "purchased_manuals_v1";

function getPurchased(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PURCHASE_KEY) || "[]");
  } catch {
    return [];
  }
}
function markPurchased(id: string) {
  const list = getPurchased();
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(PURCHASE_KEY, JSON.stringify(list));
  }
}

export default function SewingManualsSection() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(manuals[0].id);
  const [purchased, setPurchased] = useState<string[]>(getPurchased());
  const { user } = useAuth();
  const { balance, purchaseWithBalance, refetch } = useWallet();

  const selected = useMemo(
    () => manuals.find((m) => m.id === selectedId)!,
    [selectedId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return manuals;
    return manuals.filter(
      (m) =>
        m.brand.toLowerCase().includes(q) ||
        m.model.toLowerCase().includes(q) ||
        m.boardModel.toLowerCase().includes(q)
    );
  }, [query]);

  const isUnlocked = !selected.isPremium || purchased.includes(selected.id);

  const handleBuy = async () => {
    if (!user) {
      toast.error("অনুগ্রহ করে প্রথমে লগইন করুন।");
      return;
    }
    if (balance < selected.price) {
      toast.error("Insufficient Balance! Please top up your wallet.");
      return;
    }
    try {
      const ok = await purchaseWithBalance(
        selected.id,
        `${selected.brand} ${selected.model} Manual`,
        selected.price
      );
      if (ok === false) {
        toast.error("Insufficient Balance! Please top up your wallet.");
        return;
      }
    } catch (e) {
      // fallback: proceed as mock purchase
      console.warn("purchase rpc failed, using mock unlock", e);
    }
    markPurchased(selected.id);
    setPurchased(getPurchased());
    refetch();
    toast.success(`✅ Unlocked: ${selected.brand} ${selected.model}`);
  };

  return (
    <section className="py-12 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Sewing Machine Board Manuals
          </h2>
          <p className="text-muted-foreground">
            Search brand, model or board — read secure PDFs online
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Sidebar */}
          <Card className="p-4 h-fit lg:sticky lg:top-20">
            <div className="relative mb-3">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search machine / board model..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No manuals found
                </p>
              )}
              {filtered.map((m) => {
                const active = m.id === selectedId;
                const unlocked = !m.isPremium || purchased.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedId(m.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      active
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {m.brand} — {m.model}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          Board: {m.boardModel}
                        </p>
                      </div>
                      {m.isPremium ? (
                        unlocked ? (
                          <Badge variant="secondary" className="shrink-0">Owned</Badge>
                        ) : (
                          <Badge variant="default" className="shrink-0">৳{m.price}</Badge>
                        )
                      ) : (
                        <Badge variant="outline" className="shrink-0">Free</Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Viewer */}
          <div className="space-y-3">
            <SecurePdfViewer
              key={selected.id + (isUnlocked ? "-u" : "-l")}
              url={selected.pdfUrl}
              locked={!isUnlocked}
              title={`${selected.brand} ${selected.model}`}
            />

            {/* Action bar */}
            <Card className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-sm">
                    {selected.brand} {selected.model}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Board: {selected.boardModel}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  Balance: <span className="font-semibold text-foreground">৳{balance.toFixed(0)}</span>
                </div>
                {selected.isPremium && !isUnlocked && (
                  <>
                    <Badge variant="default" className="text-sm">৳ {selected.price}</Badge>
                    <Button
                      onClick={handleBuy}
                      disabled={balance < selected.price}
                    >
                      Buy Manual
                    </Button>
                  </>
                )}
                {isUnlocked && (
                  <Badge variant="secondary" className="text-sm">
                    ✓ Unlocked
                  </Badge>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------- Secure PDF Viewer -------------------- */

interface ViewerProps {
  url: string;
  locked: boolean;
  title: string;
}

function SecurePdfViewer({ url, locked, title }: ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pageTexts, setPageTexts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const pagesRef = useRef<HTMLDivElement[]>([]);

  // Load PDF
  useEffect(() => {
    if (locked) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const doc = await pdfjsLib.getDocument(url).promise;
        if (cancelled) return;
        setPdf(doc);
        setNumPages(doc.numPages);
        // Preload text for search
        const texts: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const tc = await page.getTextContent();
          texts.push(tc.items.map((it: any) => it.str).join(" "));
        }
        if (!cancelled) setPageTexts(texts);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load PDF");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url, locked]);

  // Render pages
  useEffect(() => {
    if (!pdf) return;
    let cancelled = false;
    (async () => {
      pagesRef.current = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        if (cancelled) return;
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.3 });
        const wrapper = pagesRef.current[i - 1];
        if (!wrapper) continue;
        const canvas = wrapper.querySelector("canvas") as HTMLCanvasElement;
        if (!canvas) continue;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pdf]);

  // Security: block context menu + shortcuts
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const blockContext = (e: MouseEvent) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (
        (e.ctrlKey || e.metaKey) &&
        (k === "s" || k === "p" || k === "u" || (e.shiftKey && k === "i"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        toast.error("This action is disabled for secure manuals.");
      }
      if (k === "f12") {
        e.preventDefault();
      }
    };
    el.addEventListener("contextmenu", blockContext);
    window.addEventListener("keydown", blockKeys);
    return () => {
      el.removeEventListener("contextmenu", blockContext);
      window.removeEventListener("keydown", blockKeys);
    };
  }, []);

  const handleSearch = () => {
    const q = searchTerm.trim().toLowerCase();
    if (!q || pageTexts.length === 0) return;
    const idx = pageTexts.findIndex((t) => t.toLowerCase().includes(q));
    if (idx === -1) {
      toast.error(`"${searchTerm}" not found in this manual`);
      return;
    }
    const pageNum = idx + 1;
    setCurrentPage(pageNum);
    const el = pagesRef.current[idx];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("ring-4", "ring-primary");
      setTimeout(() => el.classList.remove("ring-4", "ring-primary"), 2000);
    }
    toast.success(`Found on page ${pageNum}`);
  };

  if (locked) {
    return (
      <Card className="p-10 text-center bg-gradient-to-br from-muted/40 to-muted/10 min-h-[420px] flex flex-col items-center justify-center">
        <Lock className="h-14 w-14 text-primary mb-4" />
        <h3 className="text-xl font-bold mb-2">This is a Premium Manual</h3>
        <p className="text-muted-foreground max-w-md">
          Please purchase to unlock full access to <b>{title}</b>.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Toolbar */}
      <div className="p-3 border-b bg-muted/30 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search Error Code, Programme No or Issue (e.g. E-3, P05)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} size="sm">Search</Button>
        <div className="flex items-center gap-1 ml-auto">
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              const p = Math.max(1, currentPage - 1);
              setCurrentPage(p);
              pagesRef.current[p - 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm px-2 tabular-nums">
            {currentPage} / {numPages || "…"}
          </span>
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              const p = Math.min(numPages, currentPage + 1);
              setCurrentPage(p);
              pagesRef.current[p - 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF area */}
      <div
        ref={containerRef}
        className="relative bg-neutral-900 max-h-[70vh] overflow-y-auto select-none"
        style={{ userSelect: "none" }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-neutral-900/60">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
        <div className="flex flex-col items-center py-4 gap-4">
          {Array.from({ length: numPages }).map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) pagesRef.current[i] = el;
              }}
              className="bg-white shadow-lg transition-all rounded-sm"
              data-page={i + 1}
            >
              <canvas />
            </div>
          ))}
        </div>
        {/* Anti-screenshot overlay watermark */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06] text-4xl font-bold rotate-[-25deg] text-white">
          10 ANA • SECURE
        </div>
      </div>
    </Card>
  );
}
