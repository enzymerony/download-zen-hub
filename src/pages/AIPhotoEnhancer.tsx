import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Sparkles, Download, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AIPhotoEnhancer = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [enhancementLevel, setEnhancementLevel] = useState([75]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, WEBP)",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setEnhancedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const enhanceImage = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enhance-photo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: originalImage,
            enhancementLevel: enhancementLevel[0]
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Enhancement failed');
      }

      const data = await response.json();
      setEnhancedImage(data.enhancedImage);
      
      toast({
        title: "Enhancement Complete!",
        description: "Your photo has been enhanced with AI",
      });
    } catch (error) {
      console.error('Enhancement error:', error);
      toast({
        title: "Enhancement Failed",
        description: error instanceof Error ? error.message : 'Failed to enhance image',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!enhancedImage) return;

    const link = document.createElement('a');
    link.href = enhancedImage;
    link.download = `enhanced-${Date.now()}.jpg`;
    link.click();

    toast({
      title: "Downloaded!",
      description: "Your enhanced photo has been saved",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Enhancement</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Photo Enhancer
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform low-quality, blurry, or old photos into stunning high-definition images. 
            Unblur, restore, and enhance with state-of-the-art AI technology.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Unblur Images
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Restore Colors
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Enhance Details
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Face Beautification
            </div>
          </div>
        </div>

        {/* Upload Section */}
        {!originalImage ? (
          <Card className="max-w-2xl mx-auto">
            <div
              className={`p-12 border-2 border-dashed rounded-lg transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-border"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Upload Your Photo</h3>
                  <p className="text-muted-foreground">
                    Drag and drop your image here, or click to browse
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="lg"
                  variant="hero"
                  className="gap-2"
                >
                  <ImageIcon className="w-5 h-5" />
                  Choose Photo
                </Button>

                <p className="text-xs text-muted-foreground">
                  Supports JPG, PNG, WEBP formats
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Enhancement Controls */}
            <Card className="max-w-2xl mx-auto p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Enhancement Strength</Label>
                  <Slider
                    value={enhancementLevel}
                    onValueChange={setEnhancementLevel}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Level: {enhancementLevel[0]}%
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={enhanceImage}
                    disabled={isProcessing}
                    className="flex-1 gap-2"
                    variant="hero"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Enhance Photo
                      </>
                    )}
                  </Button>

                  {enhancedImage && (
                    <Button
                      onClick={downloadImage}
                      variant="outline"
                      size="lg"
                      className="gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </Button>
                  )}
                </div>

                <Button
                  onClick={() => {
                    setOriginalImage(null);
                    setEnhancedImage(null);
                  }}
                  variant="ghost"
                  className="w-full"
                >
                  Upload New Photo
                </Button>
              </div>
            </Card>

            {/* Image Comparison */}
            <Card className="max-w-5xl mx-auto p-6">
              <Tabs defaultValue="comparison" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="original">Original</TabsTrigger>
                  <TabsTrigger value="comparison">Comparison</TabsTrigger>
                  <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
                </TabsList>

                <TabsContent value="original" className="mt-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Original Photo</h3>
                    <img
                      src={originalImage}
                      alt="Original"
                      className="w-full rounded-lg shadow-lg"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="comparison" className="mt-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Before</h3>
                      <img
                        src={originalImage}
                        alt="Before"
                        className="w-full rounded-lg shadow-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">After</h3>
                      {enhancedImage ? (
                        <img
                          src={enhancedImage}
                          alt="After"
                          className="w-full rounded-lg shadow-lg ring-2 ring-primary"
                        />
                      ) : (
                        <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center">
                          <p className="text-muted-foreground">Click enhance to see results</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="enhanced" className="mt-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Enhanced Photo</h3>
                    {enhancedImage ? (
                      <img
                        src={enhancedImage}
                        alt="Enhanced"
                        className="w-full rounded-lg shadow-lg ring-2 ring-primary"
                      />
                    ) : (
                      <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center">
                        <p className="text-muted-foreground">Click enhance to see results</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Features Info */}
            <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-1">AI Enhancement</h4>
                <p className="text-xs text-muted-foreground">Advanced algorithms</p>
              </Card>

              <Card className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-1">Restore Details</h4>
                <p className="text-xs text-muted-foreground">Recover lost clarity</p>
              </Card>

              <Card className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-1">Color Correction</h4>
                <p className="text-xs text-muted-foreground">Vibrant colors</p>
              </Card>

              <Card className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-1">HD Export</h4>
                <p className="text-xs text-muted-foreground">High-quality output</p>
              </Card>
            </div>
          </div>
        )}

        {/* AI Powered Note */}
        <Card className="max-w-2xl mx-auto mt-8 p-4 bg-primary/10 border-primary/20">
          <p className="text-sm text-center text-foreground">
            <strong>✨ Powered by Real AI:</strong> This uses Lovable AI with advanced image enhancement technology for professional quality results.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AIPhotoEnhancer;
