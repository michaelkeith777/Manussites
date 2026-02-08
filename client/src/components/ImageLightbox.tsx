import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Maximize2,
  Move,
} from "lucide-react";

interface ImageLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  title?: string;
  onDownload?: () => void;
}

export function ImageLightbox({
  open,
  onOpenChange,
  imageUrl,
  title,
  onDownload,
}: ImageLightboxProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setZoom(100);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [open]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(100);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 100) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(prev + 10, 300));
    } else {
      setZoom((prev) => Math.max(prev - 10, 25));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none">
        {/* Header Controls */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-2">
            {title && (
              <h3 className="text-white font-medium truncate max-w-[200px] md:max-w-[400px]">
                {title}
              </h3>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handleZoomOut}
              disabled={zoom <= 25}
            >
              <ZoomOut className="w-5 h-5" />
            </Button>
            <span className="text-white text-sm min-w-[50px] text-center">
              {zoom}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handleZoomIn}
              disabled={zoom >= 300}
            >
              <ZoomIn className="w-5 h-5" />
            </Button>
            <div className="w-px h-6 bg-white/30 mx-2" />
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handleRotate}
            >
              <RotateCw className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handleReset}
            >
              <Maximize2 className="w-5 h-5" />
            </Button>
            {onDownload && (
              <>
                <div className="w-px h-6 bg-white/30 mx-2" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={onDownload}
                >
                  <Download className="w-5 h-5" />
                </Button>
              </>
            )}
            <div className="w-px h-6 bg-white/30 mx-2" />
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Image Container */}
        <div
          ref={containerRef}
          className="w-full h-full flex items-center justify-center overflow-hidden cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <img
            src={imageUrl}
            alt={title || "Preview"}
            className="max-w-none select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: isDragging ? "none" : "transform 0.2s ease-out",
              cursor: zoom > 100 ? "grab" : "default",
            }}
            draggable={false}
          />
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-center gap-4">
            <ZoomOut className="w-4 h-4 text-white/60" />
            <Slider
              value={[zoom]}
              onValueChange={([value]) => setZoom(value)}
              min={25}
              max={300}
              step={5}
              className="w-48"
            />
            <ZoomIn className="w-4 h-4 text-white/60" />
          </div>
          {zoom > 100 && (
            <p className="text-center text-white/50 text-xs mt-2 flex items-center justify-center gap-1">
              <Move className="w-3 h-3" /> Drag to pan
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
