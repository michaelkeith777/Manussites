import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Crop,
  Download,
  Maximize2,
  Minimize2,
  Move,
  RotateCcw,
  Sun,
  Contrast,
  Droplets,
  ZoomIn,
  ZoomOut,
  Check,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ImageEditorProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (editedImageUrl: string) => void;
  aspectRatioPresets?: { label: string; ratio: number }[];
}

const DEFAULT_ASPECT_RATIOS = [
  { label: "2:3 (Card)", ratio: 2 / 3 },
  { label: "3:4", ratio: 3 / 4 },
  { label: "1:1", ratio: 1 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "16:9", ratio: 16 / 9 },
  { label: "Free", ratio: 0 },
];

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function ImageEditor({
  imageUrl,
  isOpen,
  onClose,
  onSave,
  aspectRatioPresets = DEFAULT_ASPECT_RATIOS,
}: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Image state
  const [imageLoaded, setImageLoaded] = useState(false);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  // Adjustment state
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  // Crop state
  const [isCropping, setIsCropping] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number>(2 / 3);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragType, setDragType] = useState<"move" | "resize" | null>(null);

  // Zoom state
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Load image
  useEffect(() => {
    if (!imageUrl || !isOpen) return;

    setImageLoaded(false);
    setOriginalImage(null);

    const loadImage = async () => {
      try {
        // Try loading with crossOrigin first
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("CORS failed"));
        });

        // Add cache-busting parameter to avoid CORS cache issues
        const urlWithCacheBust = imageUrl.includes('?') 
          ? `${imageUrl}&_t=${Date.now()}` 
          : `${imageUrl}?_t=${Date.now()}`;
        img.src = urlWithCacheBust;

        const loadedImg = await loadPromise;
        setOriginalImage(loadedImg);
        imageRef.current = loadedImg;
        setImageLoaded(true);
        initializeCropArea(loadedImg, selectedAspectRatio);
      } catch {
        // If CORS fails, try without crossOrigin (won't be able to export but can view)
        try {
          const img = new Image();
          const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error("Failed to load"));
          });
          img.src = imageUrl;

          const loadedImg = await loadPromise;
          setOriginalImage(loadedImg);
          imageRef.current = loadedImg;
          setImageLoaded(true);
          initializeCropArea(loadedImg, selectedAspectRatio);
          toast.info("Image loaded in view-only mode due to CORS restrictions");
        } catch {
          toast.error("Failed to load image for editing");
        }
      }
    };

    loadImage();
  }, [imageUrl, isOpen]);

  // Initialize crop area
  const initializeCropArea = useCallback((img: HTMLImageElement, ratio: number) => {
    if (ratio === 0) {
      // Free crop - use full image
      setCropArea({ x: 0, y: 0, width: 100, height: 100 });
      return;
    }

    const imgRatio = img.width / img.height;
    let cropWidth: number, cropHeight: number;

    if (imgRatio > ratio) {
      // Image is wider than target ratio
      cropHeight = 100;
      cropWidth = (ratio / imgRatio) * 100;
    } else {
      // Image is taller than target ratio
      cropWidth = 100;
      cropHeight = (imgRatio / ratio) * 100;
    }

    setCropArea({
      x: (100 - cropWidth) / 2,
      y: (100 - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight,
    });
  }, []);

  // Render canvas
  useEffect(() => {
    if (!canvasRef.current || !originalImage || !imageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const containerWidth = containerRef.current?.clientWidth || 600;
    const containerHeight = containerRef.current?.clientHeight || 400;
    
    const scale = Math.min(
      containerWidth / originalImage.width,
      containerHeight / originalImage.height
    ) * (zoom / 100);

    canvas.width = originalImage.width * scale;
    canvas.height = originalImage.height * scale;

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    // Clear and draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    // Draw crop overlay if cropping
    if (isCropping) {
      const cropX = (cropArea.x / 100) * canvas.width;
      const cropY = (cropArea.y / 100) * canvas.height;
      const cropW = (cropArea.width / 100) * canvas.width;
      const cropH = (cropArea.height / 100) * canvas.height;

      // Darken outside crop area
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, 0, canvas.width, cropY); // Top
      ctx.fillRect(0, cropY + cropH, canvas.width, canvas.height - cropY - cropH); // Bottom
      ctx.fillRect(0, cropY, cropX, cropH); // Left
      ctx.fillRect(cropX + cropW, cropY, canvas.width - cropX - cropW, cropH); // Right

      // Draw crop border
      ctx.strokeStyle = "#8b5cf6";
      ctx.lineWidth = 2;
      ctx.strokeRect(cropX, cropY, cropW, cropH);

      // Draw corner handles
      const handleSize = 10;
      ctx.fillStyle = "#8b5cf6";
      // Top-left
      ctx.fillRect(cropX - handleSize / 2, cropY - handleSize / 2, handleSize, handleSize);
      // Top-right
      ctx.fillRect(cropX + cropW - handleSize / 2, cropY - handleSize / 2, handleSize, handleSize);
      // Bottom-left
      ctx.fillRect(cropX - handleSize / 2, cropY + cropH - handleSize / 2, handleSize, handleSize);
      // Bottom-right
      ctx.fillRect(cropX + cropW - handleSize / 2, cropY + cropH - handleSize / 2, handleSize, handleSize);

      // Draw grid lines (rule of thirds)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1;
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(cropX + cropW / 3, cropY);
      ctx.lineTo(cropX + cropW / 3, cropY + cropH);
      ctx.moveTo(cropX + (cropW * 2) / 3, cropY);
      ctx.lineTo(cropX + (cropW * 2) / 3, cropY + cropH);
      // Horizontal lines
      ctx.moveTo(cropX, cropY + cropH / 3);
      ctx.lineTo(cropX + cropW, cropY + cropH / 3);
      ctx.moveTo(cropX, cropY + (cropH * 2) / 3);
      ctx.lineTo(cropX + cropW, cropY + (cropH * 2) / 3);
      ctx.stroke();
    }
  }, [originalImage, imageLoaded, brightness, contrast, saturation, zoom, isCropping, cropArea]);

  // Handle crop drag
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if clicking on crop area
    if (
      x >= cropArea.x &&
      x <= cropArea.x + cropArea.width &&
      y >= cropArea.y &&
      y <= cropArea.y + cropArea.height
    ) {
      setIsDragging(true);
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
      setDragType("move");
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current || dragType !== "move") return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    let newX = x - dragStart.x;
    let newY = y - dragStart.y;

    // Constrain to canvas bounds
    newX = Math.max(0, Math.min(100 - cropArea.width, newX));
    newY = Math.max(0, Math.min(100 - cropArea.height, newY));

    setCropArea((prev) => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragType(null);
  };

  // Reset all adjustments
  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setZoom(100);
    setPan({ x: 0, y: 0 });
    if (originalImage) {
      initializeCropArea(originalImage, selectedAspectRatio);
    }
    toast.success("Reset to original");
  };

  // Apply crop and download
  const handleDownload = () => {
    if (!originalImage) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate crop dimensions on original image
    const cropX = (cropArea.x / 100) * originalImage.width;
    const cropY = (cropArea.y / 100) * originalImage.height;
    const cropW = (cropArea.width / 100) * originalImage.width;
    const cropH = (cropArea.height / 100) * originalImage.height;

    canvas.width = cropW;
    canvas.height = cropH;

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    // Draw cropped and filtered image
    ctx.drawImage(
      originalImage,
      cropX,
      cropY,
      cropW,
      cropH,
      0,
      0,
      cropW,
      cropH
    );

    // Download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `edited-card-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Image downloaded!");
      }
    }, "image/png");
  };

  // Handle aspect ratio change
  const handleAspectRatioChange = (ratio: number) => {
    setSelectedAspectRatio(ratio);
    if (originalImage) {
      initializeCropArea(originalImage, ratio);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh] h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-primary" />
            Edit Image
          </DialogTitle>
          <DialogDescription>
            Crop and adjust your image before downloading
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
          {/* Canvas Area */}
          <div
            ref={containerRef}
            className="flex-1 bg-black/20 rounded-lg flex items-center justify-center overflow-hidden relative"
          >
            {imageLoaded ? (
              <canvas
                ref={canvasRef}
                className={cn(
                  "max-w-full max-h-full",
                  isCropping && "cursor-move"
                )}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            ) : (
              <div className="text-muted-foreground">Loading image...</div>
            )}
          </div>

          {/* Controls Panel */}
          <div className="w-64 flex flex-col gap-4 overflow-y-auto">
            <Tabs defaultValue="crop" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="crop" className="gap-1 text-xs">
                  <Crop className="w-3 h-3" />
                  Crop
                </TabsTrigger>
                <TabsTrigger value="adjust" className="gap-1 text-xs">
                  <Sun className="w-3 h-3" />
                  Adjust
                </TabsTrigger>
              </TabsList>

              <TabsContent value="crop" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <Label>Crop Mode</Label>
                  <Button
                    variant={isCropping ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsCropping(!isCropping)}
                  >
                    {isCropping ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <Crop className="w-4 h-4 mr-1" />
                        Enable
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Aspect Ratio</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {aspectRatioPresets.map((preset) => (
                      <Button
                        key={preset.label}
                        variant={selectedAspectRatio === preset.ratio ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => handleAspectRatioChange(preset.ratio)}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Zoom</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setZoom(Math.max(50, zoom - 10))}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Slider
                      value={[zoom]}
                      onValueChange={([v]) => setZoom(v)}
                      min={50}
                      max={200}
                      step={5}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setZoom(Math.min(200, zoom + 10))}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{zoom}%</p>
                </div>
              </TabsContent>

              <TabsContent value="adjust" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        Brightness
                      </Label>
                      <span className="text-xs text-muted-foreground">{brightness}%</span>
                    </div>
                    <Slider
                      value={[brightness]}
                      onValueChange={([v]) => setBrightness(v)}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Contrast className="w-4 h-4" />
                        Contrast
                      </Label>
                      <span className="text-xs text-muted-foreground">{contrast}%</span>
                    </div>
                    <Slider
                      value={[contrast]}
                      onValueChange={([v]) => setContrast(v)}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Droplets className="w-4 h-4" />
                        Saturation
                      </Label>
                      <span className="text-xs text-muted-foreground">{saturation}%</span>
                    </div>
                    <Slider
                      value={[saturation]}
                      onValueChange={([v]) => setSaturation(v)}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All
            </Button>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download Edited
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
