import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Download,
  FileImage,
  FileText,
  Image,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

export type ExportFormat = "png" | "jpg" | "pdf";
export type ExportResolution = "standard" | "hd" | "print";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  imageName?: string;
}

const FORMAT_OPTIONS = [
  {
    id: "png" as ExportFormat,
    name: "PNG",
    description: "Lossless quality, supports transparency",
    icon: FileImage,
  },
  {
    id: "jpg" as ExportFormat,
    name: "JPG",
    description: "Smaller file size, adjustable quality",
    icon: Image,
  },
  {
    id: "pdf" as ExportFormat,
    name: "PDF",
    description: "Print-ready document format",
    icon: FileText,
  },
];

const RESOLUTION_OPTIONS = [
  {
    id: "standard" as ExportResolution,
    name: "Standard",
    description: "Original size",
    multiplier: 1,
  },
  {
    id: "hd" as ExportResolution,
    name: "HD",
    description: "2x resolution",
    multiplier: 2,
  },
  {
    id: "print" as ExportResolution,
    name: "Print-Ready",
    description: "300 DPI for printing",
    multiplier: 3,
  },
];

export function ExportDialog({
  open,
  onOpenChange,
  imageUrl,
  imageName = "cardking1971-card",
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("png");
  const [resolution, setResolution] = useState<ExportResolution>("standard");
  const [jpgQuality, setJpgQuality] = useState([85]);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    
    try {
      // Load the image
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = imageUrl;
      });

      const resOption = RESOLUTION_OPTIONS.find((r) => r.id === resolution);
      const multiplier = resOption?.multiplier || 1;

      const canvas = document.createElement("canvas");
      canvas.width = img.width * multiplier;
      canvas.height = img.height * multiplier;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      // Enable high-quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const timestamp = Date.now();
      let filename = `${imageName}-${resolution}-${timestamp}`;

      if (format === "png") {
        const dataUrl = canvas.toDataURL("image/png");
        downloadDataUrl(dataUrl, `${filename}.png`);
        toast.success("PNG exported successfully!");
      } else if (format === "jpg") {
        // Fill with white background for JPG (no transparency)
        const jpgCanvas = document.createElement("canvas");
        jpgCanvas.width = canvas.width;
        jpgCanvas.height = canvas.height;
        const jpgCtx = jpgCanvas.getContext("2d");
        if (jpgCtx) {
          jpgCtx.fillStyle = "#FFFFFF";
          jpgCtx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);
          jpgCtx.drawImage(canvas, 0, 0);
          const dataUrl = jpgCanvas.toDataURL("image/jpeg", jpgQuality[0] / 100);
          downloadDataUrl(dataUrl, `${filename}.jpg`);
          toast.success("JPG exported successfully!");
        }
      } else if (format === "pdf") {
        // Create PDF with the image
        const aspectRatio = canvas.width / canvas.height;
        const pdfWidth = 210; // A4 width in mm
        const pdfHeight = pdfWidth / aspectRatio;
        
        const pdf = new jsPDF({
          orientation: aspectRatio > 1 ? "landscape" : "portrait",
          unit: "mm",
          format: [pdfWidth, pdfHeight],
        });

        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${filename}.pdf`);
        toast.success("PDF exported successfully!");
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [imageUrl, imageName, format, resolution, jpgQuality, onOpenChange]);

  const downloadDataUrl = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export Card
          </DialogTitle>
          <DialogDescription>
            Choose your preferred format and resolution for export
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as ExportFormat)}
              className="grid grid-cols-3 gap-3"
            >
              {FORMAT_OPTIONS.map((option) => (
                <Label
                  key={option.id}
                  htmlFor={option.id}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition-all",
                    "hover:border-primary/50 hover:bg-accent/50",
                    format === option.id
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  )}
                >
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    className="sr-only"
                  />
                  <option.icon
                    className={cn(
                      "h-6 w-6",
                      format === option.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                  <span className="text-sm font-medium">{option.name}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* JPG Quality Slider (only shown for JPG) */}
          <AnimatePresence>
            {format === "jpg" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Quality</Label>
                  <span className="text-sm text-muted-foreground">
                    {jpgQuality[0]}%
                  </span>
                </div>
                <Slider
                  value={jpgQuality}
                  onValueChange={setJpgQuality}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Higher quality = larger file size
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resolution Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Resolution</Label>
            <RadioGroup
              value={resolution}
              onValueChange={(v) => setResolution(v as ExportResolution)}
              className="space-y-2"
            >
              {RESOLUTION_OPTIONS.map((option) => (
                <Label
                  key={option.id}
                  htmlFor={`res-${option.id}`}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer transition-all",
                    "hover:border-primary/50 hover:bg-accent/50",
                    resolution === option.id
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  )}
                >
                  <RadioGroupItem
                    value={option.id}
                    id={`res-${option.id}`}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      resolution === option.id
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    )}
                  >
                    {resolution === option.id && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium">{option.name}</span>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full"
          size="lg"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export {format.toUpperCase()}
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
