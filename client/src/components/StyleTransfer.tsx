import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface StyleTransferProps {
  onStyleImageChange: (imageUrl: string | null, file: File | null) => void;
  styleImageUrl: string | null;
  className?: string;
}

const presetStyles = [
  {
    id: "anime",
    name: "Anime",
    description: "Japanese animation style",
    preview: "🎌",
  },
  {
    id: "comic",
    name: "Comic Book",
    description: "Bold lines and halftone dots",
    preview: "💥",
  },
  {
    id: "watercolor",
    name: "Watercolor",
    description: "Soft, flowing paint style",
    preview: "🎨",
  },
  {
    id: "pixel",
    name: "Pixel Art",
    description: "Retro 8-bit aesthetic",
    preview: "👾",
  },
  {
    id: "oil",
    name: "Oil Painting",
    description: "Classic fine art style",
    preview: "🖼️",
  },
  {
    id: "neon",
    name: "Neon Glow",
    description: "Vibrant cyberpunk colors",
    preview: "✨",
  },
];

export function StyleTransfer({
  onStyleImageChange,
  styleImageUrl,
  className,
}: StyleTransferProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      onStyleImageChange(url, file);
      setSelectedPreset(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    onStyleImageChange(null, null);
  };

  const clearSelection = () => {
    onStyleImageChange(null, null);
    setSelectedPreset(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-primary" />
        <Label className="text-sm font-medium">Style Transfer (Optional)</Label>
      </div>

      {/* Custom Image Upload */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-4 transition-colors",
          isDragging
            ? "border-primary bg-primary/10"
            : "border-muted-foreground/25 hover:border-primary/50",
          styleImageUrl && "border-primary bg-primary/5"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />

        {styleImageUrl ? (
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden">
              <img
                src={styleImageUrl}
                alt="Style reference"
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 w-6 h-6"
                onClick={clearSelection}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <div>
              <p className="text-sm font-medium">Custom Style Reference</p>
              <p className="text-xs text-muted-foreground">
                Your uploaded image will influence the art style
              </p>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col items-center gap-2 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Upload Reference Image</p>
              <p className="text-xs text-muted-foreground">
                Drag & drop or click to browse
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Preset Styles */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Or choose a preset style:</Label>
        <div className="grid grid-cols-3 gap-2">
          {presetStyles.map((style) => (
            <Card
              key={style.id}
              className={cn(
                "cursor-pointer transition-all hover:scale-105",
                selectedPreset === style.id
                  ? "ring-2 ring-primary bg-primary/10"
                  : "hover:bg-muted/50"
              )}
              onClick={() => handlePresetSelect(style.id)}
            >
              <CardContent className="p-3 text-center">
                <div className="text-2xl mb-1">{style.preview}</div>
                <p className="text-xs font-medium">{style.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedPreset && (
        <div className="flex items-center justify-between p-2 bg-primary/10 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {presetStyles.find((s) => s.id === selectedPreset)?.preview}
            </span>
            <span className="text-sm font-medium">
              {presetStyles.find((s) => s.id === selectedPreset)?.name} style selected
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper to get style prompt modifier
export function getStylePromptModifier(
  presetId: string | null,
  customImageUrl: string | null
): string {
  if (customImageUrl) {
    return "in the artistic style of the reference image, ";
  }

  if (!presetId) return "";

  const styleModifiers: Record<string, string> = {
    anime: "in anime style with vibrant colors and expressive features, ",
    comic: "in comic book style with bold outlines and halftone shading, ",
    watercolor: "in watercolor painting style with soft edges and flowing colors, ",
    pixel: "in pixel art style with retro 8-bit aesthetic, ",
    oil: "in oil painting style with rich textures and classical composition, ",
    neon: "in neon cyberpunk style with glowing edges and vibrant colors, ",
  };

  return styleModifiers[presetId] || "";
}
