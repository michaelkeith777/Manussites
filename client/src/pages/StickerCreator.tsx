import { useAuth } from "@/_core/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import {
  Circle,
  Square,
  Star,
  Heart,
  Hexagon,
  RectangleHorizontal,
  Download,
  FileText,
  Loader2,
  Check,
  Scissors,
  ImagePlus,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Info,
  Search,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCcw,
  Save,
  X,
  Eye,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// ── Constants ──────────────────────────────────────────────────────
const PAGE_WIDTH = 8.5; // inches
const PAGE_HEIGHT = 11; // inches
const DPI = 300; // print quality
const MARGIN = 0.25; // page margin in inches

// ── Shape definitions ──────────────────────────────────────────────
type StickerShape =
  | "circle"
  | "square"
  | "rectangle"
  | "oval"
  | "rounded-square"
  | "star"
  | "heart"
  | "hexagon";

interface ShapeConfig {
  id: StickerShape;
  label: string;
  icon: React.ElementType;
  aspectRatio?: number; // width/height, undefined = custom
}

const SHAPES: ShapeConfig[] = [
  { id: "circle", label: "Circle", icon: Circle, aspectRatio: 1 },
  { id: "square", label: "Square", icon: Square, aspectRatio: 1 },
  { id: "rectangle", label: "Rectangle", icon: RectangleHorizontal },
  { id: "oval", label: "Oval", icon: Circle },
  { id: "rounded-square", label: "Rounded", icon: Square, aspectRatio: 1 },
  { id: "star", label: "Star", icon: Star, aspectRatio: 1 },
  { id: "heart", label: "Heart", icon: Heart, aspectRatio: 1 },
  { id: "hexagon", label: "Hexagon", icon: Hexagon, aspectRatio: 1 },
];

// ── Preset sizes ───────────────────────────────────────────────────
interface SizePreset {
  label: string;
  width: number;
  height: number;
}

const SIZE_PRESETS: SizePreset[] = [
  { label: '1"', width: 1, height: 1 },
  { label: '1.5"', width: 1.5, height: 1.5 },
  { label: '2"', width: 2, height: 2 },
  { label: '2.5"', width: 2.5, height: 2.5 },
  { label: '3"', width: 3, height: 3 },
  { label: '4"', width: 4, height: 4 },
];

// ── Gallery image type ─────────────────────────────────────────────
interface GalleryImage {
  id: number;
  url: string;
  prompt: string;
  model: string;
  aspectRatio: string;
  isFavorite: boolean;
}

// ── Sticker slot ───────────────────────────────────────────────────
interface StickerSlot {
  image: GalleryImage | null;
  zoom: number;   // 1.0 = fit, 2.0 = 2x zoom
  panX: number;   // -1 to 1 normalized offset
  panY: number;   // -1 to 1 normalized offset
}

// ── Shape clipping paths ───────────────────────────────────────────
function clipShape(
  ctx: CanvasRenderingContext2D,
  shape: StickerShape,
  cx: number,
  cy: number,
  w: number,
  h: number
) {
  const hw = w / 2;
  const hh = h / 2;

  ctx.beginPath();
  switch (shape) {
    case "circle":
      ctx.arc(cx, cy, Math.min(hw, hh), 0, Math.PI * 2);
      break;

    case "square":
      ctx.rect(cx - hw, cy - hh, w, h);
      break;

    case "rectangle":
      ctx.rect(cx - hw, cy - hh, w, h);
      break;

    case "oval":
      ctx.ellipse(cx, cy, hw, hh, 0, 0, Math.PI * 2);
      break;

    case "rounded-square": {
      const r = Math.min(hw, hh) * 0.2;
      ctx.moveTo(cx - hw + r, cy - hh);
      ctx.lineTo(cx + hw - r, cy - hh);
      ctx.quadraticCurveTo(cx + hw, cy - hh, cx + hw, cy - hh + r);
      ctx.lineTo(cx + hw, cy + hh - r);
      ctx.quadraticCurveTo(cx + hw, cy + hh, cx + hw - r, cy + hh);
      ctx.lineTo(cx - hw + r, cy + hh);
      ctx.quadraticCurveTo(cx - hw, cy + hh, cx - hw, cy + hh - r);
      ctx.lineTo(cx - hw, cy - hh + r);
      ctx.quadraticCurveTo(cx - hw, cy - hh, cx - hw + r, cy - hh);
      break;
    }

    case "star": {
      const outerR = Math.min(hw, hh);
      const innerR = outerR * 0.4;
      const points = 5;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    }

    case "heart": {
      const topY = cy - hh * 0.3;
      ctx.moveTo(cx, cy + hh * 0.8);
      ctx.bezierCurveTo(cx - hw * 1.3, cy - hh * 0.1, cx - hw * 0.6, cy - hh, cx, topY);
      ctx.bezierCurveTo(cx + hw * 0.6, cy - hh, cx + hw * 1.3, cy - hh * 0.1, cx, cy + hh * 0.8);
      break;
    }

    case "hexagon": {
      const r = Math.min(hw, hh);
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 - Math.PI / 6;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    }
  }
  ctx.clip();
}

// ── Draw shape outline (for cut guides) ────────────────────────────
function drawShapeOutline(
  ctx: CanvasRenderingContext2D,
  shape: StickerShape,
  cx: number,
  cy: number,
  w: number,
  h: number,
  lineWidth: number,
  color: string,
  dashed: boolean = false
) {
  const hw = w / 2;
  const hh = h / 2;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  if (dashed) ctx.setLineDash([lineWidth * 4, lineWidth * 3]);
  else ctx.setLineDash([]);

  ctx.beginPath();
  switch (shape) {
    case "circle":
      ctx.arc(cx, cy, Math.min(hw, hh), 0, Math.PI * 2);
      break;
    case "square":
    case "rectangle":
      ctx.rect(cx - hw, cy - hh, w, h);
      break;
    case "oval":
      ctx.ellipse(cx, cy, hw, hh, 0, 0, Math.PI * 2);
      break;
    case "rounded-square": {
      const r = Math.min(hw, hh) * 0.2;
      ctx.moveTo(cx - hw + r, cy - hh);
      ctx.lineTo(cx + hw - r, cy - hh);
      ctx.quadraticCurveTo(cx + hw, cy - hh, cx + hw, cy - hh + r);
      ctx.lineTo(cx + hw, cy + hh - r);
      ctx.quadraticCurveTo(cx + hw, cy + hh, cx + hw - r, cy + hh);
      ctx.lineTo(cx - hw + r, cy + hh);
      ctx.quadraticCurveTo(cx - hw, cy + hh, cx - hw, cy + hh - r);
      ctx.lineTo(cx - hw, cy - hh + r);
      ctx.quadraticCurveTo(cx - hw, cy - hh, cx - hw + r, cy - hh);
      break;
    }
    case "star": {
      const outerR = Math.min(hw, hh);
      const innerR = outerR * 0.4;
      const points = 5;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    }
    case "heart": {
      const topY = cy - hh * 0.3;
      ctx.moveTo(cx, cy + hh * 0.8);
      ctx.bezierCurveTo(cx - hw * 1.3, cy - hh * 0.1, cx - hw * 0.6, cy - hh, cx, topY);
      ctx.bezierCurveTo(cx + hw * 0.6, cy - hh, cx + hw * 1.3, cy - hh * 0.1, cx, cy + hh * 0.8);
      break;
    }
    case "hexagon": {
      const r = Math.min(hw, hh);
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 - Math.PI / 6;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    }
  }
  ctx.stroke();
  ctx.restore();
}

// loadImage is now a method inside the component that uses tRPC mutation

// ── Draw image fitted proportionally into a clipped shape ──────────
function drawImageInShape(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  shape: StickerShape,
  cx: number,
  cy: number,
  w: number,
  h: number,
  zoom: number = 1,
  panX: number = 0,
  panY: number = 0
) {
  ctx.save();
  clipShape(ctx, shape, cx, cy, w, h);

  // Cover-fit: scale image to fill the shape area while maintaining aspect ratio
  const imgAspect = img.width / img.height;
  const shapeAspect = w / h;
  let drawW: number, drawH: number;

  if (imgAspect > shapeAspect) {
    drawH = h;
    drawW = h * imgAspect;
  } else {
    drawW = w;
    drawH = w / imgAspect;
  }

  // Apply zoom
  drawW *= zoom;
  drawH *= zoom;

  // Apply pan (panX/panY are -1 to 1, mapped to the available overflow)
  const overflowX = (drawW - w) / 2;
  const overflowY = (drawH - h) / 2;
  const offsetX = panX * overflowX;
  const offsetY = panY * overflowY;

  ctx.drawImage(img, cx - drawW / 2 + offsetX, cy - drawH / 2 + offsetY, drawW, drawH);
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function StickerCreator() {
  const { isAuthenticated } = useAuth();

  // ── State ──────────────────────────────────────────────────────
  const [shape, setShape] = useState<StickerShape>("circle");
  const [stickerWidth, setStickerWidth] = useState(2);
  const [stickerHeight, setStickerHeight] = useState(2);
  const [aspectLocked, setAspectLocked] = useState(true);
  const [gutter, setGutter] = useState(0.1);
  const [showCutGuides, setShowCutGuides] = useState(true);
  const [fillMode, setFillMode] = useState(true); // true = one image fills all slots
  const [isGenerating, setIsGenerating] = useState(false);

  // Gallery picker
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const [pickingSlotIndex, setPickingSlotIndex] = useState<number | null>(null);
  const [gallerySearch, setGallerySearch] = useState("");

  // Selected images
  const [selectedImages, setSelectedImages] = useState<(GalleryImage | null)[]>([]);
  const [fillImage, setFillImage] = useState<GalleryImage | null>(null);

  // Zoom & Pan state (global for fill mode, per-slot for multi mode)
  const [fillZoom, setFillZoom] = useState(1);
  const [fillPanX, setFillPanX] = useState(0);
  const [fillPanY, setFillPanY] = useState(0);
  const [slotZooms, setSlotZooms] = useState<Record<number, number>>({});
  const [slotPanXs, setSlotPanXs] = useState<Record<number, number>>({});
  const [slotPanYs, setSlotPanYs] = useState<Record<number, number>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragSlot, setDragSlot] = useState<number | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number } | null>(null);

  // ── Editing mode state ─────────────────────────────────────────
  // When editing, we store temporary zoom/pan values. The main sticker sheet
  // only updates after the user clicks Save.
  const [editingSlot, setEditingSlot] = useState<number | null>(null); // null = not editing
  const [editZoom, setEditZoom] = useState(1);
  const [editPanX, setEditPanX] = useState(0);
  const [editPanY, setEditPanY] = useState(0);
  const editPreviewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Canvas refs
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // Persistent image cache to avoid re-downloading on every zoom/pan change
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Proxy mutation for CORS-safe image loading (fallback)
  const proxyMutation = trpc.images.proxy.useMutation();

  const loadImageCached = useCallback(async (url: string): Promise<HTMLImageElement> => {
    // Return cached image if available
    const cached = imageCacheRef.current.get(url);
    if (cached) return cached;

    // Strategy 1: Try loading directly with crossOrigin (works for S3/CloudFront URLs)
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new window.Image();
        el.crossOrigin = "anonymous";
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("Direct load failed"));
        el.src = url;
      });
      imageCacheRef.current.set(url, img);
      return img;
    } catch {
      // Direct load failed, try proxy
    }

    // Strategy 2: Try proxy (converts to base64 data URL server-side)
    try {
      const { dataUrl } = await proxyMutation.mutateAsync({ url });
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new window.Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("Proxy load failed"));
        el.src = dataUrl;
      });
      imageCacheRef.current.set(url, img);
      return img;
    } catch {
      // Proxy also failed
    }

    // Strategy 3: Last resort - load without crossOrigin (canvas will be tainted but image shows)
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error(`All loading strategies failed for: ${url}`));
      el.src = url;
    });
    imageCacheRef.current.set(url, img);
    return img;
  }, []);

  // ── Gallery data ───────────────────────────────────────────────
  const { data: galleryData } = trpc.images.list.useQuery(
    { limit: 100, offset: 0 },
    { enabled: isAuthenticated }
  );
  const galleryImages: GalleryImage[] = useMemo(
    () => (galleryData ?? []).map((img: any) => ({
      id: img.id,
      url: img.imageUrl || img.url || '',
      prompt: img.prompt || '',
      model: img.model || '',
      aspectRatio: img.aspectRatio || '',
      isFavorite: img.isFavorite || false,
    })),
    [galleryData]
  );

  const filteredGallery = useMemo(() => {
    if (!gallerySearch.trim()) return galleryImages;
    const q = gallerySearch.toLowerCase();
    return galleryImages.filter(
      (img) =>
        img.prompt?.toLowerCase().includes(q) ||
        img.model?.toLowerCase().includes(q)
    );
  }, [galleryImages, gallerySearch]);

  // ── Auto-calculate layout ──────────────────────────────────────
  const layout = useMemo(() => {
    const usableW = PAGE_WIDTH - MARGIN * 2;
    const usableH = PAGE_HEIGHT - MARGIN * 2;
    const cellW = stickerWidth + gutter;
    const cellH = stickerHeight + gutter;
    const cols = Math.max(1, Math.floor((usableW + gutter) / cellW));
    const rows = Math.max(1, Math.floor((usableH + gutter) / cellH));
    const total = cols * rows;
    return { cols, rows, total };
  }, [stickerWidth, stickerHeight, gutter]);

  // ── Shape change handler ───────────────────────────────────────
  const handleShapeChange = useCallback(
    (newShape: StickerShape) => {
      setShape(newShape);
      const config = SHAPES.find((s) => s.id === newShape);
      if (config?.aspectRatio && aspectLocked) {
        setStickerHeight(stickerWidth / config.aspectRatio);
      }
    },
    [stickerWidth, aspectLocked]
  );

  // ── Size change handlers ───────────────────────────────────────
  const handleWidthChange = useCallback(
    (val: number) => {
      const w = Math.max(0.5, Math.min(8, val));
      setStickerWidth(w);
      if (aspectLocked) {
        const config = SHAPES.find((s) => s.id === shape);
        if (config?.aspectRatio) {
          setStickerHeight(w / config.aspectRatio);
        } else {
          setStickerHeight(w);
        }
      }
    },
    [aspectLocked, shape]
  );

  const handleHeightChange = useCallback(
    (val: number) => {
      const h = Math.max(0.5, Math.min(10, val));
      setStickerHeight(h);
      if (aspectLocked) {
        const config = SHAPES.find((s) => s.id === shape);
        if (config?.aspectRatio) {
          setStickerWidth(h * config.aspectRatio);
        } else {
          setStickerWidth(h);
        }
      }
    },
    [aspectLocked, shape]
  );

  // ── Initialize slots when layout changes ───────────────────────
  useEffect(() => {
    setSelectedImages((prev) => {
      const newArr = Array(layout.total).fill(null) as (GalleryImage | null)[];
      for (let i = 0; i < Math.min(prev.length, layout.total); i++) {
        newArr[i] = prev[i];
      }
      return newArr;
    });
  }, [layout.total]);

  // ── Get image for a slot ───────────────────────────────────────
  const getImageForSlot = useCallback(
    (index: number): GalleryImage | null => {
      if (fillMode) return fillImage;
      return selectedImages[index] ?? null;
    },
    [fillMode, fillImage, selectedImages]
  );

  // ── Get zoom/pan for a slot ───────────────────────────────────
  const getZoomPan = useCallback(
    (index: number) => {
      if (fillMode) {
        return { zoom: fillZoom, panX: fillPanX, panY: fillPanY };
      }
      return {
        zoom: slotZooms[index] ?? 1,
        panX: slotPanXs[index] ?? 0,
        panY: slotPanYs[index] ?? 0,
      };
    },
    [fillMode, fillZoom, fillPanX, fillPanY, slotZooms, slotPanXs, slotPanYs]
  );

  // ── Gallery picker handlers ────────────────────────────────────
  const openGalleryPicker = useCallback(
    (slotIndex?: number) => {
      if (fillMode) {
        setPickingSlotIndex(-1); // -1 = fill mode
      } else {
        setPickingSlotIndex(slotIndex ?? 0);
      }
      setShowGalleryPicker(true);
    },
    [fillMode]
  );

  const selectGalleryImage = useCallback(
    (img: GalleryImage) => {
      if (pickingSlotIndex === -1) {
        // Fill mode
        setFillImage(img);
      } else if (pickingSlotIndex !== null) {
        setSelectedImages((prev) => {
          const newArr = [...prev];
          newArr[pickingSlotIndex] = img;
          return newArr;
        });
      }
      setShowGalleryPicker(false);
      setPickingSlotIndex(null);
    },
    [pickingSlotIndex]
  );

  // ── Render sticker layout to canvas ────────────────────────────
  const renderLayout = useCallback(
    async (ctx: CanvasRenderingContext2D, ppi: number) => {
      const pxW = PAGE_WIDTH * ppi;
      const pxH = PAGE_HEIGHT * ppi;

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pxW, pxH);

      const stickerPxW = stickerWidth * ppi;
      const stickerPxH = stickerHeight * ppi;
      const gutterPx = gutter * ppi;
      const marginPx = MARGIN * ppi;

      const { cols, rows } = layout;
      const totalGridW = cols * stickerPxW + (cols - 1) * gutterPx;
      const totalGridH = rows * stickerPxH + (rows - 1) * gutterPx;
      const offsetX = marginPx + (PAGE_WIDTH * ppi - 2 * marginPx - totalGridW) / 2;
      const offsetY = marginPx + (PAGE_HEIGHT * ppi - 2 * marginPx - totalGridH) / 2;

      // Load images using persistent cache
      const urlsToLoad = new Set<string>();
      for (let i = 0; i < layout.total; i++) {
        const img = getImageForSlot(i);
        if (img && !imageCacheRef.current.has(img.url)) {
          urlsToLoad.add(img.url);
        }
      }

      if (urlsToLoad.size > 0) {
        setIsLoadingImages(true);
        const urlArray = Array.from(urlsToLoad);
        for (let u = 0; u < urlArray.length; u++) {
          try {
            await loadImageCached(urlArray[u]);
          } catch (e) {
            console.error(`Failed to load image:`, e);
          }
        }
        setIsLoadingImages(false);
      }

      // Draw stickers
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          const cx = offsetX + col * (stickerPxW + gutterPx) + stickerPxW / 2;
          const cy = offsetY + row * (stickerPxH + gutterPx) + stickerPxH / 2;

          const slotImg = getImageForSlot(idx);
          if (slotImg && imageCacheRef.current.has(slotImg.url)) {
            const htmlImg = imageCacheRef.current.get(slotImg.url)!;
            const zp = getZoomPan(idx);
            drawImageInShape(ctx, htmlImg, shape, cx, cy, stickerPxW, stickerPxH, zp.zoom, zp.panX, zp.panY);
          } else {
            // Empty slot placeholder
            ctx.save();
            clipShape(ctx, shape, cx, cy, stickerPxW, stickerPxH);
            ctx.fillStyle = "#f3f4f6";
            ctx.fillRect(cx - stickerPxW / 2, cy - stickerPxH / 2, stickerPxW, stickerPxH);
            ctx.restore();
          }

          // Cut guide outlines
          if (showCutGuides) {
            drawShapeOutline(
              ctx,
              shape,
              cx,
              cy,
              stickerPxW,
              stickerPxH,
              Math.max(0.5, 0.75 * (ppi / 96)),
              "#999999",
              true
            );
          }
        }
      }

      // Page border
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = 1 * (ppi / 96);
      ctx.setLineDash([]);
      ctx.strokeRect(0, 0, pxW, pxH);
    },
    [shape, stickerWidth, stickerHeight, gutter, layout, showCutGuides, getImageForSlot, getZoomPan, loadImageCached]
  );

  // ── Generate preview ───────────────────────────────────────────
  // Explicitly depend on all zoom/pan state to ensure canvas re-renders
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const previewPPI = 96;
    canvas.width = PAGE_WIDTH * previewPPI;
    canvas.height = PAGE_HEIGHT * previewPPI;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let cancelled = false;
    (async () => {
      await renderLayout(ctx, previewPPI);
      // If cancelled, redraw is already queued
    })();
    return () => { cancelled = true; };
  }, [
    renderLayout,
    // Explicit zoom/pan deps to guarantee re-render even if memoization breaks
    fillZoom, fillPanX, fillPanY,
    slotZooms, slotPanXs, slotPanYs,
    fillImage, selectedImages,
    shape, stickerWidth, stickerHeight, gutter, showCutGuides, fillMode,
  ]);

  // ── Download PNG ───────────────────────────────────────────────
  const downloadPNG = useCallback(async () => {
    setIsGenerating(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = PAGE_WIDTH * DPI;
      canvas.height = PAGE_HEIGHT * DPI;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      await renderLayout(ctx, DPI);

      const link = document.createElement("a");
      link.download = `stickers-${shape}-${stickerWidth}x${stickerHeight}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Sticker sheet downloaded at 300 DPI!");
    } catch (error) {
      console.error("Error downloading sticker sheet:", error);
      toast.error("Failed to download sticker sheet");
    } finally {
      setIsGenerating(false);
    }
  }, [renderLayout, shape, stickerWidth, stickerHeight]);

  // ── Download PDF ───────────────────────────────────────────────
  const downloadPDF = useCallback(async () => {
    setIsGenerating(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = PAGE_WIDTH * DPI;
      canvas.height = PAGE_HEIGHT * DPI;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      await renderLayout(ctx, DPI);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: "letter",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(imgData, "JPEG", 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
      pdf.save(`stickers-${shape}-${stickerWidth}x${stickerHeight}-${Date.now()}.pdf`);
      toast.success("Sticker sheet PDF exported!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsGenerating(false);
    }
  }, [renderLayout, shape, stickerWidth, stickerHeight]);

  // ── Drag-to-pan on preview canvas ─────────────────────────────
  const getSlotAtPoint = useCallback(
    (clientX: number, clientY: number): number | null => {
      const canvas = previewCanvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = (PAGE_WIDTH * 96) / rect.width;
      const scaleY = (PAGE_HEIGHT * 96) / rect.height;
      const canvasX = (clientX - rect.left) * scaleX;
      const canvasY = (clientY - rect.top) * scaleY;

      const ppi = 96;
      const stickerPxW = stickerWidth * ppi;
      const stickerPxH = stickerHeight * ppi;
      const gutterPx = gutter * ppi;
      const marginPx = MARGIN * ppi;
      const { cols, rows } = layout;
      const totalGridW = cols * stickerPxW + (cols - 1) * gutterPx;
      const totalGridH = rows * stickerPxH + (rows - 1) * gutterPx;
      const offsetX = marginPx + (PAGE_WIDTH * ppi - 2 * marginPx - totalGridW) / 2;
      const offsetY = marginPx + (PAGE_HEIGHT * ppi - 2 * marginPx - totalGridH) / 2;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          const cx = offsetX + col * (stickerPxW + gutterPx) + stickerPxW / 2;
          const cy = offsetY + row * (stickerPxH + gutterPx) + stickerPxH / 2;
          if (
            canvasX >= cx - stickerPxW / 2 &&
            canvasX <= cx + stickerPxW / 2 &&
            canvasY >= cy - stickerPxH / 2 &&
            canvasY <= cy + stickerPxH / 2
          ) {
            // Check if there's an image in this slot
            if (getImageForSlot(idx)) return idx;
          }
        }
      }
      return null;
    },
    [stickerWidth, stickerHeight, gutter, layout, getImageForSlot]
  );

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const slot = getSlotAtPoint(e.clientX, e.clientY);
      if (slot === null) return;

      // Only allow drag when zoomed in
      const zp = getZoomPan(slot);
      if (zp.zoom <= 1) return;

      setIsDragging(true);
      setDragSlot(slot);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startPanX: zp.panX,
        startPanY: zp.panY,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [getSlotAtPoint, getZoomPan]
  );

  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDragging || dragSlot === null || !dragStartRef.current) return;

      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();

      // Map pixel delta to pan delta (-1 to 1 range)
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const sensitivity = 3; // Higher = more responsive drag
      const newPanX = Math.max(-1, Math.min(1, dragStartRef.current.startPanX + (dx / rect.width) * sensitivity));
      const newPanY = Math.max(-1, Math.min(1, dragStartRef.current.startPanY + (dy / rect.height) * sensitivity));

      if (fillMode) {
        setFillPanX(newPanX);
        setFillPanY(newPanY);
      } else {
        setSlotPanXs(prev => ({ ...prev, [dragSlot]: newPanX }));
        setSlotPanYs(prev => ({ ...prev, [dragSlot]: newPanY }));
      }
    },
    [isDragging, dragSlot, fillMode]
  );

  const handleCanvasPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (isDragging) {
        setIsDragging(false);
        dragStartRef.current = null;
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    },
    [isDragging]
  );

  // ── Editing mode handlers ──────────────────────────────────────
  const startEditing = useCallback((slotIndex: number) => {
    const zp = getZoomPan(slotIndex);
    setEditingSlot(slotIndex);
    setEditZoom(zp.zoom);
    setEditPanX(zp.panX);
    setEditPanY(zp.panY);
  }, [getZoomPan]);

  const saveEditing = useCallback(() => {
    if (editingSlot === null) return;
    if (fillMode) {
      setFillZoom(editZoom);
      setFillPanX(editPanX);
      setFillPanY(editPanY);
    } else {
      setSlotZooms(prev => ({ ...prev, [editingSlot]: editZoom }));
      setSlotPanXs(prev => ({ ...prev, [editingSlot]: editPanX }));
      setSlotPanYs(prev => ({ ...prev, [editingSlot]: editPanY }));
    }
    setEditingSlot(null);
    toast.success("Zoom & position saved!");
  }, [editingSlot, editZoom, editPanX, editPanY, fillMode]);

  const cancelEditing = useCallback(() => {
    setEditingSlot(null);
  }, []);

  // ── Draw the live editing preview canvas ───────────────────────
  useEffect(() => {
    if (editingSlot === null) return;
    const canvas = editPreviewCanvasRef.current;
    if (!canvas) return;
    const size = 200; // preview size in pixels
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = getImageForSlot(editingSlot);
    if (!img) return;

    const cachedImg = imageCacheRef.current.get(img.url);
    if (!cachedImg) {
      // Load image first, then draw
      loadImageCached(img.url).then((loaded) => {
        ctx.clearRect(0, 0, size, size);
        drawImageInShape(ctx, loaded, shape, size / 2, size / 2, size, size, editZoom, editPanX, editPanY);
        drawShapeOutline(ctx, shape, size / 2, size / 2, size, size, 1.5, "#a855f7", false);
      }).catch(() => {});
      return;
    }

    ctx.clearRect(0, 0, size, size);
    drawImageInShape(ctx, cachedImg, shape, size / 2, size / 2, size, size, editZoom, editPanX, editPanY);
    drawShapeOutline(ctx, shape, size / 2, size / 2, size, size, 1.5, "#a855f7", false);
  }, [editingSlot, editZoom, editPanX, editPanY, shape, getImageForSlot, loadImageCached]);

  // ── Has any images selected ────────────────────────────────────
  const hasImages = fillMode
    ? fillImage !== null
    : selectedImages.some((img) => img !== null);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Scissors className="w-7 h-7 text-purple-400" />
            Create/Print Stickers
          </h1>
          <p className="text-muted-foreground mt-1">
            Design custom sticker sheets from your gallery images. Choose shapes,
            sizes, and layout — then export for printing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── LEFT: Options Panel ─────────────────────────────── */}
          <div className="lg:col-span-1 space-y-4">
            {/* Shape Selection */}
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Circle className="w-4 h-4 text-purple-400" />
                  Sticker Shape
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {SHAPES.map((s) => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleShapeChange(s.id)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all text-xs",
                          shape === s.id
                            ? "border-purple-500 bg-purple-500/10 text-purple-400"
                            : "border-border/50 hover:border-purple-500/50 text-muted-foreground"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Size Configuration */}
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <RectangleHorizontal className="w-4 h-4 text-purple-400" />
                  Sticker Size
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick presets */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Quick Presets
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {SIZE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          setStickerWidth(preset.width);
                          setStickerHeight(preset.height);
                        }}
                        className={cn(
                          "px-3 py-1 rounded-md text-xs border transition-all",
                          stickerWidth === preset.width &&
                            stickerHeight === preset.height
                            ? "border-purple-500 bg-purple-500/10 text-purple-400"
                            : "border-border/50 hover:border-purple-500/50 text-muted-foreground"
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom size */}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">
                      Width (in)
                    </Label>
                    <Input
                      type="number"
                      step={0.25}
                      min={0.5}
                      max={8}
                      value={stickerWidth}
                      onChange={(e) =>
                        handleWidthChange(parseFloat(e.target.value) || 1)
                      }
                      className="mt-1"
                    />
                  </div>
                  <button
                    onClick={() => setAspectLocked(!aspectLocked)}
                    className={cn(
                      "p-2 rounded-md border transition-all mb-0.5",
                      aspectLocked
                        ? "border-purple-500 bg-purple-500/10 text-purple-400"
                        : "border-border/50 text-muted-foreground"
                    )}
                    title={
                      aspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio"
                    }
                  >
                    {aspectLocked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Unlock className="w-4 h-4" />
                    )}
                  </button>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">
                      Height (in)
                    </Label>
                    <Input
                      type="number"
                      step={0.25}
                      min={0.5}
                      max={10}
                      value={stickerHeight}
                      onChange={(e) =>
                        handleHeightChange(parseFloat(e.target.value) || 1)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Spacing */}
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Spacing Between Stickers (in)
                  </Label>
                  <Input
                    type="number"
                    step={0.05}
                    min={0}
                    max={1}
                    value={gutter}
                    onChange={(e) =>
                      setGutter(
                        Math.max(0, Math.min(1, parseFloat(e.target.value) || 0))
                      )
                    }
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Options */}
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-purple-400" />
                  Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Cut Guides</Label>
                  <Switch
                    checked={showCutGuides}
                    onCheckedChange={setShowCutGuides}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">{fillMode ? "Single Card" : "Multiple Cards"}</Label>
                    <p className="text-xs text-muted-foreground">
                      {fillMode
                        ? "Single Card (several of the same card to one page)"
                        : "Multiple Cards (several varieties of cards on one page)"}
                    </p>
                  </div>
                  <Switch checked={fillMode} onCheckedChange={setFillMode} />
                </div>
              </CardContent>
            </Card>

            {/* Image Selection */}
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ImagePlus className="w-4 h-4 text-purple-400" />
                  {fillMode ? "Select Image" : "Select Images"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fillMode ? (
                  <div className="space-y-3">
                    {fillImage ? (
                      <>
                        <div className="relative group">
                          <img
                            src={fillImage.url}
                            alt="Selected"
                            className="w-full h-32 object-cover rounded-lg border border-border/50"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openGalleryPicker()}
                              className="text-xs"
                            >
                              Change
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setFillImage(null)}
                              className="text-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                            Fills all {layout.total} slots
                          </div>
                        </div>

                        {/* Zoom & Position - Click to Edit */}
                        {editingSlot !== null ? (
                          <div className="space-y-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-medium text-purple-300">
                                <Eye className="w-3.5 h-3.5" />
                                Editing Zoom & Position
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                onClick={cancelEditing}
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>

                            {/* Live Preview Canvas */}
                            <div className="flex justify-center">
                              <canvas
                                ref={editPreviewCanvasRef}
                                className="rounded-lg border border-purple-500/30 bg-white"
                                style={{ width: 160, height: 160 }}
                              />
                            </div>

                            {/* Zoom Slider */}
                            <div className="flex items-center gap-2">
                              <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
                              <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.05"
                                value={editZoom}
                                onChange={(e) => setEditZoom(parseFloat(e.target.value))}
                                className="flex-1 h-1.5 accent-purple-500"
                              />
                              <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground w-8 text-right">{Math.round(editZoom * 100)}%</span>
                            </div>

                            {/* Pan Sliders */}
                            {editZoom > 1 && (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-muted-foreground w-4">X</span>
                                  <input
                                    type="range"
                                    min="-1"
                                    max="1"
                                    step="0.02"
                                    value={editPanX}
                                    onChange={(e) => setEditPanX(parseFloat(e.target.value))}
                                    className="flex-1 h-1.5 accent-purple-500"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-muted-foreground w-4">Y</span>
                                  <input
                                    type="range"
                                    min="-1"
                                    max="1"
                                    step="0.02"
                                    value={editPanY}
                                    onChange={(e) => setEditPanY(parseFloat(e.target.value))}
                                    className="flex-1 h-1.5 accent-purple-500"
                                  />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full text-xs h-7"
                                  onClick={() => { setEditZoom(1); setEditPanX(0); setEditPanY(0); }}
                                >
                                  <RotateCcw className="w-3 h-3 mr-1" /> Reset Position
                                </Button>
                              </>
                            )}

                            {/* Save / Cancel Buttons */}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1 text-xs h-8 bg-purple-600 hover:bg-purple-700"
                                onClick={saveEditing}
                              >
                                <Save className="w-3 h-3 mr-1" /> Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs h-8"
                                onClick={cancelEditing}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs h-8 border-purple-500/30 hover:border-purple-500/50"
                            onClick={() => startEditing(0)}
                          >
                            <ZoomIn className="w-3 h-3 mr-1" /> Zoom & Position
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full h-24 border-dashed"
                        onClick={() => openGalleryPicker()}
                      >
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <ImagePlus className="w-6 h-6" />
                          <span className="text-xs">
                            Choose from Gallery
                          </span>
                        </div>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {selectedImages.slice(0, layout.total).map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (img) {
                              // Image assigned — open editing mode
                              startEditing(idx);
                            } else {
                              // Empty slot — open gallery picker
                              setPickingSlotIndex(idx);
                              setShowGalleryPicker(true);
                            }
                          }}
                          className={cn(
                            "aspect-square rounded-lg border transition-all overflow-hidden relative group",
                            editingSlot === idx
                              ? "border-purple-500 ring-2 ring-purple-500/50"
                              : img
                                ? "border-purple-500/50 hover:border-purple-400"
                                : "border-dashed border-border/50 hover:border-purple-500/50"
                          )}
                        >
                          {img ? (
                            <>
                              <img
                                src={img.url}
                                alt={`Slot ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <span className="text-[10px]">{idx + 1}</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setSelectedImages(Array(layout.total).fill(null))}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Clear All
                    </Button>

                    {/* Per-slot Zoom Controls */}
                    {selectedImages.some(img => img !== null) && (
                      <>
                        {editingSlot !== null ? (
                          <div className="space-y-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-medium text-purple-300">
                                <Eye className="w-3.5 h-3.5" />
                                Editing Slot #{editingSlot + 1}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                onClick={cancelEditing}
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>

                            {/* Live Preview Canvas */}
                            <div className="flex justify-center">
                              <canvas
                                ref={editPreviewCanvasRef}
                                className="rounded-lg border border-purple-500/30 bg-white"
                                style={{ width: 160, height: 160 }}
                              />
                            </div>

                            {/* Zoom Slider */}
                            <div className="flex items-center gap-2">
                              <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
                              <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.05"
                                value={editZoom}
                                onChange={(e) => setEditZoom(parseFloat(e.target.value))}
                                className="flex-1 h-1.5 accent-purple-500"
                              />
                              <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground w-8 text-right">{Math.round(editZoom * 100)}%</span>
                            </div>

                            {/* Pan Sliders */}
                            {editZoom > 1 && (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-muted-foreground w-4">X</span>
                                  <input
                                    type="range"
                                    min="-1"
                                    max="1"
                                    step="0.02"
                                    value={editPanX}
                                    onChange={(e) => setEditPanX(parseFloat(e.target.value))}
                                    className="flex-1 h-1.5 accent-purple-500"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-muted-foreground w-4">Y</span>
                                  <input
                                    type="range"
                                    min="-1"
                                    max="1"
                                    step="0.02"
                                    value={editPanY}
                                    onChange={(e) => setEditPanY(parseFloat(e.target.value))}
                                    className="flex-1 h-1.5 accent-purple-500"
                                  />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full text-xs h-7"
                                  onClick={() => { setEditZoom(1); setEditPanX(0); setEditPanY(0); }}
                                >
                                  <RotateCcw className="w-3 h-3 mr-1" /> Reset Position
                                </Button>
                              </>
                            )}

                            {/* Save / Cancel Buttons */}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1 text-xs h-8 bg-purple-600 hover:bg-purple-700"
                                onClick={saveEditing}
                              >
                                <Save className="w-3 h-3 mr-1" /> Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs h-8"
                                onClick={cancelEditing}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border/30">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                              <ZoomIn className="w-3.5 h-3.5" />
                              Zoom & Position (click a slot to edit)
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {selectedImages.slice(0, layout.total).map((img, idx) => (
                                img && (
                                  <Button
                                    key={idx}
                                    size="sm"
                                    variant="outline"
                                    className="text-[10px] h-6 px-2 border-purple-500/30 hover:border-purple-500/50"
                                    onClick={() => startEditing(idx)}
                                  >
                                    #{idx + 1}
                                  </Button>
                                )
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Layout Info */}
            <Card className="border-purple-500/30 bg-purple-500/5">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <div className="text-xs space-y-1">
                    <p className="font-medium text-purple-300">Layout Summary</p>
                    <p className="text-muted-foreground">
                      <strong>{layout.total}</strong> stickers per page ({layout.cols} × {layout.rows})
                    </p>
                    <p className="text-muted-foreground">
                      Each sticker: {stickerWidth}" × {stickerHeight}" {shape}
                    </p>
                    <p className="text-muted-foreground">
                      Page: {PAGE_WIDTH}" × {PAGE_HEIGHT}" with {MARGIN}" margins
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT: Preview & Export ─────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Preview */}
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  Print Preview — {layout.total} stickers on page
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center bg-muted/30 rounded-lg p-4 relative">
                  <canvas
                    ref={previewCanvasRef}
                    className="border border-border/50 rounded shadow-lg"
                    style={{
                      width: "100%",
                      maxWidth: 550,
                      aspectRatio: `${PAGE_WIDTH} / ${PAGE_HEIGHT}`,
                      cursor: isDragging ? "grabbing" : hasImages ? "grab" : "default",
                      touchAction: "none",
                    }}
                    onPointerDown={handleCanvasPointerDown}
                    onPointerMove={handleCanvasPointerMove}
                    onPointerUp={handleCanvasPointerUp}
                    onPointerCancel={handleCanvasPointerUp}
                  />
                  {isLoadingImages && (
                    <div className="absolute inset-4 flex items-center justify-center bg-black/40 rounded backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                        <span className="text-sm text-white font-medium">Loading images...</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Export Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                className="h-12"
                onClick={downloadPNG}
                disabled={!hasImages || isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download PNG (300 DPI)
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={downloadPDF}
                disabled={!hasImages || isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Gallery Picker Modal ──────────────────────────────────── */}
      <Dialog open={showGalleryPicker} onOpenChange={setShowGalleryPicker}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <VisuallyHidden.Root>
            <DialogTitle>Select Image from Gallery</DialogTitle>
          </VisuallyHidden.Root>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">
              {fillMode
                ? "Select Image for All Stickers"
                : `Select Image for Slot ${(pickingSlotIndex ?? 0) + 1}`}
            </h3>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by prompt or model..."
              value={gallerySearch}
              onChange={(e) => setGallerySearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Image Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {filteredGallery.map((img) => (
                <button
                  key={img.id}
                  onClick={() => selectGalleryImage(img)}
                  className="aspect-square rounded-lg overflow-hidden border border-border/50 hover:border-purple-500 transition-all hover:scale-[1.02] group relative"
                >
                  <img
                    src={img.url}
                    alt={img.prompt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <Check className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
            {filteredGallery.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <ImagePlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No images found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
