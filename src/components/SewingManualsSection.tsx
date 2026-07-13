import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Wallet,
  FileText,
  Download,
  Eye,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useManuals } from "@/data/manualsStore";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";

const DOWNLOAD_KEY = "downloaded_manuals_v1";

function getDownloaded(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DOWNLOAD_KEY) || "[]");
  } catch {
    return [];
  }
}
function markDownloaded(id: string) {
  const list = getDownloaded();
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(DOWNLOAD_KEY, JSON.stringify(list));
  }
}

/** Extract Google Drive file ID from any common Drive URL format. */
function extractDriveId(url: string): string | null {
  if (!url) return null;
  // /file/d/FILE_ID/...
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return m1[1];
  // ?id=FILE_ID or &id=FILE_ID  (open?id= / uc?id=)
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return m2[1];
  // /d/FILE_ID
  const m3 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m3) return m3[1];
  return null;
}

function isDriveUrl(url: string): boolean {
  return /drive\.google\.com|docs\.google\.com/.test(url || "");
}

/** Convert any Drive URL to an embeddable /preview URL. */
function toDrivePreview(url: string): string {
  const id = extractDriveId(url);
  if (!id) return url;
  return `https://drive.google.com/file/d/${id}/preview?hl=en`;
}

/** Best-effort direct download URL for Drive files. */
function toDriveDownload(url: string): string {
  const id = extractDriveId(url);
  if (!id) return url;
  return `https://drive.google.com/uc?export=download&id=${id}`;
}

async function triggerDownload(url: string, filename: string) {
  const isDrive = isDriveUrl(url);
  const finalUrl = isDrive ? toDriveDownload(url) : url;
  try {
    if (isDrive) {
      // Drive blocks fetch via CORS — open in new tab so browser handles it.
      window.open(finalUrl, "_blank", "noopener,noreferrer");
      return;
    }
    const res = await fetch(finalUrl);
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    window.open(finalUrl, "_blank", "noopener,noreferrer");
  }
}

export default function SewingManualsSection() {
  const allManuals = useManuals();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(allManuals[0]?.id ?? "");
  const [downloaded, setDownloaded] = useState<string[]>(getDownloaded());
  const [viewerOpen, setViewerOpen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { balance, purchaseWithBalance, refetch } = useWallet();

  useEffect(() => {
    if (allManuals.length && !allManuals.find((m) => m.id === selectedId)) {
      setSelectedId(allManuals[0].id);
    }
  }, [allManuals, selectedId]);

  const selected = useMemo(
    () => allManuals.find((m) => m.id === selectedId) ?? allManuals[0],
    [selectedId, allManuals]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allManuals;
    return allManuals.filter(
      (m) =>
        m.brand.toLowerCase().includes(q) ||
        m.model.toLowerCase().includes(q) ||
        m.boardModel.toLowerCase().includes(q)
    );
  }, [query, allManuals]);

  if (!selected) return null;

  const handleView = (id: string) => {
    setSelectedId(id);
    setViewerOpen(true);
    setTimeout(() => {
      viewerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const handleDownload = async (id: string) => {
    const manual = allManuals.find((m) => m.id === id);
    if (!manual) return;
    const isPaid = manual.price > 0;
    const alreadyPaid = downloaded.includes(manual.id);
    const filename = `${manual.brand}-${manual.model}.pdf`.replace(/\s+/g, "_");

    if (!isPaid || alreadyPaid) {
      await triggerDownload(manual.pdfUrl, filename);
      toast.success("Download started");
      return;
    }
    if (!user) {
      toast.error("Please sign in to download premium manuals.");
      return;
    }
    if (balance < manual.price) {
      toast.error("Insufficient Balance to download this manual.");
      return;
    }
    try {
      const ok = await purchaseWithBalance(
        manual.id,
        `${manual.brand} ${manual.model} Manual`,
        manual.price
      );
      if (ok === false) {
        toast.error("Insufficient Balance to download this manual.");
        return;
      }
    } catch (e) {
      console.warn("purchase fallback", e);
    }
    markDownloaded(manual.id);
    setDownloaded(getDownloaded());
    refetch();
    await triggerDownload(manual.pdfUrl, filename);
    toast.success(`✅ Purchased & downloaded: ${manual.brand} ${manual.model}`);
  };

  return (
    <section className="py-12 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Sewing Machine Board Manuals
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Read any manual online for free. Pay only to download premium PDFs.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-6">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search brand / machine / board model..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
        </div>

        {/* Manual cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-8">
              No manuals found
            </p>
          )}
          {filtered.map((m) => {
            const isPaid = m.price > 0;
            const alreadyPaid = downloaded.includes(m.id);
            const active = m.id === selectedId && viewerOpen;
            return (
              <Card
                key={m.id}
                className={`p-4 flex flex-col gap-3 transition-all hover:shadow-md ${
                  active ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <p className="font-semibold text-sm md:text-base truncate">
                        {m.brand} — {m.model}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      Board: {m.boardModel}
                    </p>
                  </div>
                  {isPaid ? (
                    <Badge variant="default" className="shrink-0">
                      ৳{m.price}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="shrink-0">
                      Free
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 h-10"
                    onClick={() => handleView(m.id)}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    className="w-full gap-1.5 h-10"
                    onClick={() => handleDownload(m.id)}
                  >
                    <Download className="h-4 w-4" />
                    {isPaid && !alreadyPaid ? `৳${m.price}` : "Free"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Viewer */}
        {viewerOpen && (
          <div ref={viewerRef} className="space-y-3 scroll-mt-20">
            <Card className="p-3 md:p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-5 w-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {selected.brand} {selected.model}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Board: {selected.boardModel}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  <span className="font-semibold text-foreground">
                    ৳{balance.toFixed(0)}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDownload(selected.id)}
                  className="gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  {selected.price > 0 && !downloaded.includes(selected.id)
                    ? `Buy & Download (৳${selected.price})`
                    : "Download PDF"}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setViewerOpen(false)}
                  aria-label="Close viewer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            <DrivePdfViewer
              key={selected.id}
              url={selected.pdfUrl}
              title={`${selected.brand} ${selected.model}`}
            />
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------ Google Drive / PDF Iframe Viewer ------------------ */

function DrivePdfViewer({ url, title }: { url: string; title: string }) {
  const convertedUrl = useMemo(() => {
    if (!url) return "";
    if (isDriveUrl(url)) return toDrivePreview(url);
    return url;
  }, [url]);

  if (!convertedUrl) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No PDF URL configured for this manual.
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
      <div className="relative w-full h-[75vh] min-h-[600px] bg-muted overflow-hidden">
        <iframe
          src={convertedUrl}
          title={title}
          width="100%"
          height="100%"
          allow="autoplay"
          style={{ border: "none" }}
        />
        {/* Security mask: blocks the "Pop-out / Open in new tab" icon on the
            top-right of the Google Drive toolbar while keeping the search /
            find UI on the top-left fully clickable. */}
        <div
          className="absolute top-0 right-0 w-[150px] h-[50px] bg-transparent z-10"
          aria-hidden="true"
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </Card>
  );
}
