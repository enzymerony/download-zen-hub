import React, { useState, useCallback, useRef } from "react";
import { cleanImage, quickCleanImage } from "@/services/imageCleaningService";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, RotateCcw, Wand2, Zap, ArrowLeftRight } from "lucide-react";

interface CleaningResult {
  originalImage: string;
  cleanedImage: string;
  detectedElements: string[];
}

const ImageCleaner: React.FC = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [result, setResult] = useState<CleaningResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"ai" | "quick">("ai");
  const [viewMode, setViewMode] = useState<"side" | "slider">("side");
  const [sliderPos, setSliderPos] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("❌ Please upload an image file (PNG, JPG, WEBP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("❌ File size must be less than 10MB");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      setProgress(10);
      setProgressText("📤 Loading image...");
      await new Promise((r) => setTimeout(r, 300));

      setProgress(30);
      setProgressText("🔍 Detecting text, logos, watermarks...");
      await new Promise((r) => setTimeout(r, 300));

      setProgress(50);
      setProgressText(mode === "ai" ? "🤖 AI cleaning in progress..." : "⚡ Quick cleaning in progress...");

      const cleaningResult = mode === "ai" ? await cleanImage(file) : await quickCleanImage(file);

      setProgress(90);
      setProgressText("✨ Finalizing...");
      await new Promise((r) => setTimeout(r, 300));

      setProgress(100);
      setProgressText("✅ Done!");
      setResult(cleaningResult);
    } catch (err: any) {
      setError(`❌ Error: ${err.message || "Something went wrong"}`);
    } finally {
      setIsProcessing(false);
    }
  }, [mode]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleSliderMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, x)));
  }, []);

  const downloadImage = useCallback(() => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result.cleanedImage;
    link.download = `cleaned_image_${Date.now()}.png`;
    link.click();
  }, [result]);

  const resetAll = useCallback(() => {
    setResult(null);
    setError(null);
    setProgress(0);
    setProgressText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            🧹 AI Image Cleaner
          </h1>
          <p className="text-lg text-muted-foreground">
            Remove text, logos, watermarks, icons & emojis automatically
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center gap-3 mb-8">
          <Button
            onClick={() => setMode("ai")}
            variant={mode === "ai" ? "default" : "outline"}
            className="rounded-full gap-2"
          >
            <Wand2 className="h-4 w-4" /> AI Clean (Hugging Face)
          </Button>
          <Button
            onClick={() => setMode("quick")}
            variant={mode === "quick" ? "default" : "outline"}
            className="rounded-full gap-2"
          >
            <Zap className="h-4 w-4" /> Quick Clean (No API)
          </Button>
        </div>

        {/* Upload Area */}
        {!result && !isProcessing && (
          <Card
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
              isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"
            }`}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl font-semibold mb-2">
              {isDragOver ? "Drop your image here!" : "Drag & Drop or Click to Upload"}
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PNG, JPG, WEBP • Max 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card className="p-4 mt-6 border-destructive bg-destructive/10 text-destructive text-center font-medium">
            {error}
          </Card>
        )}

        {/* Processing */}
        {isProcessing && (
          <Card className="p-8 mt-6 text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-lg font-medium mb-4">{progressText}</p>
            <Progress value={progress} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">{progress}%</p>
          </Card>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6 space-y-6">
            {/* Detection Info */}
            <Card className="p-4">
              <p className="font-semibold mb-2">🔍 Processing Details:</p>
              <div className="flex flex-wrap gap-2">
                {result.detectedElements.map((item, i) => (
                  <Badge key={i} variant="secondary">{item}</Badge>
                ))}
              </div>
            </Card>

            {/* View Mode Toggle */}
            <div className="flex justify-center gap-3">
              <Button
                onClick={() => setViewMode("side")}
                variant={viewMode === "side" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                Side by Side
              </Button>
              <Button
                onClick={() => setViewMode("slider")}
                variant={viewMode === "slider" ? "default" : "outline"}
                size="sm"
                className="rounded-full gap-2"
              >
                <ArrowLeftRight className="h-3 w-3" /> Slider Compare
              </Button>
            </div>

            {/* Side by Side */}
            {viewMode === "side" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-3">
                  <p className="text-center font-semibold mb-2">📷 Original</p>
                  <img src={result.originalImage} alt="Original" className="w-full rounded-lg" />
                </Card>
                <Card className="p-3">
                  <p className="text-center font-semibold mb-2">✨ Cleaned</p>
                  <img src={result.cleanedImage} alt="Cleaned" className="w-full rounded-lg" />
                </Card>
              </div>
            )}

            {/* Slider View */}
            {viewMode === "slider" && (
              <Card className="p-3">
                <div
                  ref={sliderRef}
                  className="relative overflow-hidden rounded-lg cursor-col-resize select-none"
                  onMouseMove={handleSliderMove}
                >
                  <img src={result.cleanedImage} alt="Cleaned" className="w-full block" />
                  <div
                    className="absolute top-0 left-0 h-full overflow-hidden"
                    style={{ width: `${sliderPos}%` }}
                  >
                    <img
                      src={result.originalImage}
                      alt="Original"
                      className="h-full object-cover"
                      style={{ width: `${(100 / sliderPos) * 100}%`, maxWidth: "none" }}
                    />
                  </div>
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-primary"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full p-1">
                      <ArrowLeftRight className="h-4 w-4" />
                    </div>
                  </div>
                  <Badge className="absolute top-2 left-2" variant="secondary">Original</Badge>
                  <Badge className="absolute top-2 right-2" variant="secondary">Cleaned</Badge>
                </div>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <Button onClick={downloadImage} className="gap-2">
                <Download className="h-4 w-4" /> Download Cleaned Image
              </Button>
              <Button onClick={resetAll} variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" /> Clean Another Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCleaner;
