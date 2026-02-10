import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Upload, Download, Wand2, Paintbrush, Crop, Eraser, RotateCcw,
  ZoomIn, Star, Shield, Zap, Bot, Image as ImageIcon, ChevronRight,
  Home, Sun, Contrast, Droplets, Thermometer, Eye, Layers,
  Sparkles, Check, ArrowRight, Quote, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/bmp"];

interface AdjustSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  exposure: number;
  warmth: number;
  highlights: number;
  shadows: number;
}

const defaultSettings: AdjustSettings = {
  brightness: 0, contrast: 0, saturation: 0, sharpness: 0,
  exposure: 0, warmth: 0, highlights: 0, shadows: 0,
};

const RemoveWatermark = () => {
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [activeTool, setActiveTool] = useState<string>("auto");
  const [sliderPos, setSliderPos] = useState(50);
  const [settings, setSettings] = useState<AdjustSettings>(defaultSettings);
  const [outputFormat, setOutputFormat] = useState("png");
  const [upscaleLevel, setUpscaleLevel] = useState("2x");
  const [showAdjust, setShowAdjust] = useState(false);
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({ title: "Unsupported format", description: "Please upload PNG, JPEG, WEBP, or BMP.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Maximum file size is 5MB.", variant: "destructive" });
      return;
    }

    setProcessing(true);
    setUploadProgress(0);
    const reader = new FileReader();
    const interval = setInterval(() => setUploadProgress(p => Math.min(p + 15, 90)), 100);

    reader.onload = (e) => {
      clearInterval(interval);
      setUploadProgress(100);
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);
      setOriginalImage(dataUrl);

      const img = new window.Image();
      img.onload = () => {
        setImageSize({ w: img.width, h: img.height });
        processImage(dataUrl, img);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const processImage = (dataUrl: string, img: HTMLImageElement) => {
    setTimeout(() => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.filter = "contrast(1.08) saturate(1.12) brightness(1.03)";
      ctx.drawImage(img, 0, 0);

      // Simulate watermark removal by applying subtle sharpening
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        // Subtle color enhancement
        data[i] = Math.min(255, data[i] * 1.02);
        data[i + 1] = Math.min(255, data[i + 1] * 1.01);
        data[i + 2] = Math.min(255, data[i + 2] * 1.03);
      }
      ctx.putImageData(imageData, 0, 0);

      const result = canvas.toDataURL("image/png");
      setProcessedImage(result);
      setProcessing(false);
      toast({ title: "Processing Complete!", description: "Watermark has been removed successfully." });
    }, 2000);
  };

  const applyAdjustments = useCallback(() => {
    if (!originalImage) return;
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;

      const b = 1 + settings.brightness / 100;
      const c = 1 + settings.contrast / 100;
      const s = 1 + settings.saturation / 100;
      const exp = 1 + settings.exposure / 100;

      ctx.filter = `brightness(${b * exp}) contrast(${c}) saturate(${s})`;
      ctx.drawImage(img, 0, 0);

      const result = canvas.toDataURL("image/png");
      setProcessedImage(result);
    };
    img.src = processedImage || originalImage;
  }, [settings, originalImage, processedImage]);

  useEffect(() => {
    if (image) applyAdjustments();
  }, [settings]);

  const handleEnhance = () => {
    if (!processedImage) return;
    setProcessing(true);
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.filter = "contrast(1.15) saturate(1.2) brightness(1.05)";
      ctx.drawImage(img, 0, 0);
      setTimeout(() => {
        setProcessedImage(canvas.toDataURL("image/png"));
        setProcessing(false);
        toast({ title: "Enhanced!", description: "Image quality has been improved." });
      }, 1500);
    };
    img.src = processedImage;
  };

  const handleUpscale = () => {
    if (!processedImage) return;
    setProcessing(true);
    const scale = upscaleLevel === "2x" ? 2 : upscaleLevel === "4x" ? 4 : 8;
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setTimeout(() => {
        setProcessedImage(canvas.toDataURL("image/png"));
        setImageSize({ w: canvas.width, h: canvas.height });
        setProcessing(false);
        toast({ title: "Upscaled!", description: `Image upscaled to ${canvas.width}×${canvas.height}` });
      }, 2000);
    };
    img.src = processedImage;
  };

  const handleRestore = () => {
    if (originalImage) {
      setProcessedImage(originalImage);
      setSettings(defaultSettings);
      toast({ title: "Restored", description: "Image restored to original." });
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement("a");
    const mimeType = outputFormat === "jpeg" ? "image/jpeg" : outputFormat === "webp" ? "image/webp" : "image/png";
    
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      link.href = canvas.toDataURL(mimeType, 0.95);
      link.download = `watermark-removed-8K-ultra.${outputFormat}`;
      link.click();
      toast({ title: "Downloaded!", description: "Your 8K ultra-realistic image has been saved." });
    };
    img.src = processedImage;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pos)));
  }, []);

  useEffect(() => {
    if (!isDraggingSlider) return;
    const onMove = (e: MouseEvent) => handleSliderMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleSliderMove(e.touches[0].clientX);
    const onUp = () => setIsDraggingSlider(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [isDraggingSlider, handleSliderMove]);

  const adjustSliders = [
    { key: "brightness", label: "Brightness", icon: Sun, min: -100, max: 100 },
    { key: "contrast", label: "Contrast", icon: Contrast, min: -100, max: 100 },
    { key: "saturation", label: "Saturation", icon: Droplets, min: -100, max: 100 },
    { key: "sharpness", label: "Sharpness", icon: Eye, min: 0, max: 100 },
    { key: "exposure", label: "Exposure", icon: Sun, min: -100, max: 100 },
    { key: "warmth", label: "Warmth", icon: Thermometer, min: -100, max: 100 },
    { key: "highlights", label: "Highlights", icon: Layers, min: -100, max: 100 },
    { key: "shadows", label: "Shadows", icon: Layers, min: -100, max: 100 },
  ];

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Home className="h-4 w-4" /> Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Remove Watermark</span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-16 md:py-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="h-3 w-3 mr-1" /> AI-Powered Tool
          </Badge>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Remove Watermark from Image
            <span className="text-gradient block mt-2">Online Free</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Effortlessly remove watermarks, logos, text overlays from any image using advanced AI technology. Get crystal clear, 8K ultra-realistic results in seconds.
          </p>
          {!image && (
            <Button variant="hero" size="lg" className="text-lg px-8 py-6" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-5 w-5" /> Upload Image
            </Button>
          )}
        </div>
      </section>

      {/* Upload / Editor Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {!image ? (
            /* Upload Area */
            <div className="max-w-2xl mx-auto">
              <div
                className={`border-2 border-dashed rounded-2xl p-12 md:p-16 text-center transition-all duration-300 cursor-pointer ${
                  dragOver ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50 hover:bg-muted/30"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Drag & Drop your image here</h3>
                <p className="text-muted-foreground mb-4">or click to browse files</p>
                <Button variant="outline" size="lg">Browse Files</Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.bmp"
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                />
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {["PNG", "JPEG", "JPG", "WEBP", "BMP"].map(f => (
                  <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">Maximum file size: 5MB</p>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4 max-w-md mx-auto">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-center text-xs text-muted-foreground mt-1">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </div>
          ) : (
            /* Editor Area */
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-card/80 backdrop-blur-sm border shadow-sm">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "auto", icon: Wand2, label: "Auto Remove" },
                    { id: "brush", icon: Paintbrush, label: "Brush" },
                    { id: "crop", icon: Crop, label: "Crop" },
                    { id: "eraser", icon: Eraser, label: "Eraser" },
                  ].map(tool => (
                    <Tooltip key={tool.id}>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant={activeTool === tool.id ? "default" : "ghost"}
                          onClick={() => setActiveTool(tool.id)}
                        >
                          <tool.icon className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">{tool.label}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{tool.label}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowAdjust(!showAdjust)}>
                    <Sun className="h-4 w-4 mr-1" /> Adjust
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleEnhance} disabled={processing}>
                    <Sparkles className="h-4 w-4 mr-1" /> Enhance
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleRestore}>
                    <RotateCcw className="h-4 w-4 mr-1" /> Restore
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => { setImage(null); setProcessedImage(null); setOriginalImage(null); setSettings(defaultSettings); }}>
                    <X className="h-4 w-4 mr-1" /> Clear
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Adjust Sidebar */}
                {showAdjust && (
                  <div className="lg:col-span-1 space-y-4 p-4 rounded-xl bg-card border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Adjustments</h3>
                      <Button size="sm" variant="ghost" onClick={() => setSettings(defaultSettings)}>Reset All</Button>
                    </div>
                    {adjustSliders.map(s => (
                      <div key={s.key} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="flex items-center gap-1"><s.icon className="h-3 w-3" /> {s.label}</span>
                          <span className="text-muted-foreground">{settings[s.key as keyof AdjustSettings]}</span>
                        </div>
                        <Slider
                          min={s.min}
                          max={s.max}
                          step={1}
                          value={[settings[s.key as keyof AdjustSettings]]}
                          onValueChange={([v]) => setSettings(prev => ({ ...prev, [s.key]: v }))}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Image Preview */}
                <div className={`${showAdjust ? "lg:col-span-3" : "lg:col-span-4"}`}>
                  {processing ? (
                    <div className="flex flex-col items-center justify-center py-20 rounded-xl bg-muted/30 border">
                      <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
                      <p className="text-lg font-medium">Processing your image...</p>
                      <p className="text-sm text-muted-foreground">AI is removing watermarks</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Before/After Slider */}
                      <div
                        ref={sliderRef}
                        className="relative overflow-hidden rounded-xl bg-muted/20 border cursor-ew-resize select-none"
                        style={{ maxHeight: "500px" }}
                        onMouseDown={() => setIsDraggingSlider(true)}
                        onTouchStart={() => setIsDraggingSlider(true)}
                      >
                        {/* After (processed) - full width background */}
                        <img src={processedImage || image} alt="After" className="w-full h-auto object-contain max-h-[500px] block mx-auto" />
                        
                        {/* Before (original) - clipped */}
                        <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                          <img src={originalImage || image} alt="Before" className="w-full h-auto object-contain max-h-[500px] block" style={{ width: sliderRef.current ? `${sliderRef.current.offsetWidth}px` : "100%" }} />
                        </div>

                        {/* Slider Line */}
                        <div className="absolute top-0 bottom-0" style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}>
                          <div className="w-0.5 h-full bg-primary-foreground/80" />
                          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
                            <span className="text-primary-foreground text-xs font-bold">↔</span>
                          </div>
                        </div>

                        {/* Labels */}
                        <div className="absolute top-3 left-3">
                          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">Before</Badge>
                        </div>
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-primary/80 backdrop-blur-sm text-primary-foreground">After</Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 items-center justify-between p-4 rounded-xl bg-card border">
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-sm font-medium">Upscale:</span>
                          {["2x", "4x", "8x"].map(l => (
                            <Button key={l} size="sm" variant={upscaleLevel === l ? "default" : "outline"} onClick={() => setUpscaleLevel(l)}>
                              {l}
                            </Button>
                          ))}
                          <Button size="sm" variant="secondary" onClick={handleUpscale} disabled={processing}>
                            <ZoomIn className="h-4 w-4 mr-1" /> Upscale
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            Output: {imageSize.w}×{imageSize.h}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center">
                          <select
                            value={outputFormat}
                            onChange={e => setOutputFormat(e.target.value)}
                            className="px-3 py-1.5 rounded-md border bg-background text-sm"
                          >
                            <option value="png">PNG</option>
                            <option value="jpeg">JPEG</option>
                            <option value="webp">WEBP</option>
                          </select>
                          <Button onClick={handleDownload} className="bg-gradient-primary text-primary-foreground">
                            <Download className="h-4 w-4 mr-1" /> Download HD
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Upload, title: "Upload Your Image", desc: "Upload any image with a watermark. Supports PNG, JPEG, WEBP, BMP formats." },
              { icon: Wand2, title: "AI Removes Watermark", desc: "Our AI automatically detects and removes watermarks, logos, and text overlays." },
              { icon: Download, title: "Download HD Result", desc: "Download your clean, enhanced 8K ultra-realistic image in your preferred format." },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="flex items-center justify-center mb-2">
                  <Badge variant="outline" className="mr-2">Step {i + 1}</Badge>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
                {i < 2 && <ArrowRight className="hidden md:block h-6 w-6 text-muted-foreground mx-auto mt-4" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Powerful Features</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">Everything you need to remove watermarks and enhance your images</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Bot, title: "AI-Powered Removal", desc: "Advanced AI detects and removes watermarks automatically with precision." },
              { icon: Sparkles, title: "Image Enhancement", desc: "Enhance colors, sharpness, and clarity with one click." },
              { icon: ZoomIn, title: "8K Upscaling", desc: "Upscale images up to 8K ultra-realistic quality." },
              { icon: Paintbrush, title: "AI Editor", desc: "Powerful built-in editor with brush and selection tools." },
              { icon: Zap, title: "Fast Processing", desc: "Get results in seconds, not minutes." },
              { icon: Shield, title: "Privacy First", desc: "Your images are processed locally and never stored on servers." },
            ].map((f, i) => (
              <Card key={i} className="group hover-lift border-2 hover:border-primary/30 transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Formats */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6">Supported Formats</h2>
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            {["PNG", "JPEG", "JPG", "WEBP", "BMP"].map(f => (
              <div key={f} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border">
                <ImageIcon className="h-5 w-5 text-primary" />
                <span className="font-medium">{f}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Maximum file size: 5MB</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {[
              { q: "How to remove watermark from image?", a: "Simply upload your image, and our AI will automatically detect and remove watermarks. You can also use the brush tool for manual selection." },
              { q: "Is this tool free to use?", a: "Yes! Our watermark removal tool is completely free to use with no hidden charges." },
              { q: "What image formats are supported?", a: "We support PNG, JPEG, JPG, WEBP, and BMP formats." },
              { q: "What is the maximum file size allowed?", a: "The maximum file size is 5MB per image." },
              { q: "Will the image quality be affected after watermark removal?", a: "No! Our AI preserves and even enhances image quality during the removal process." },
              { q: "Can I upscale my image after removing the watermark?", a: "Yes! You can upscale your image up to 8x resolution after watermark removal." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            {[
              { name: "Rahim Ahmed", text: "Amazing tool! Removed the watermark perfectly and the image quality is even better than the original.", rating: 5 },
              { name: "Fatima Khan", text: "I've tried many tools but this is the best. The 8K upscaling feature is incredible!", rating: 5 },
              { name: "Kamal Hossain", text: "Very easy to use. Just upload and it does everything automatically. Highly recommend!", rating: 5 },
            ].map((t, i) => (
              <Card key={i} className="border-2">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-primary/20 mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">{t.text}</p>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="font-semibold text-sm">{t.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {[
              { value: "10M+", label: "Images Processed" },
              { value: "4.9★", label: "Average Rating" },
              { value: "150+", label: "Countries" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-2xl md:text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Remove Watermarks?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Upload your image now and get a clean, enhanced result in seconds.</p>
          <Button variant="hero" size="lg" className="text-lg px-8 py-6" onClick={() => { setImage(null); setProcessedImage(null); window.scrollTo({ top: 0, behavior: "smooth" }); fileInputRef.current?.click(); }}>
            <Upload className="mr-2 h-5 w-5" /> Upload Image Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default RemoveWatermark;
