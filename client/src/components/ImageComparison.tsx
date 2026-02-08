import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Columns,
  Rows,
  Grid2X2,
  SplitSquareHorizontal,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Brain,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";

interface ComparisonImage {
  id: number;
  imageUrl: string;
  model: string;
  prompt?: string | null;
  createdAt: Date;
}

interface ImageComparisonProps {
  images: ComparisonImage[];
  isOpen: boolean;
  onClose: () => void;
}

type ViewMode = "side-by-side" | "stacked" | "grid" | "slider";

const modelInfo: Record<string, { name: string; icon: React.ReactNode; color: string }> = {
  "nano-banana": { name: "Nano Banana", icon: <Sparkles className="w-4 h-4" />, color: "bg-yellow-500" },
  "nano-banana-pro": { name: "Nano Banana Pro", icon: <Zap className="w-4 h-4" />, color: "bg-orange-500" },
  "grok-imagine": { name: "Grok Imagine", icon: <Brain className="w-4 h-4" />, color: "bg-blue-500" },
  "openai-4o": { name: "OpenAI 4o", icon: <Cpu className="w-4 h-4" />, color: "bg-green-500" },
};

export function ImageComparison({ images, isOpen, onClose }: ImageComparisonProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get unique models from images
  const availableModels = useMemo(() => {
    const models = new Set(images.map((img) => img.model));
    return Array.from(models);
  }, [images]);

  // Group images by model
  const imagesByModel = useMemo(() => {
    const grouped: Record<string, ComparisonImage[]> = {};
    images.forEach((img) => {
      if (!grouped[img.model]) grouped[img.model] = [];
      grouped[img.model].push(img);
    });
    return grouped;
  }, [images]);

  // Get images for comparison (max 4)
  const comparisonImages = useMemo(() => {
    if (selectedImages.length > 0) {
      return images.filter((img) => selectedImages.includes(img.id)).slice(0, 4);
    }
    // Default: one from each model
    const result: ComparisonImage[] = [];
    Object.values(imagesByModel).forEach((modelImages) => {
      if (result.length < 4 && modelImages[0]) {
        result.push(modelImages[0]);
      }
    });
    return result;
  }, [images, selectedImages, imagesByModel]);

  const toggleImageSelection = (id: number) => {
    setSelectedImages((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 4) {
        toast.error("Maximum 4 images can be compared");
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleDownload = async (imageUrl: string, model: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `comparison-${model}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Image downloaded!");
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  const renderModelBadge = (model: string) => {
    const info = modelInfo[model] || { name: model, icon: <Sparkles className="w-4 h-4" />, color: "bg-gray-500" };
    return (
      <Badge className={`${info.color} text-white gap-1`}>
        {info.icon}
        {info.name}
      </Badge>
    );
  };

  const renderSideBySide = () => (
    <div className="grid grid-cols-2 gap-4 h-[60vh]">
      {comparisonImages.slice(0, 2).map((img, index) => (
        <motion.div
          key={img.id}
          initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative rounded-lg overflow-hidden bg-muted"
        >
          <img
            src={img.imageUrl}
            alt={`Comparison ${index + 1}`}
            className="w-full h-full object-contain"
          />
          <div className="absolute top-2 left-2">
            {renderModelBadge(img.model)}
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="absolute bottom-2 right-2"
            onClick={() => handleDownload(img.imageUrl, img.model)}
          >
            <Download className="w-4 h-4" />
          </Button>
        </motion.div>
      ))}
    </div>
  );

  const renderStacked = () => (
    <div className="flex flex-col gap-4 h-[60vh] overflow-y-auto">
      {comparisonImages.map((img, index) => (
        <motion.div
          key={img.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative rounded-lg overflow-hidden bg-muted flex-shrink-0"
          style={{ height: `${100 / Math.min(comparisonImages.length, 2)}%`, minHeight: "200px" }}
        >
          <img
            src={img.imageUrl}
            alt={`Comparison ${index + 1}`}
            className="w-full h-full object-contain"
          />
          <div className="absolute top-2 left-2">
            {renderModelBadge(img.model)}
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="absolute bottom-2 right-2"
            onClick={() => handleDownload(img.imageUrl, img.model)}
          >
            <Download className="w-4 h-4" />
          </Button>
        </motion.div>
      ))}
    </div>
  );

  const renderGrid = () => (
    <div className="grid grid-cols-2 gap-4 h-[60vh]">
      {comparisonImages.slice(0, 4).map((img, index) => (
        <motion.div
          key={img.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="relative rounded-lg overflow-hidden bg-muted"
        >
          <img
            src={img.imageUrl}
            alt={`Comparison ${index + 1}`}
            className="w-full h-full object-contain"
          />
          <div className="absolute top-2 left-2">
            {renderModelBadge(img.model)}
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="absolute bottom-2 right-2"
            onClick={() => handleDownload(img.imageUrl, img.model)}
          >
            <Download className="w-4 h-4" />
          </Button>
        </motion.div>
      ))}
    </div>
  );

  const renderSlider = () => {
    if (comparisonImages.length < 2) {
      return (
        <div className="h-[60vh] flex items-center justify-center text-muted-foreground">
          Select at least 2 images to use slider comparison
        </div>
      );
    }

    const leftImage = comparisonImages[0];
    const rightImage = comparisonImages[1];

    return (
      <div className="relative h-[60vh] rounded-lg overflow-hidden bg-muted">
        {/* Right image (full) */}
        <img
          src={rightImage.imageUrl}
          alt="Right comparison"
          className="absolute inset-0 w-full h-full object-contain"
        />
        
        {/* Left image (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={leftImage.imageUrl}
            alt="Left comparison"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ width: `${100 / (sliderPosition / 100)}%`, maxWidth: "none" }}
          />
        </div>

        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
          style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <ChevronLeft className="w-3 h-3 text-gray-600" />
            <ChevronRight className="w-3 h-3 text-gray-600" />
          </div>
        </div>

        {/* Model badges */}
        <div className="absolute top-2 left-2">
          {renderModelBadge(leftImage.model)}
        </div>
        <div className="absolute top-2 right-2">
          {renderModelBadge(rightImage.model)}
        </div>

        {/* Slider control */}
        <div className="absolute bottom-4 left-4 right-4">
          <Slider
            value={[sliderPosition]}
            onValueChange={([v]) => setSliderPosition(v)}
            min={5}
            max={95}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-background text-foreground">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Columns className="w-5 h-5 text-primary" />
              Compare AI Models
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* View Mode Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-sm">View Mode:</Label>
              <div className="flex gap-1">
                <Button
                  variant={viewMode === "side-by-side" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("side-by-side")}
                >
                  <Columns className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "stacked" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("stacked")}
                >
                  <Rows className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid2X2 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "slider" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("slider")}
                >
                  <SplitSquareHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              {comparisonImages.length} images selected
            </div>
          </div>

          {/* Image Selection */}
          {images.length > 4 && (
            <div className="space-y-2">
              <Label className="text-sm">Select images to compare (max 4):</Label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img) => (
                  <motion.div
                    key={img.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleImageSelection(img.id)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
                      selectedImages.includes(img.id)
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground"
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                      <span className="text-[10px] text-white truncate block">
                        {modelInfo[img.model]?.name || img.model}
                      </span>
                    </div>
                    {selectedImages.includes(img.id) && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                        {selectedImages.indexOf(img.id) + 1}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              {selectedImages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImages([])}
                >
                  Clear selection
                </Button>
              )}
            </div>
          )}

          {/* Comparison View */}
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {viewMode === "side-by-side" && renderSideBySide()}
              {viewMode === "stacked" && renderStacked()}
              {viewMode === "grid" && renderGrid()}
              {viewMode === "slider" && renderSlider()}
            </motion.div>
          </AnimatePresence>

          {/* Prompt Display */}
          {comparisonImages[0]?.prompt && (
            <div className="p-3 bg-muted rounded-lg">
              <Label className="text-xs text-muted-foreground">Prompt used:</Label>
              <p className="text-sm mt-1 line-clamp-2">{comparisonImages[0].prompt}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
