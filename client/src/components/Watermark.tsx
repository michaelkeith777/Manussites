import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  Type,
  Image as ImageIcon,
  RotateCcw,
  X,
  Upload,
  Loader2,
  Move,
  GripVertical,
  Save,
  FolderOpen,
  Star,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type WatermarkPosition = 
  | "top-left" 
  | "top-center" 
  | "top-right" 
  | "center-left" 
  | "center" 
  | "center-right" 
  | "bottom-left" 
  | "bottom-center" 
  | "bottom-right"
  | "tiled"
  | "custom";

interface WatermarkSettings {
  type: "text" | "image";
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  opacity: number;
  position: WatermarkPosition;
  rotation: number;
  imageUrl?: string;
  imageSize: number;
  customX: number;
  customY: number;
  sizePreset: "small" | "medium" | "large" | "custom";
}

const defaultSettings: WatermarkSettings = {
  type: "text",
  text: "",
  fontSize: 24,
  fontFamily: "Arial",
  color: "#ffffff",
  opacity: 50,
  position: "bottom-right",
  rotation: 0,
  imageSize: 100,
  customX: 50,
  customY: 50,
  sizePreset: "medium",
};

const fontOptions = [
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Georgia", label: "Georgia" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Courier New", label: "Courier New" },
  { value: "Impact", label: "Impact" },
  { value: "Comic Sans MS", label: "Comic Sans" },
];

const positionOptions: { value: WatermarkPosition; label: string }[] = [
  { value: "custom", label: "Custom (Drag to Position)" },
  { value: "top-left", label: "Top Left" },
  { value: "top-center", label: "Top Center" },
  { value: "top-right", label: "Top Right" },
  { value: "center-left", label: "Center Left" },
  { value: "center", label: "Center" },
  { value: "center-right", label: "Center Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-right", label: "Bottom Right" },
  { value: "tiled", label: "Tiled (Repeat)" },
];

const sizePresets = {
  small: { fontSize: 16, imageSize: 50 },
  medium: { fontSize: 24, imageSize: 100 },
  large: { fontSize: 48, imageSize: 150 },
  custom: null,
};

interface WatermarkProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Watermark({ imageUrl, isOpen, onClose }: WatermarkProps) {
  const [settings, setSettings] = useState<WatermarkSettings>(defaultSettings);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const watermarkImageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // tRPC queries and mutations
  const utils = trpc.useUtils();
  const { data: presets, isLoading: presetsLoading } = trpc.watermarkPresets.list.useQuery();
  const { data: defaultPreset } = trpc.watermarkPresets.getDefault.useQuery();
  
  const createPresetMutation = trpc.watermarkPresets.create.useMutation({
    onSuccess: () => {
      utils.watermarkPresets.list.invalidate();
      utils.watermarkPresets.getDefault.invalidate();
      toast.success("Preset saved successfully!");
      setShowSaveDialog(false);
      setPresetName("");
      setSaveAsDefault(false);
    },
    onError: (error) => {
      toast.error(`Failed to save preset: ${error.message}`);
    },
  });

  const deletePresetMutation = trpc.watermarkPresets.delete.useMutation({
    onSuccess: () => {
      utils.watermarkPresets.list.invalidate();
      utils.watermarkPresets.getDefault.invalidate();
      toast.success("Preset deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete preset: ${error.message}`);
    },
  });

  const setDefaultMutation = trpc.watermarkPresets.setDefault.useMutation({
    onSuccess: () => {
      utils.watermarkPresets.list.invalidate();
      utils.watermarkPresets.getDefault.invalidate();
      toast.success("Default preset updated");
    },
  });

  // Load default preset on open
  useEffect(() => {
    if (isOpen && defaultPreset) {
      loadPreset(defaultPreset);
    }
  }, [isOpen, defaultPreset]);

  // Load the main image
  useEffect(() => {
    if (!imageUrl || !isOpen) return;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      renderPreview();
    };
    img.onerror = () => {
      const img2 = new Image();
      img2.onload = () => {
        imageRef.current = img2;
        renderPreview();
      };
      img2.onerror = () => {
        toast.error("Failed to load image for watermarking");
      };
      img2.src = imageUrl;
    };
    img.src = imageUrl;
  }, [imageUrl, isOpen]);

  // Re-render preview when settings change
  useEffect(() => {
    if (imageRef.current) {
      renderPreview();
    }
  }, [settings]);

  // Apply size preset
  useEffect(() => {
    if (settings.sizePreset !== "custom") {
      const preset = sizePresets[settings.sizePreset];
      if (preset) {
        setSettings((s) => ({
          ...s,
          fontSize: preset.fontSize,
          imageSize: preset.imageSize,
        }));
      }
    }
  }, [settings.sizePreset]);

  const loadPreset = (preset: any) => {
    setSettings({
      type: preset.type || "text",
      text: preset.text || "",
      fontSize: preset.fontSize || 24,
      fontFamily: preset.fontFamily || "Arial",
      color: preset.color || "#ffffff",
      opacity: preset.opacity || 50,
      position: (preset.position || "bottom-right") as WatermarkPosition,
      rotation: preset.rotation || 0,
      imageUrl: preset.imageUrl || undefined,
      imageSize: preset.imageSize || 100,
      customX: preset.customX || 50,
      customY: preset.customY || 50,
      sizePreset: (preset.sizePreset || "medium") as "small" | "medium" | "large" | "custom",
    });

    // Load watermark image if it's an image preset
    if (preset.type === "image" && preset.imageUrl) {
      const img = new Image();
      img.onload = () => {
        watermarkImageRef.current = img;
        renderPreview();
      };
      img.src = preset.imageUrl;
    }

    toast.success(`Loaded preset: ${preset.name}`);
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error("Please enter a preset name");
      return;
    }

    createPresetMutation.mutate({
      name: presetName.trim(),
      type: settings.type,
      text: settings.text || undefined,
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      color: settings.color,
      opacity: settings.opacity,
      position: settings.position,
      rotation: settings.rotation,
      imageUrl: settings.imageUrl || undefined,
      imageSize: settings.imageSize,
      customX: settings.customX,
      customY: settings.customY,
      sizePreset: settings.sizePreset,
      isDefault: saveAsDefault,
    });
  };

  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    if (settings.type === "text" && settings.text) {
      applyTextWatermark(ctx, canvas.width, canvas.height);
    } else if (settings.type === "image" && watermarkImageRef.current) {
      applyImageWatermark(ctx, canvas.width, canvas.height);
    }

    setPreviewUrl(canvas.toDataURL("image/png"));
  }, [settings]);

  const applyTextWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.globalAlpha = settings.opacity / 100;
    ctx.fillStyle = settings.color;
    ctx.font = `${settings.fontSize}px ${settings.fontFamily}`;
    ctx.textBaseline = "middle";

    const textWidth = ctx.measureText(settings.text).width;
    const textHeight = settings.fontSize;

    if (settings.position === "tiled") {
      const spacing = Math.max(textWidth, textHeight) * 2;
      ctx.rotate((settings.rotation * Math.PI) / 180);
      
      for (let y = -height; y < height * 2; y += spacing) {
        for (let x = -width; x < width * 2; x += spacing) {
          ctx.fillText(settings.text, x, y);
        }
      }
    } else {
      const { x, y } = getPosition(settings.position, width, height, textWidth, textHeight);
      
      ctx.translate(x + textWidth / 2, y);
      ctx.rotate((settings.rotation * Math.PI) / 180);
      ctx.fillText(settings.text, -textWidth / 2, 0);
    }

    ctx.restore();
  };

  const applyImageWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const wmImg = watermarkImageRef.current;
    if (!wmImg) return;

    ctx.save();
    ctx.globalAlpha = settings.opacity / 100;

    const scale = settings.imageSize / 100;
    const wmWidth = wmImg.width * scale;
    const wmHeight = wmImg.height * scale;

    if (settings.position === "tiled") {
      const spacing = Math.max(wmWidth, wmHeight) * 1.5;
      
      for (let y = 0; y < height; y += spacing) {
        for (let x = 0; x < width; x += spacing) {
          ctx.save();
          ctx.translate(x + wmWidth / 2, y + wmHeight / 2);
          ctx.rotate((settings.rotation * Math.PI) / 180);
          ctx.drawImage(wmImg, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
          ctx.restore();
        }
      }
    } else {
      const { x, y } = getPosition(settings.position, width, height, wmWidth, wmHeight);
      
      ctx.translate(x + wmWidth / 2, y + wmHeight / 2);
      ctx.rotate((settings.rotation * Math.PI) / 180);
      ctx.drawImage(wmImg, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
    }

    ctx.restore();
  };

  const getPosition = (
    position: WatermarkPosition,
    canvasWidth: number,
    canvasHeight: number,
    elementWidth: number,
    elementHeight: number
  ): { x: number; y: number } => {
    const padding = 20;
    
    if (position === "custom") {
      return {
        x: (settings.customX / 100) * canvasWidth - elementWidth / 2,
        y: (settings.customY / 100) * canvasHeight,
      };
    }
    
    switch (position) {
      case "top-left":
        return { x: padding, y: padding + elementHeight / 2 };
      case "top-center":
        return { x: (canvasWidth - elementWidth) / 2, y: padding + elementHeight / 2 };
      case "top-right":
        return { x: canvasWidth - elementWidth - padding, y: padding + elementHeight / 2 };
      case "center-left":
        return { x: padding, y: canvasHeight / 2 };
      case "center":
        return { x: (canvasWidth - elementWidth) / 2, y: canvasHeight / 2 };
      case "center-right":
        return { x: canvasWidth - elementWidth - padding, y: canvasHeight / 2 };
      case "bottom-left":
        return { x: padding, y: canvasHeight - padding - elementHeight / 2 };
      case "bottom-center":
        return { x: (canvasWidth - elementWidth) / 2, y: canvasHeight - padding - elementHeight / 2 };
      case "bottom-right":
        return { x: canvasWidth - elementWidth - padding, y: canvasHeight - padding - elementHeight / 2 };
      default:
        return { x: canvasWidth - elementWidth - padding, y: canvasHeight - padding - elementHeight / 2 };
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (settings.position !== "custom") return;
    setIsDragging(true);
    updatePositionFromMouse(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || settings.position !== "custom") return;
    updatePositionFromMouse(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (settings.position !== "custom") return;
    setIsDragging(true);
    updatePositionFromTouch(e);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || settings.position !== "custom") return;
    e.preventDefault();
    updatePositionFromTouch(e);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const updatePositionFromMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = previewContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setSettings((s) => ({
      ...s,
      customX: Math.max(0, Math.min(100, x)),
      customY: Math.max(0, Math.min(100, y)),
    }));
  };

  const updatePositionFromTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    const container = previewContainerRef.current;
    if (!container || !e.touches[0]) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    const y = ((e.touches[0].clientY - rect.top) / rect.height) * 100;

    setSettings((s) => ({
      ...s,
      customX: Math.max(0, Math.min(100, x)),
      customY: Math.max(0, Math.min(100, y)),
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        watermarkImageRef.current = img;
        setSettings((s) => ({ ...s, imageUrl: event.target?.result as string }));
        renderPreview();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    if (!previewUrl) {
      toast.error("No preview available to download");
      return;
    }

    setIsProcessing(true);
    
    // Use setTimeout to allow UI to update before heavy operation
    setTimeout(async () => {
      try {
        // Convert data URL to blob for better performance with large images
        const response = await fetch(previewUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `watermarked-card-${Date.now()}.png`;
        link.style.display = "none";
        document.body.appendChild(link);
        
        // Small delay to ensure link is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        link.click();
        
        // Clean up after download starts
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 1000);
        
        toast.success("Watermarked image downloaded!");
        
        // Delay closing to ensure download completes
        setTimeout(() => {
          setIsProcessing(false);
          onClose();
        }, 500);
      } catch (error) {
        console.error("Download error:", error);
        toast.error("Failed to download image. Please try again.");
        setIsProcessing(false);
      }
    }, 50);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    watermarkImageRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh] h-[85vh] overflow-hidden bg-background text-foreground">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" />
              Add Watermark
            </DialogTitle>
            
            {/* Preset Controls */}
            <div className="flex items-center gap-2">
              {/* Load Preset Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FolderOpen className="w-4 h-4" />
                    Presets
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {presetsLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Loading presets...
                    </div>
                  ) : presets && presets.length > 0 ? (
                    <>
                      {presets.map((preset) => (
                        <DropdownMenuItem
                          key={preset.id}
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => loadPreset(preset)}
                        >
                          <div className="flex items-center gap-2">
                            {preset.isDefault && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                            <span>{preset.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {!preset.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDefaultMutation.mutate({ id: preset.id });
                                }}
                              >
                                <Star className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePresetMutation.mutate({ id: preset.id });
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No saved presets yet
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Save Preset Button */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowSaveDialog(true)}
              >
                <Save className="w-4 h-4" />
                Save Preset
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto p-1">
          {/* Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Preview</Label>
              {settings.position === "custom" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Move className="w-3 h-3" />
                  <span>Drag to position: {Math.round(settings.customX)}%, {Math.round(settings.customY)}%</span>
                </div>
              )}
            </div>
            <div 
              ref={previewContainerRef}
              className={`relative aspect-[2/3] bg-muted rounded-lg overflow-hidden flex items-center justify-center ${
                settings.position === "custom" ? "cursor-move" : ""
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Watermarked preview"
                    className="max-w-full max-h-full object-contain pointer-events-none select-none"
                    draggable={false}
                  />
                  {settings.position === "custom" && (settings.text || settings.imageUrl) && (
                    <div 
                      className="absolute pointer-events-none"
                      style={{
                        left: `${settings.customX}%`,
                        top: `${settings.customY}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div className="w-6 h-6 border-2 border-primary border-dashed rounded-full animate-pulse" />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-muted-foreground text-sm">Loading preview...</div>
              )}
              {settings.position === "custom" && (
                <div className="absolute bottom-2 left-2 right-2 bg-black/60 text-white text-xs py-1 px-2 rounded text-center">
                  <GripVertical className="w-3 h-3 inline mr-1" />
                  Click and drag to position watermark
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <Tabs
              value={settings.type}
              onValueChange={(v) => setSettings((s) => ({ ...s, type: v as "text" | "image" }))}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="gap-2">
                  <Type className="w-4 h-4" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="image" className="gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Logo/Image
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Watermark Text</Label>
                  <Input
                    placeholder="Enter your watermark text..."
                    value={settings.text}
                    onChange={(e) => setSettings((s) => ({ ...s, text: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Size Preset</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["small", "medium", "large", "custom"] as const).map((preset) => (
                      <Button
                        key={preset}
                        variant={settings.sizePreset === preset ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSettings((s) => ({ ...s, sizePreset: preset }))}
                        className="capitalize"
                      >
                        {preset}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Font Family</Label>
                    <Select
                      value={settings.fontFamily}
                      onValueChange={(v) => setSettings((s) => ({ ...s, fontFamily: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <span style={{ fontFamily: font.value }}>{font.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Font Size: {settings.fontSize}px</Label>
                    <Slider
                      value={[settings.fontSize]}
                      onValueChange={([v]) => setSettings((s) => ({ ...s, fontSize: v, sizePreset: "custom" }))}
                      min={12}
                      max={120}
                      step={1}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.color}
                      onChange={(e) => setSettings((s) => ({ ...s, color: e.target.value }))}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={settings.color}
                      onChange={(e) => setSettings((s) => ({ ...s, color: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Upload Logo/Image</Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                  >
                    {settings.imageUrl ? (
                      <div className="space-y-2">
                        <img
                          src={settings.imageUrl}
                          alt="Watermark"
                          className="max-h-20 mx-auto"
                        />
                        <p className="text-sm text-muted-foreground">Click to change</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload your logo or watermark image
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Size Preset</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["small", "medium", "large", "custom"] as const).map((preset) => (
                      <Button
                        key={preset}
                        variant={settings.sizePreset === preset ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSettings((s) => ({ ...s, sizePreset: preset }))}
                        className="capitalize"
                      >
                        {preset}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Image Size: {settings.imageSize}%</Label>
                  <Slider
                    value={[settings.imageSize]}
                    onValueChange={([v]) => setSettings((s) => ({ ...s, imageSize: v, sizePreset: "custom" }))}
                    min={10}
                    max={300}
                    step={5}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Common Controls */}
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Position</Label>
                <Select
                  value={settings.position}
                  onValueChange={(v) => setSettings((s) => ({ ...s, position: v as WatermarkPosition }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {positionOptions.map((pos) => (
                      <SelectItem key={pos.value} value={pos.value}>
                        {pos.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {settings.position === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>X Position: {Math.round(settings.customX)}%</Label>
                    <Slider
                      value={[settings.customX]}
                      onValueChange={([v]) => setSettings((s) => ({ ...s, customX: v }))}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Y Position: {Math.round(settings.customY)}%</Label>
                    <Slider
                      value={[settings.customY]}
                      onValueChange={([v]) => setSettings((s) => ({ ...s, customY: v }))}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Opacity: {settings.opacity}%</Label>
                <Slider
                  value={[settings.opacity]}
                  onValueChange={([v]) => setSettings((s) => ({ ...s, opacity: v }))}
                  min={10}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <Label>Rotation: {settings.rotation}°</Label>
                <Slider
                  value={[settings.rotation]}
                  onValueChange={([v]) => setSettings((s) => ({ ...s, rotation: v }))}
                  min={-180}
                  max={180}
                  step={5}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleDownload}
                disabled={isProcessing || (!settings.text && !settings.imageUrl)}
                className="flex-1"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Save Preset Dialog */}
        <AnimatePresence>
          {showSaveDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-background p-6 rounded-lg shadow-xl w-80 space-y-4"
              >
                <h3 className="text-lg font-semibold">Save Watermark Preset</h3>
                <div className="space-y-2">
                  <Label>Preset Name</Label>
                  <Input
                    placeholder="My Watermark Style"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSavePreset()}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="saveAsDefault"
                    checked={saveAsDefault}
                    onChange={(e) => setSaveAsDefault(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="saveAsDefault" className="text-sm cursor-pointer">
                    Set as default preset
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSaveDialog(false);
                      setPresetName("");
                      setSaveAsDefault(false);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSavePreset}
                    disabled={createPresetMutation.isPending || !presetName.trim()}
                    className="flex-1"
                  >
                    {createPresetMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
