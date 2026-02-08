import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import {
  Printer,
  Download,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  Upload,
  Scissors,
  LayoutGrid,
  FileImage,
  ArrowLeft,
  FileText,
  Loader2,
  FlipHorizontal2,
  RotateCcw,
  Paintbrush,
} from "lucide-react";
import CardBackDesigner from "@/components/CardBackDesigner";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import jsPDF from "jspdf";

// Print layout constants (in inches)
const PAGE_WIDTH = 8.5;
const PAGE_HEIGHT = 11;
const DPI = 300; // for high-quality print

// Card size presets - adjusted for gutters
// Standard: 2.5x3.5 with 0.05" gutter = 3 cols * 2.5 + 2 * 0.05 = 7.6" (fits 8.5")
//           3 rows * 3.5 + 2 * 0.05 = 10.6" (fits 11") → 9 cards but tight
//           With 0.1" gutter: 3*2.5 + 2*0.1 = 7.7" ✓, 3*3.5 + 2*0.1 = 10.7" ✓
// We'll use 8 cards (2 cols x 4 rows or 4 cols x 2 rows) for standard with gutters
// Actually: 3x3=9 still fits with small gutters. Let's keep 9 but reduce to 8 if gutter is large.
// Better approach: dynamically calculate how many fit.
const CARD_SIZES = {
  standard: {
    label: 'Standard (2.5" × 3.5")',
    shortLabel: "2.5×3.5",
    width: 2.5,
    height: 3.5,
    cols: 3,
    rows: 3,
    description: "Standard trading card size - up to 9 per page",
  },
  photo: {
    label: 'Photo (4" × 6")',
    shortLabel: "4×6",
    width: 4,
    height: 6,
    cols: 2,
    rows: 1,
    description: "Photo size - 2 cards per 8.5×11 page",
  },
} as const;

type CardSize = keyof typeof CARD_SIZES;

interface SelectedCard {
  id: number;
  imageUrl: string;
  prompt?: string;
  slotIndex: number;
}

type GalleryImage = {
  id: number;
  imageUrl: string | null;
  prompt: string;
  originalTopic: string | null;
  model: string;
  aspectRatio: string;
  status: string;
  isFavorite: boolean;
  createdAt: Date;
};

// Calculate effective layout with gutters
function calcLayout(
  cardW: number,
  cardH: number,
  cols: number,
  rows: number,
  gutter: number,
  bleed: number
) {
  // Card with bleed extends beyond the trim line
  const cardWithBleedW = cardW + bleed * 2;
  const cardWithBleedH = cardH + bleed * 2;
  const totalW = cols * cardWithBleedW + (cols - 1) * gutter;
  const totalH = rows * cardWithBleedH + (rows - 1) * gutter;
  const fitsWidth = totalW <= PAGE_WIDTH;
  const fitsHeight = totalH <= PAGE_HEIGHT;
  return { cardWithBleedW, cardWithBleedH, totalW, totalH, fits: fitsWidth && fitsHeight };
}

export default function PrintLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [cardSize, setCardSize] = useState<CardSize>("standard");
  const [showCropMarks, setShowCropMarks] = useState(true);
  const [fillMode, setFillMode] = useState<"single" | "multi">("multi");
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState<Set<number>>(new Set());
  const [gutter, setGutter] = useState(0.05); // inches between cards
  const [bleed, setBleed] = useState(0); // inches bleed margin
  const [cardBackEnabled, setCardBackEnabled] = useState(false);
  const [cardBackImage, setCardBackImage] = useState<{ url: string; name: string } | null>(null);
  const [showBackGalleryPicker, setShowBackGalleryPicker] = useState(false);
  const [previewSide, setPreviewSide] = useState<"front" | "back">("front");
  const [showDesigner, setShowDesigner] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);

  const sizeConfig = CARD_SIZES[cardSize];

  // Calculate effective per-page count based on gutter and bleed
  const effectiveLayout = useMemo(() => {
    const layout = calcLayout(sizeConfig.width, sizeConfig.height, sizeConfig.cols, sizeConfig.rows, gutter, bleed);
    if (layout.fits) {
      return { ...layout, cols: sizeConfig.cols, rows: sizeConfig.rows, perPage: sizeConfig.cols * sizeConfig.rows };
    }
    // If doesn't fit, try reducing rows first, then cols
    for (let r = sizeConfig.rows; r >= 1; r--) {
      for (let c = sizeConfig.cols; c >= 1; c--) {
        const l = calcLayout(sizeConfig.width, sizeConfig.height, c, r, gutter, bleed);
        if (l.fits) return { ...l, cols: c, rows: r, perPage: c * r };
      }
    }
    return { ...layout, cols: 1, rows: 1, perPage: 1 };
  }, [sizeConfig, gutter, bleed]);

  // Fetch gallery images
  const { data: galleryImages, isLoading: galleryLoading } = trpc.images.list.useQuery(
    { limit: 100, offset: 0, favoritesOnly: false },
    { enabled: isAuthenticated }
  );

  const completedImages = useMemo(() => {
    if (!galleryImages) return [];
    return (galleryImages as GalleryImage[]).filter(
      (img) => img.status === "completed" && img.imageUrl
    );
  }, [galleryImages]);

  // Handle card size change - reset selections
  const handleCardSizeChange = (size: CardSize) => {
    setCardSize(size);
    setSelectedCards([]);
  };

  // Open gallery picker for a specific slot
  const openGalleryPicker = (slotIndex: number) => {
    setActiveSlot(slotIndex);
    setShowGalleryPicker(true);
  };

  // Select an image from gallery for a slot
  const selectImageForSlot = (image: GalleryImage) => {
    if (activeSlot === null) return;

    if (fillMode === "single") {
      const allSlots: SelectedCard[] = [];
      for (let i = 0; i < effectiveLayout.perPage; i++) {
        allSlots.push({
          id: image.id,
          imageUrl: image.imageUrl!,
          prompt: image.prompt,
          slotIndex: i,
        });
      }
      setSelectedCards(allSlots);
    } else {
      setSelectedCards((prev) => {
        const filtered = prev.filter((c) => c.slotIndex !== activeSlot);
        return [
          ...filtered,
          {
            id: image.id,
            imageUrl: image.imageUrl!,
            prompt: image.prompt,
            slotIndex: activeSlot!,
          },
        ];
      });
    }

    setShowGalleryPicker(false);
    setActiveSlot(null);
  };

  // Remove a card from a slot
  const removeCardFromSlot = (slotIndex: number) => {
    if (fillMode === "single") {
      setSelectedCards([]);
    } else {
      setSelectedCards((prev) => prev.filter((c) => c.slotIndex !== slotIndex));
    }
  };

  // Get card for a specific slot
  const getCardForSlot = (slotIndex: number) => {
    return selectedCards.find((c) => c.slotIndex === slotIndex);
  };

  // Card back upload handler
  const uploadMutation = trpc.images.upload.useMutation();
  const handleBackImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const result = await uploadMutation.mutateAsync({
          imageDataUrl: dataUrl,
          fileName: file.name,
          prompt: "Card back design",
        });
        setCardBackImage({ url: result.imageUrl, name: file.name });
        toast.success("Card back image uploaded!");
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to upload card back image");
    }
    if (backFileInputRef.current) backFileInputRef.current.value = "";
  };

  // Select card back from gallery
  const selectBackFromGallery = (image: GalleryImage) => {
    setCardBackImage({ url: image.imageUrl!, name: image.originalTopic || image.prompt.slice(0, 30) });
    setShowBackGalleryPicker(false);
    toast.success("Card back image selected!");
  };

  const proxyMutation = trpc.images.proxy.useMutation();

  // Load an image via server proxy to bypass CORS for canvas rendering
  const loadImage = async (src: string): Promise<HTMLImageElement> => {
    const { dataUrl } = await proxyMutation.mutateAsync({ url: src });
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to decode proxied image: ${src}`));
      img.src = dataUrl;
    });
  };

  // Helper: draw a single card image with cover-mode cropping
  const drawCardImage = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    cardW: number,
    cardH: number
  ) => {
    const imgAspect = img.width / img.height;
    const cardAspect = cardW / cardH;
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (imgAspect > cardAspect) {
      sw = img.height * cardAspect;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / cardAspect;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, cardW, cardH);
  };

  // Helper: draw crop marks at all four corners of a card
  const drawCropMarks = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    markLen: number,
    markOffset: number,
    lineWidth: number
  ) => {
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = lineWidth;
    ctx.setLineDash([]);

    // Top-left
    ctx.beginPath();
    ctx.moveTo(x - markOffset, y);
    ctx.lineTo(x - markOffset - markLen, y);
    ctx.moveTo(x, y - markOffset);
    ctx.lineTo(x, y - markOffset - markLen);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(x + w + markOffset, y);
    ctx.lineTo(x + w + markOffset + markLen, y);
    ctx.moveTo(x + w, y - markOffset);
    ctx.lineTo(x + w, y - markOffset - markLen);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(x - markOffset, y + h);
    ctx.lineTo(x - markOffset - markLen, y + h);
    ctx.moveTo(x, y + h + markOffset);
    ctx.lineTo(x, y + h + markOffset + markLen);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(x + w + markOffset, y + h);
    ctx.lineTo(x + w + markOffset + markLen, y + h);
    ctx.moveTo(x + w, y + h + markOffset);
    ctx.lineTo(x + w, y + h + markOffset + markLen);
    ctx.stroke();
  };

  // Render the BACK layout (mirrored for double-sided printing)
  const renderBackLayout = async (
    ctx: CanvasRenderingContext2D,
    ppi: number,
    showProgress?: boolean
  ) => {
    const pxWidth = PAGE_WIDTH * ppi;
    const pxHeight = PAGE_HEIGHT * ppi;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pxWidth, pxHeight);

    if (!cardBackImage) return;

    const cardW = sizeConfig.width * ppi;
    const cardH = sizeConfig.height * ppi;
    const bleedPx = bleed * ppi;
    const gutterPx = gutter * ppi;
    const cardWithBleedW = cardW + bleedPx * 2;
    const cardWithBleedH = cardH + bleedPx * 2;

    const { cols, rows } = effectiveLayout;
    const totalW = cols * cardWithBleedW + (cols - 1) * gutterPx;
    const totalH = rows * cardWithBleedH + (rows - 1) * gutterPx;
    const offsetX = (pxWidth - totalW) / 2;
    const offsetY = (pxHeight - totalH) / 2;

    let backImg: HTMLImageElement | null = null;
    try {
      backImg = await loadImage(cardBackImage.url);
    } catch {
      ctx.fillStyle = "#f0f0f0";
      ctx.font = `${16 * (ppi / 96)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("Failed to load card back image", pxWidth / 2, pxHeight / 2);
      return;
    }

    // For double-sided printing, the back sheet must be MIRRORED horizontally
    // so that when printed on the reverse side, each card back aligns with its front.
    // We mirror the column order: front col 0 → back col (cols-1), etc.
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const frontSlotIndex = row * cols + col;
        const card = getCardForSlot(frontSlotIndex);
        if (!card) continue; // Only draw backs for slots that have fronts

        // Mirror: place this back at the mirrored column position
        const mirroredCol = cols - 1 - col;
        const bx = offsetX + mirroredCol * (cardWithBleedW + gutterPx);
        const by = offsetY + row * (cardWithBleedH + gutterPx);
        const tx = bx + bleedPx;
        const ty = by + bleedPx;

        if (bleed > 0) {
          drawCardImage(ctx, backImg, bx, by, cardWithBleedW, cardWithBleedH);
        } else {
          drawCardImage(ctx, backImg, tx, ty, cardW, cardH);
        }

        if (showCropMarks) {
          const markLen = 0.15 * ppi;
          const markOffset = 0.03 * ppi;
          drawCropMarks(ctx, tx, ty, cardW, cardH, markLen, markOffset, Math.max(0.5, 0.5 * (ppi / 96)));
        }
      }
    }

    // Page border
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1 * (ppi / 96);
    ctx.setLineDash([]);
    ctx.strokeRect(0, 0, pxWidth, pxHeight);
  };

  // Render the FRONT layout onto a canvas context at a given scale (pixels per inch)
  const renderLayout = async (
    ctx: CanvasRenderingContext2D,
    ppi: number, // pixels per inch
    showProgress?: boolean
  ) => {
    const pxWidth = PAGE_WIDTH * ppi;
    const pxHeight = PAGE_HEIGHT * ppi;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pxWidth, pxHeight);

    const cardW = sizeConfig.width * ppi;
    const cardH = sizeConfig.height * ppi;
    const bleedPx = bleed * ppi;
    const gutterPx = gutter * ppi;
    const cardWithBleedW = cardW + bleedPx * 2;
    const cardWithBleedH = cardH + bleedPx * 2;

    const { cols, rows } = effectiveLayout;
    const totalW = cols * cardWithBleedW + (cols - 1) * gutterPx;
    const totalH = rows * cardWithBleedH + (rows - 1) * gutterPx;
    const offsetX = (pxWidth - totalW) / 2;
    const offsetY = (pxHeight - totalH) / 2;

    const newLoadingSlots = new Set<number>();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const slotIndex = row * cols + col;
        // Position includes bleed area
        const bx = offsetX + col * (cardWithBleedW + gutterPx);
        const by = offsetY + row * (cardWithBleedH + gutterPx);
        // Trim position (inside bleed)
        const tx = bx + bleedPx;
        const ty = by + bleedPx;

        const card = getCardForSlot(slotIndex);

        if (card) {
          if (showProgress) {
            newLoadingSlots.add(slotIndex);
            setLoadingSlots(new Set(newLoadingSlots));
          }
          try {
            const img = await loadImage(card.imageUrl);
            // Draw image covering the full bleed area (larger than trim)
            if (bleed > 0) {
              drawCardImage(ctx, img, bx, by, cardWithBleedW, cardWithBleedH);
            } else {
              drawCardImage(ctx, img, tx, ty, cardW, cardH);
            }
          } catch {
            ctx.fillStyle = "#f0f0f0";
            ctx.fillRect(tx, ty, cardW, cardH);
            ctx.fillStyle = "#999";
            ctx.font = `${14 * (ppi / 96)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText("Image failed", tx + cardW / 2, ty + cardH / 2);
          }
          if (showProgress) {
            newLoadingSlots.delete(slotIndex);
            setLoadingSlots(new Set(newLoadingSlots));
          }
        } else {
          // Empty slot
          ctx.fillStyle = "#f8f8f8";
          ctx.fillRect(tx, ty, cardW, cardH);
          ctx.strokeStyle = "#ddd";
          ctx.lineWidth = 1 * (ppi / 96);
          ctx.setLineDash([5 * (ppi / 96), 5 * (ppi / 96)]);
          ctx.strokeRect(tx, ty, cardW, cardH);
          ctx.setLineDash([]);

          ctx.fillStyle = "#bbb";
          ctx.font = `${12 * (ppi / 96)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(`Slot ${slotIndex + 1}`, tx + cardW / 2, ty + cardH / 2);
        }

        // Crop marks at the trim line
        if (showCropMarks) {
          const markLen = 0.15 * ppi;
          const markOffset = 0.03 * ppi;
          drawCropMarks(ctx, tx, ty, cardW, cardH, markLen, markOffset, Math.max(0.5, 0.5 * (ppi / 96)));
        }
      }
    }

    // Page border
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1 * (ppi / 96);
    ctx.setLineDash([]);
    ctx.strokeRect(0, 0, pxWidth, pxHeight);
  };

  // Generate the print layout preview on canvas
  const generatePrintLayout = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);

    try {
      const scale = 2;
      const ppi = 96 * scale;
      canvas.width = PAGE_WIDTH * ppi;
      canvas.height = PAGE_HEIGHT * ppi;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      await renderLayout(ctx, ppi, true);

      // Also render back preview if enabled
      if (cardBackEnabled && cardBackImage) {
        const backCanvas = backCanvasRef.current;
        if (backCanvas) {
          backCanvas.width = PAGE_WIDTH * ppi;
          backCanvas.height = PAGE_HEIGHT * ppi;
          const backCtx = backCanvas.getContext("2d");
          if (backCtx) {
            await renderBackLayout(backCtx, ppi);
          }
        }
      }
    } catch (error) {
      console.error("Error generating print layout:", error);
      toast.error("Failed to generate print layout");
    } finally {
      setIsGenerating(false);
      setLoadingSlots(new Set());
    }
  }, [cardSize, showCropMarks, selectedCards, effectiveLayout, gutter, bleed, cardBackEnabled, cardBackImage]);

  // Auto-regenerate preview when settings change
  useEffect(() => {
    generatePrintLayout();
  }, [generatePrintLayout]);

  // Download the print layout as PNG at 300 DPI
  const downloadPNG = useCallback(async () => {
    setIsGenerating(true);
    try {
      // Front sheet
      const printCanvas = document.createElement("canvas");
      printCanvas.width = PAGE_WIDTH * DPI;
      printCanvas.height = PAGE_HEIGHT * DPI;
      const ctx = printCanvas.getContext("2d");
      if (!ctx) return;

      await renderLayout(ctx, DPI);

      if (cardBackEnabled && cardBackImage) {
        // When card backs are enabled, bundle front + back into a ZIP file
        // This avoids browser blocking the second download
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();

        // Add front PNG to zip
        const frontDataUrl = printCanvas.toDataURL("image/png");
        const frontBase64 = frontDataUrl.split(",")[1];
        zip.file(`print-layout-front-${cardSize}.png`, frontBase64, { base64: true });

        // Render and add back PNG to zip
        const backCanvas = document.createElement("canvas");
        backCanvas.width = PAGE_WIDTH * DPI;
        backCanvas.height = PAGE_HEIGHT * DPI;
        const backCtx = backCanvas.getContext("2d");
        if (backCtx) {
          await renderBackLayout(backCtx, DPI);
          const backDataUrl = backCanvas.toDataURL("image/png");
          const backBase64 = backDataUrl.split(",")[1];
          zip.file(`print-layout-back-${cardSize}.png`, backBase64, { base64: true });
        }

        // Generate and download zip
        const blob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.download = `print-layout-double-sided-${cardSize}-${Date.now()}.zip`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);

        toast.success("Front and back sheets downloaded as ZIP at 300 DPI!");
      } else {
        // Single front-only download
        const link = document.createElement("a");
        link.download = `print-layout-front-${cardSize}-${Date.now()}.png`;
        link.href = printCanvas.toDataURL("image/png");
        link.click();
        toast.success("Print layout downloaded at 300 DPI!");
      }
    } catch (error) {
      console.error("Error downloading print layout:", error);
      toast.error("Failed to download print layout");
    } finally {
      setIsGenerating(false);
    }
  }, [cardSize, showCropMarks, selectedCards, effectiveLayout, gutter, bleed, cardBackEnabled, cardBackImage]);

  // Download the print layout as PDF
  const downloadPDF = useCallback(async () => {
    setIsGenerating(true);
    try {
      // Render front to a high-DPI canvas
      const printCanvas = document.createElement("canvas");
      printCanvas.width = PAGE_WIDTH * DPI;
      printCanvas.height = PAGE_HEIGHT * DPI;
      const ctx = printCanvas.getContext("2d");
      if (!ctx) return;

      await renderLayout(ctx, DPI);

      // Create PDF - letter size in inches
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: "letter",
      });

      // Page 1: Front
      const frontImgData = printCanvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(frontImgData, "JPEG", 0, 0, PAGE_WIDTH, PAGE_HEIGHT);

      // Page 2: Back (if enabled)
      if (cardBackEnabled && cardBackImage) {
        const backCanvas = document.createElement("canvas");
        backCanvas.width = PAGE_WIDTH * DPI;
        backCanvas.height = PAGE_HEIGHT * DPI;
        const backCtx = backCanvas.getContext("2d");
        if (backCtx) {
          await renderBackLayout(backCtx, DPI);
          const backImgData = backCanvas.toDataURL("image/jpeg", 0.95);
          pdf.addPage("letter", "portrait");
          pdf.addImage(backImgData, "JPEG", 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
        }
        pdf.save(`print-layout-double-sided-${cardSize}-${Date.now()}.pdf`);
        toast.success("Double-sided PDF exported! Page 1 = fronts, Page 2 = backs");
      } else {
        pdf.save(`print-layout-${cardSize}-${Date.now()}.pdf`);
        toast.success("PDF exported successfully!");
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsGenerating(false);
    }
  }, [cardSize, showCropMarks, selectedCards, effectiveLayout, gutter, bleed, cardBackEnabled, cardBackImage]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <Printer className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Sign in to Print</h2>
              <p className="text-muted-foreground mb-4">
                Create print-ready card sheets from your gallery.
              </p>
              <Button asChild>
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/gallery">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-2xl lg:text-3xl font-bold">Print Cards</h1>
            </div>
            <p className="text-muted-foreground ml-11">
              Arrange your trading cards for professional printing on 8.5" × 11" paper
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-6">
          {/* Left Panel - Controls */}
          <div className="space-y-4">
            {/* Card Size Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  Card Size
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(Object.keys(CARD_SIZES) as CardSize[]).map((size) => {
                  const config = CARD_SIZES[size];
                  return (
                    <button
                      key={size}
                      onClick={() => handleCardSizeChange(size)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border-2 transition-all",
                        cardSize === size
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{config.label}</span>
                        {cardSize === size && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {config.description}
                      </p>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Options */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Crop Marks */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Crop Marks</Label>
                    <p className="text-xs text-muted-foreground">
                      Add cut lines for precise trimming
                    </p>
                  </div>
                  <Switch
                    checked={showCropMarks}
                    onCheckedChange={setShowCropMarks}
                  />
                </div>

                {/* Gutter / Spacing */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Label className="font-medium">Card Spacing</Label>
                      <p className="text-xs text-muted-foreground">
                        Gap between cards for easier cutting
                      </p>
                    </div>
                    <span className="text-sm font-mono text-primary">{gutter.toFixed(2)}"</span>
                  </div>
                  <Slider
                    value={[gutter]}
                    onValueChange={([v]) => setGutter(v)}
                    min={0}
                    max={0.25}
                    step={0.01}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>0" (no gap)</span>
                    <span>0.25"</span>
                  </div>
                </div>

                {/* Bleed Margin */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Label className="font-medium">Bleed Margin</Label>
                      <p className="text-xs text-muted-foreground">
                        Extra image beyond trim for pro printing
                      </p>
                    </div>
                    <span className="text-sm font-mono text-primary">{bleed.toFixed(3)}"</span>
                  </div>
                  <Slider
                    value={[bleed]}
                    onValueChange={([v]) => setBleed(v)}
                    min={0}
                    max={0.25}
                    step={0.0625}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>0" (none)</span>
                    <span>1/8"</span>
                    <span>1/4"</span>
                  </div>
                </div>

                {/* Fill Mode */}
                <div>
                  <Label className="font-medium mb-2 block">Fill Mode</Label>
                  <Tabs
                    value={fillMode}
                    onValueChange={(v) => {
                      setFillMode(v as "single" | "multi");
                      setSelectedCards([]);
                    }}
                  >
                    <TabsList className="w-full">
                      <TabsTrigger value="single" className="flex-1 text-xs">
                        Single Card
                      </TabsTrigger>
                      <TabsTrigger value="multi" className="flex-1 text-xs">
                        Multiple Cards
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <p className="text-xs text-muted-foreground mt-2">
                    {fillMode === "single"
                      ? "Fill all slots with one card image"
                      : "Pick different cards for each slot"}
                  </p>
                </div>

                {/* Layout info */}
                <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cards per page:</span>
                    <span className="font-medium">{effectiveLayout.perPage} ({effectiveLayout.cols}×{effectiveLayout.rows})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Card size:</span>
                    <span className="font-medium">{sizeConfig.width}" × {sizeConfig.height}"</span>
                  </div>
                  {bleed > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">With bleed:</span>
                      <span className="font-medium">{(sizeConfig.width + bleed * 2).toFixed(3)}" × {(sizeConfig.height + bleed * 2).toFixed(3)}"</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Spacing:</span>
                    <span className="font-medium">{gutter > 0 ? `${gutter.toFixed(2)}"` : "None"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card Back Design */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FlipHorizontal2 className="w-4 h-4" />
                  Card Back (Double-Sided)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Enable Card Backs</Label>
                    <p className="text-xs text-muted-foreground">
                      Add a back design for double-sided printing
                    </p>
                  </div>
                  <Switch
                    checked={cardBackEnabled}
                    onCheckedChange={(checked) => {
                      setCardBackEnabled(checked);
                      if (!checked) setPreviewSide("front");
                    }}
                  />
                </div>

                {cardBackEnabled && (
                  <>
                    {cardBackImage ? (
                      <div className="space-y-3">
                        <div className="relative aspect-[5/7] rounded-lg border-2 border-primary/50 overflow-hidden">
                          <img
                            src={cardBackImage.url}
                            alt="Card back"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-white text-xs truncate">{cardBackImage.name}</p>
                          </div>
                          <button
                            onClick={() => setCardBackImage(null)}
                            className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setCardBackImage(null)}
                        >
                          <RotateCcw className="w-3 h-3 mr-2" />
                          Change Back Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
                          onClick={() => setShowDesigner(true)}
                        >
                          <Paintbrush className="w-4 h-4 mr-2" />
                          Design Custom Back
                        </Button>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="bg-card px-2 text-muted-foreground">or use an image</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowBackGalleryPicker(true)}
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Choose from Gallery
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => backFileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </Button>
                        <p className="text-[10px] text-muted-foreground text-center">
                          This image will be used as the back for all cards
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Card Slots */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileImage className="w-4 h-4" />
                  Card Slots ({selectedCards.length}/{effectiveLayout.perPage})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "grid gap-2",
                    effectiveLayout.cols >= 3 ? "grid-cols-3" : "grid-cols-2"
                  )}
                >
                  {Array.from({ length: effectiveLayout.perPage }).map((_, i) => {
                    const card = getCardForSlot(i);
                    const isLoading = loadingSlots.has(i);
                    return (
                      <div
                        key={i}
                        className={cn(
                          "relative aspect-[5/7] rounded-lg border-2 overflow-hidden cursor-pointer transition-all group",
                          card
                            ? "border-primary/50"
                            : "border-dashed border-border hover:border-primary/30"
                        )}
                        onClick={() => !card && openGalleryPicker(i)}
                      >
                        {card ? (
                          <>
                            <img
                              src={card.imageUrl}
                              alt={`Slot ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {/* Loading overlay */}
                            {isLoading && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeCardFromSlot(i);
                              }}
                              className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Plus className="w-5 h-5 mb-1" />
                            <span className="text-[10px]">Slot {i + 1}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {fillMode === "single" && selectedCards.length === 0 && (
                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => openGalleryPicker(0)}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Choose Card to Fill All Slots
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={downloadPNG}
                  disabled={selectedCards.length === 0 || isGenerating}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "PNG (300 DPI)"
                  )}
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={downloadPDF}
                  disabled={selectedCards.length === 0 || isGenerating}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "PDF Export"
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                PDF is recommended for print shops • PNG for home printing
              </p>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">
                      Print Preview (8.5" × 11")
                    </CardTitle>
                    {cardBackEnabled && cardBackImage && (
                      <div className="flex bg-muted rounded-lg p-0.5">
                        <button
                          onClick={() => setPreviewSide("front")}
                          className={cn(
                            "px-3 py-1 rounded-md text-xs font-medium transition-all",
                            previewSide === "front"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Front
                        </button>
                        <button
                          onClick={() => setPreviewSide("back")}
                          className={cn(
                            "px-3 py-1 rounded-md text-xs font-medium transition-all",
                            previewSide === "back"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Back
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {sizeConfig.shortLabel} • {effectiveLayout.perPage}-up
                    {showCropMarks ? " • Crop marks" : ""}
                    {bleed > 0 ? ` • ${bleed}"  bleed` : ""}
                    {cardBackEnabled && cardBackImage ? " • Double-sided" : ""}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div
                    className="relative bg-white rounded-lg shadow-lg border"
                    style={{
                      aspectRatio: `${PAGE_WIDTH}/${PAGE_HEIGHT}`,
                      maxHeight: "calc(100vh - 200px)",
                      width: "100%",
                      maxWidth: "600px",
                    }}
                  >
                    {/* Front canvas */}
                    <canvas
                      ref={canvasRef}
                      className={cn(
                        "w-full h-full rounded-lg",
                        previewSide === "back" && cardBackEnabled && cardBackImage ? "hidden" : ""
                      )}
                      style={{ imageRendering: "auto" }}
                    />
                    {/* Back canvas */}
                    <canvas
                      ref={backCanvasRef}
                      className={cn(
                        "w-full h-full rounded-lg",
                        previewSide === "front" || !cardBackEnabled || !cardBackImage ? "hidden" : ""
                      )}
                      style={{ imageRendering: "auto" }}
                    />
                    {/* Global loading overlay */}
                    {isGenerating && loadingSlots.size > 0 && (
                      <div className="absolute bottom-3 left-3 right-3 bg-black/70 text-white rounded-lg px-4 py-2 flex items-center gap-2 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading images... ({loadingSlots.size} remaining)
                      </div>
                    )}
                  </div>
                </div>
                {cardBackEnabled && cardBackImage && (
                  <p className="text-[10px] text-muted-foreground text-center mt-3">
                    <FlipHorizontal2 className="w-3 h-3 inline mr-1" />
                    Back sheet is horizontally mirrored for correct double-sided alignment
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hidden file input for card back upload */}
        <input
          ref={backFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBackImageUpload}
        />

        {/* Back Gallery Picker Modal */}
        {showBackGalleryPicker && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-background rounded-xl max-w-4xl w-full max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">
                  Select Card Back Image
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBackGalleryPicker(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {galleryLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : completedImages.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No images in your gallery yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {completedImages.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => selectBackFromGallery(img)}
                        className="relative aspect-[2/3] rounded-lg overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all hover:scale-105"
                      >
                        <img
                          src={img.imageUrl!}
                          alt={img.prompt}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-white text-[10px] line-clamp-2">
                            {img.originalTopic || img.prompt}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setShowBackGalleryPicker(false);
                    backFileInputRef.current?.click();
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload from Device Instead
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Picker Modal */}
        {showGalleryPicker && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-background rounded-xl max-w-4xl w-full max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">
                  Select Card from Gallery
                  {fillMode === "single"
                    ? " (fills all slots)"
                    : ` (Slot ${(activeSlot ?? 0) + 1})`}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowGalleryPicker(false);
                    setActiveSlot(null);
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {galleryLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : completedImages.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No images in your gallery yet.
                    </p>
                    <Link href="/create">
                      <Button variant="outline" className="mt-4">
                        Create Your First Card
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {completedImages.map((img) => {
                      const isSelected = selectedCards.some(
                        (c) => c.id === img.id
                      );
                      return (
                        <button
                          key={img.id}
                          onClick={() => selectImageForSlot(img)}
                          className={cn(
                            "relative aspect-[2/3] rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                            isSelected
                              ? "border-primary ring-2 ring-primary/30"
                              : "border-transparent hover:border-primary/50"
                          )}
                        >
                          <img
                            src={img.imageUrl!}
                            alt={img.prompt}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <Check className="w-8 h-8 text-primary" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-white text-[10px] line-clamp-2">
                              {img.originalTopic || img.prompt}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Card Back Designer Modal */}
      {showDesigner && (
        <CardBackDesigner
          cardWidth={sizeConfig.width}
          cardHeight={sizeConfig.height}
          onApply={(imageDataUrl) => {
            setCardBackImage({ url: imageDataUrl, name: "Custom Design" });
            setShowDesigner(false);
            toast.success("Custom card back design applied!");
          }}
          onCancel={() => setShowDesigner(false)}
        />
      )}
    </AppLayout>
  );
}
