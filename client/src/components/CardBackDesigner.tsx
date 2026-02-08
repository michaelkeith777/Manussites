import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Paintbrush,
  Type,
  Square,
  Sparkles,
  Download,
  RotateCcw,
  Check,
  X,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CardBackDesign {
  // Background
  bgType: "solid" | "gradient" | "two-tone";
  bgColor1: string;
  bgColor2: string;
  gradientAngle: number;

  // Pattern
  pattern: PatternType;
  patternColor: string;
  patternOpacity: number;
  patternScale: number;

  // Text
  texts: TextElement[];

  // Border
  borderStyle: BorderStyle;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  borderInset: number;

  // Inner decoration
  innerBorder: boolean;
  innerBorderColor: string;
  innerBorderWidth: number;
  innerBorderInset: number;
}

interface TextElement {
  id: string;
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  rotation: number;
  bold: boolean;
  italic: boolean;
  letterSpacing: number;
}

type PatternType =
  | "none"
  | "stripes"
  | "dots"
  | "diamonds"
  | "crosshatch"
  | "chevrons"
  | "circles"
  | "stars"
  | "waves"
  | "grid"
  | "hexagons";

type BorderStyle = "none" | "solid" | "double" | "dashed" | "ornate" | "rounded";

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_DESIGN: CardBackDesign = {
  bgType: "gradient",
  bgColor1: "#4c1d95",
  bgColor2: "#7c3aed",
  gradientAngle: 135,
  pattern: "diamonds",
  patternColor: "#ffffff",
  patternOpacity: 0.12,
  patternScale: 1,
  texts: [
    {
      id: "title",
      content: "CARDKING1971",
      fontFamily: "serif",
      fontSize: 28,
      color: "#fbbf24",
      x: 50,
      y: 42,
      rotation: 0,
      bold: true,
      italic: false,
      letterSpacing: 6,
    },
    {
      id: "subtitle",
      content: "CARDS",
      fontFamily: "serif",
      fontSize: 16,
      color: "#fbbf24",
      x: 50,
      y: 55,
      rotation: 0,
      bold: false,
      italic: false,
      letterSpacing: 10,
    },
  ],
  borderStyle: "double",
  borderColor: "#fbbf24",
  borderWidth: 3,
  borderRadius: 12,
  borderInset: 8,
  innerBorder: true,
  innerBorderColor: "#fbbf2480",
  innerBorderWidth: 1,
  innerBorderInset: 20,
};

const PRESET_DESIGNS: { name: string; design: Partial<CardBackDesign> }[] = [
  {
    name: "Royal Purple",
    design: {
      bgType: "gradient",
      bgColor1: "#4c1d95",
      bgColor2: "#7c3aed",
      gradientAngle: 135,
      pattern: "diamonds",
      patternColor: "#ffffff",
      patternOpacity: 0.12,
      borderStyle: "double",
      borderColor: "#fbbf24",
    },
  },
  {
    name: "Classic Red",
    design: {
      bgType: "gradient",
      bgColor1: "#991b1b",
      bgColor2: "#dc2626",
      gradientAngle: 180,
      pattern: "crosshatch",
      patternColor: "#ffffff",
      patternOpacity: 0.08,
      borderStyle: "ornate",
      borderColor: "#fef3c7",
    },
  },
  {
    name: "Ocean Blue",
    design: {
      bgType: "gradient",
      bgColor1: "#1e3a5f",
      bgColor2: "#2563eb",
      gradientAngle: 160,
      pattern: "waves",
      patternColor: "#ffffff",
      patternOpacity: 0.1,
      borderStyle: "solid",
      borderColor: "#93c5fd",
    },
  },
  {
    name: "Forest Green",
    design: {
      bgType: "gradient",
      bgColor1: "#14532d",
      bgColor2: "#16a34a",
      gradientAngle: 150,
      pattern: "dots",
      patternColor: "#ffffff",
      patternOpacity: 0.1,
      borderStyle: "double",
      borderColor: "#86efac",
    },
  },
  {
    name: "Midnight Gold",
    design: {
      bgType: "gradient",
      bgColor1: "#1a1a2e",
      bgColor2: "#16213e",
      gradientAngle: 180,
      pattern: "stars",
      patternColor: "#fbbf24",
      patternOpacity: 0.15,
      borderStyle: "ornate",
      borderColor: "#fbbf24",
    },
  },
  {
    name: "Vintage Sepia",
    design: {
      bgType: "gradient",
      bgColor1: "#78350f",
      bgColor2: "#a16207",
      gradientAngle: 170,
      pattern: "stripes",
      patternColor: "#fef3c7",
      patternOpacity: 0.08,
      borderStyle: "double",
      borderColor: "#fef3c7",
    },
  },
];

const FONT_OPTIONS = [
  { label: "Serif", value: "serif" },
  { label: "Sans-Serif", value: "sans-serif" },
  { label: "Monospace", value: "monospace" },
  { label: "Cursive", value: "cursive" },
  { label: "Fantasy", value: "fantasy" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Impact", value: "Impact, sans-serif" },
  { label: "Courier", value: "'Courier New', monospace" },
];

const PATTERN_OPTIONS: { label: string; value: PatternType }[] = [
  { label: "None", value: "none" },
  { label: "Stripes", value: "stripes" },
  { label: "Dots", value: "dots" },
  { label: "Diamonds", value: "diamonds" },
  { label: "Crosshatch", value: "crosshatch" },
  { label: "Chevrons", value: "chevrons" },
  { label: "Circles", value: "circles" },
  { label: "Stars", value: "stars" },
  { label: "Waves", value: "waves" },
  { label: "Grid", value: "grid" },
  { label: "Hexagons", value: "hexagons" },
];

// ─── Pattern Drawing ─────────────────────────────────────────────────────────

function drawPattern(
  ctx: CanvasRenderingContext2D,
  pattern: PatternType,
  w: number,
  h: number,
  color: string,
  opacity: number,
  scale: number
) {
  if (pattern === "none") return;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  const s = 20 * scale; // base spacing

  switch (pattern) {
    case "stripes":
      ctx.lineWidth = 2 * scale;
      for (let i = -h; i < w + h; i += s) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + h, h);
        ctx.stroke();
      }
      break;

    case "dots":
      for (let x = s / 2; x < w; x += s) {
        for (let y = s / 2; y < h; y += s) {
          ctx.beginPath();
          ctx.arc(x, y, 2 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;

    case "diamonds": {
      const ds = s * 1.5;
      ctx.lineWidth = 1.5 * scale;
      for (let x = 0; x < w + ds; x += ds) {
        for (let y = 0; y < h + ds; y += ds) {
          const ox = (Math.floor(y / ds) % 2) * (ds / 2);
          ctx.beginPath();
          ctx.moveTo(x + ox, y - ds / 3);
          ctx.lineTo(x + ox + ds / 3, y);
          ctx.lineTo(x + ox, y + ds / 3);
          ctx.lineTo(x + ox - ds / 3, y);
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;
    }

    case "crosshatch":
      ctx.lineWidth = 1 * scale;
      for (let i = -h; i < w + h; i += s) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + h, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(i + h, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      break;

    case "chevrons": {
      const cs = s * 1.2;
      ctx.lineWidth = 2 * scale;
      for (let y = 0; y < h + cs; y += cs) {
        for (let x = -cs; x < w + cs; x += cs * 2) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + cs, y - cs / 2);
          ctx.lineTo(x + cs * 2, y);
          ctx.stroke();
        }
      }
      break;
    }

    case "circles":
      ctx.lineWidth = 1 * scale;
      for (let x = s; x < w; x += s * 2) {
        for (let y = s; y < h; y += s * 2) {
          ctx.beginPath();
          ctx.arc(x, y, s * 0.7, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      break;

    case "stars": {
      const ss = s * 1.5;
      for (let x = ss / 2; x < w; x += ss) {
        for (let y = ss / 2; y < h; y += ss) {
          drawStar(ctx, x, y, 5, ss * 0.2, ss * 0.1);
        }
      }
      break;
    }

    case "waves":
      ctx.lineWidth = 1.5 * scale;
      for (let y = s; y < h + s; y += s) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 2) {
          ctx.lineTo(x, y + Math.sin((x / (s * 2)) * Math.PI * 2) * (s / 3));
        }
        ctx.stroke();
      }
      break;

    case "grid":
      ctx.lineWidth = 1 * scale;
      for (let x = s; x < w; x += s) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = s; y < h; y += s) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      break;

    case "hexagons": {
      const hs = s * 1.2;
      const hh = hs * Math.sqrt(3) / 2;
      ctx.lineWidth = 1 * scale;
      for (let row = 0; row * hh < h + hh; row++) {
        for (let col = -1; col * hs * 1.5 < w + hs; col++) {
          const cx = col * hs * 1.5 + (row % 2 ? hs * 0.75 : 0);
          const cy = row * hh;
          drawHexagon(ctx, cx, cy, hs / 2);
        }
      }
      break;
    }
  }
  ctx.restore();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerR: number, innerR: number) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerR);
  ctx.closePath();
  ctx.fill();
}

function drawHexagon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

// ─── Border Drawing ──────────────────────────────────────────────────────────

function drawBorder(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  style: BorderStyle,
  color: string,
  lineWidth: number,
  radius: number,
  inset: number
) {
  if (style === "none") return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  const x = inset;
  const y = inset;
  const bw = w - inset * 2;
  const bh = h - inset * 2;
  const r = Math.min(radius, bw / 2, bh / 2);

  switch (style) {
    case "solid":
      ctx.setLineDash([]);
      roundRect(ctx, x, y, bw, bh, r);
      ctx.stroke();
      break;

    case "double":
      ctx.setLineDash([]);
      roundRect(ctx, x, y, bw, bh, r);
      ctx.stroke();
      const gap = lineWidth * 2.5;
      roundRect(ctx, x + gap, y + gap, bw - gap * 2, bh - gap * 2, Math.max(0, r - gap));
      ctx.stroke();
      break;

    case "dashed":
      ctx.setLineDash([lineWidth * 4, lineWidth * 3]);
      roundRect(ctx, x, y, bw, bh, r);
      ctx.stroke();
      ctx.setLineDash([]);
      break;

    case "ornate": {
      // Outer border
      ctx.setLineDash([]);
      roundRect(ctx, x, y, bw, bh, r);
      ctx.stroke();
      // Inner border
      const g2 = lineWidth * 3;
      roundRect(ctx, x + g2, y + g2, bw - g2 * 2, bh - g2 * 2, Math.max(0, r - g2));
      ctx.stroke();
      // Corner decorations
      const cornerSize = Math.min(bw, bh) * 0.08;
      const corners = [
        [x + g2 + cornerSize, y + g2 + cornerSize],
        [x + bw - g2 - cornerSize, y + g2 + cornerSize],
        [x + g2 + cornerSize, y + bh - g2 - cornerSize],
        [x + bw - g2 - cornerSize, y + bh - g2 - cornerSize],
      ];
      corners.forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, cornerSize * 0.4, 0, Math.PI * 2);
        ctx.stroke();
        // Small diamond
        ctx.beginPath();
        ctx.moveTo(cx, cy - cornerSize * 0.25);
        ctx.lineTo(cx + cornerSize * 0.25, cy);
        ctx.lineTo(cx, cy + cornerSize * 0.25);
        ctx.lineTo(cx - cornerSize * 0.25, cy);
        ctx.closePath();
        ctx.stroke();
      });
      break;
    }

    case "rounded":
      ctx.setLineDash([]);
      roundRect(ctx, x, y, bw, bh, Math.min(bw, bh) * 0.08);
      ctx.stroke();
      break;
  }

  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface CardBackDesignerProps {
  onApply: (imageDataUrl: string) => void;
  onCancel: () => void;
  cardWidth?: number; // in inches
  cardHeight?: number; // in inches
}

export default function CardBackDesigner({
  onApply,
  onCancel,
  cardWidth = 2.5,
  cardHeight = 3.5,
}: CardBackDesignerProps) {
  const [design, setDesign] = useState<CardBackDesign>({ ...DEFAULT_DESIGN });
  const [selectedTextId, setSelectedTextId] = useState<string | null>("title");
  const [activeTab, setActiveTab] = useState("background");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const PREVIEW_SCALE = 3; // multiplier for preview quality
  const canvasW = cardWidth * 96 * PREVIEW_SCALE;
  const canvasH = cardHeight * 96 * PREVIEW_SCALE;

  const updateDesign = (updates: Partial<CardBackDesign>) => {
    setDesign((prev) => ({ ...prev, ...updates }));
  };

  const updateText = (id: string, updates: Partial<TextElement>) => {
    setDesign((prev) => ({
      ...prev,
      texts: prev.texts.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const addText = () => {
    const newText: TextElement = {
      id: `text-${Date.now()}`,
      content: "New Text",
      fontFamily: "sans-serif",
      fontSize: 18,
      color: "#ffffff",
      x: 50,
      y: 70,
      rotation: 0,
      bold: false,
      italic: false,
      letterSpacing: 0,
    };
    setDesign((prev) => ({ ...prev, texts: [...prev.texts, newText] }));
    setSelectedTextId(newText.id);
  };

  const removeText = (id: string) => {
    setDesign((prev) => ({
      ...prev,
      texts: prev.texts.filter((t) => t.id !== id),
    }));
    if (selectedTextId === id) setSelectedTextId(null);
  };

  const applyPreset = (preset: Partial<CardBackDesign>) => {
    setDesign((prev) => ({ ...prev, ...preset }));
  };

  // ─── Canvas Rendering ──────────────────────────────────────────────────────

  const renderDesign = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      // Clear
      ctx.clearRect(0, 0, w, h);

      // Background
      if (design.bgType === "solid") {
        ctx.fillStyle = design.bgColor1;
        ctx.fillRect(0, 0, w, h);
      } else if (design.bgType === "gradient") {
        const angle = (design.gradientAngle * Math.PI) / 180;
        const cx = w / 2;
        const cy = h / 2;
        const len = Math.sqrt(w * w + h * h) / 2;
        const x1 = cx - Math.cos(angle) * len;
        const y1 = cy - Math.sin(angle) * len;
        const x2 = cx + Math.cos(angle) * len;
        const y2 = cy + Math.sin(angle) * len;
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, design.bgColor1);
        grad.addColorStop(1, design.bgColor2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else {
        // two-tone: top half / bottom half
        ctx.fillStyle = design.bgColor1;
        ctx.fillRect(0, 0, w, h / 2);
        ctx.fillStyle = design.bgColor2;
        ctx.fillRect(0, h / 2, w, h / 2);
      }

      // Pattern
      const patternScale = design.patternScale * (w / (cardWidth * 96));
      drawPattern(ctx, design.pattern, w, h, design.patternColor, design.patternOpacity, patternScale);

      // Inner border
      if (design.innerBorder) {
        const innerInset = design.innerBorderInset * (w / (cardWidth * 96));
        drawBorder(ctx, w, h, "solid", design.innerBorderColor, design.innerBorderWidth * (w / (cardWidth * 96)), design.borderRadius * (w / (cardWidth * 96)) * 0.8, innerInset);
      }

      // Outer border
      const borderInset = design.borderInset * (w / (cardWidth * 96));
      const borderWidth = design.borderWidth * (w / (cardWidth * 96));
      const borderRadius = design.borderRadius * (w / (cardWidth * 96));
      drawBorder(ctx, w, h, design.borderStyle, design.borderColor, borderWidth, borderRadius, borderInset);

      // Text elements
      design.texts.forEach((text) => {
        ctx.save();
        const tx = (text.x / 100) * w;
        const ty = (text.y / 100) * h;
        ctx.translate(tx, ty);
        if (text.rotation) ctx.rotate((text.rotation * Math.PI) / 180);

        const scaledFontSize = text.fontSize * (w / (cardWidth * 96));
        const fontStyle = `${text.italic ? "italic " : ""}${text.bold ? "bold " : ""}${scaledFontSize}px ${text.fontFamily}`;
        ctx.font = fontStyle;
        ctx.fillStyle = text.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (text.letterSpacing > 0) {
          // Manual letter spacing
          const chars = text.content.split("");
          const spacing = text.letterSpacing * (w / (cardWidth * 96));
          const totalWidth = chars.reduce((acc, char) => acc + ctx.measureText(char).width + spacing, -spacing);
          let startX = -totalWidth / 2;
          chars.forEach((char) => {
            const charWidth = ctx.measureText(char).width;
            ctx.fillText(char, startX + charWidth / 2, 0);
            startX += charWidth + spacing;
          });
        } else {
          ctx.fillText(text.content, 0, 0);
        }
        ctx.restore();
      });
    },
    [design, cardWidth]
  );

  // Re-render preview whenever design changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderDesign(ctx, canvasW, canvasH);
  }, [renderDesign, canvasW, canvasH]);

  // Export at 300 DPI
  const handleApply = useCallback(() => {
    const exportW = cardWidth * 300;
    const exportH = cardHeight * 300;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = exportW;
    exportCanvas.height = exportH;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;
    renderDesign(ctx, exportW, exportH);
    const dataUrl = exportCanvas.toDataURL("image/png");
    onApply(dataUrl);
  }, [renderDesign, cardWidth, cardHeight, onApply]);

  const selectedText = design.texts.find((t) => t.id === selectedTextId);

  // ─── UI ────────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl max-w-6xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Paintbrush className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Card Back Designer</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={handleApply}>
              <Check className="w-4 h-4 mr-1" /> Apply Design
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Controls */}
          <div className="w-[380px] border-r overflow-y-auto p-4 space-y-4">
            {/* Presets */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Quick Presets</Label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_DESIGNS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset.design)}
                    className="text-xs px-2 py-2 rounded-lg border hover:border-primary transition-colors text-center truncate"
                    style={{
                      background: `linear-gradient(135deg, ${preset.design.bgColor1}, ${preset.design.bgColor2})`,
                      color: "#fff",
                      textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                    }}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="background" className="text-xs">
                  <Paintbrush className="w-3 h-3 mr-1" /> BG
                </TabsTrigger>
                <TabsTrigger value="pattern" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" /> Pattern
                </TabsTrigger>
                <TabsTrigger value="text" className="text-xs">
                  <Type className="w-3 h-3 mr-1" /> Text
                </TabsTrigger>
                <TabsTrigger value="border" className="text-xs">
                  <Square className="w-3 h-3 mr-1" /> Border
                </TabsTrigger>
              </TabsList>

              {/* ─── Background Tab ─── */}
              <TabsContent value="background" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Background Type</Label>
                  <div className="flex gap-2">
                    {(["solid", "gradient", "two-tone"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => updateDesign({ bgType: type })}
                        className={cn(
                          "flex-1 py-1.5 px-2 rounded-md text-xs font-medium border transition-all",
                          design.bgType === type
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {type === "two-tone" ? "Two-Tone" : type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Color 1</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={design.bgColor1}
                        onChange={(e) => updateDesign({ bgColor1: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border"
                      />
                      <Input
                        value={design.bgColor1}
                        onChange={(e) => updateDesign({ bgColor1: e.target.value })}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                  {design.bgType !== "solid" && (
                    <div className="space-y-1">
                      <Label className="text-xs">Color 2</Label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={design.bgColor2}
                          onChange={(e) => updateDesign({ bgColor2: e.target.value })}
                          className="w-8 h-8 rounded cursor-pointer border"
                        />
                        <Input
                          value={design.bgColor2}
                          onChange={(e) => updateDesign({ bgColor2: e.target.value })}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {design.bgType === "gradient" && (
                  <div className="space-y-1">
                    <Label className="text-xs">Gradient Angle: {design.gradientAngle}°</Label>
                    <Slider
                      value={[design.gradientAngle]}
                      onValueChange={([v]) => updateDesign({ gradientAngle: v })}
                      min={0}
                      max={360}
                      step={5}
                    />
                  </div>
                )}
              </TabsContent>

              {/* ─── Pattern Tab ─── */}
              <TabsContent value="pattern" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Pattern Style</Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PATTERN_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateDesign({ pattern: opt.value })}
                        className={cn(
                          "py-1.5 px-2 rounded-md text-xs font-medium border transition-all",
                          design.pattern === opt.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {design.pattern !== "none" && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs">Pattern Color</Label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={design.patternColor}
                          onChange={(e) => updateDesign({ patternColor: e.target.value })}
                          className="w-8 h-8 rounded cursor-pointer border"
                        />
                        <Input
                          value={design.patternColor}
                          onChange={(e) => updateDesign({ patternColor: e.target.value })}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Opacity: {Math.round(design.patternOpacity * 100)}%</Label>
                      <Slider
                        value={[design.patternOpacity]}
                        onValueChange={([v]) => updateDesign({ patternOpacity: v })}
                        min={0.01}
                        max={0.5}
                        step={0.01}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Scale: {design.patternScale.toFixed(1)}x</Label>
                      <Slider
                        value={[design.patternScale]}
                        onValueChange={([v]) => updateDesign({ patternScale: v })}
                        min={0.3}
                        max={3}
                        step={0.1}
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              {/* ─── Text Tab ─── */}
              <TabsContent value="text" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Text Elements</Label>
                  <Button variant="outline" size="sm" onClick={addText} className="h-7 text-xs">
                    <Type className="w-3 h-3 mr-1" /> Add Text
                  </Button>
                </div>

                {/* Text list */}
                <div className="space-y-1.5">
                  {design.texts.map((text) => (
                    <div
                      key={text.id}
                      onClick={() => setSelectedTextId(text.id)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-all",
                        selectedTextId === text.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <span className="text-sm truncate flex-1">{text.content || "(empty)"}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeText(text.id);
                        }}
                        className="ml-2 text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Selected text editor */}
                {selectedText && (
                  <Card className="border-primary/30">
                    <CardContent className="p-3 space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Content</Label>
                        <Input
                          value={selectedText.content}
                          onChange={(e) => updateText(selectedText.id, { content: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Font</Label>
                          <select
                            value={selectedText.fontFamily}
                            onChange={(e) => updateText(selectedText.id, { fontFamily: e.target.value })}
                            className="w-full h-8 rounded-md border bg-background px-2 text-xs"
                          >
                            {FONT_OPTIONS.map((f) => (
                              <option key={f.value} value={f.value}>
                                {f.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Color</Label>
                          <div className="flex gap-1 items-center">
                            <input
                              type="color"
                              value={selectedText.color}
                              onChange={(e) => updateText(selectedText.id, { color: e.target.value })}
                              className="w-8 h-8 rounded cursor-pointer border"
                            />
                            <Input
                              value={selectedText.color}
                              onChange={(e) => updateText(selectedText.id, { color: e.target.value })}
                              className="h-8 text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Font Size: {selectedText.fontSize}px</Label>
                        <Slider
                          value={[selectedText.fontSize]}
                          onValueChange={([v]) => updateText(selectedText.id, { fontSize: v })}
                          min={8}
                          max={72}
                          step={1}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Letter Spacing: {selectedText.letterSpacing}px</Label>
                        <Slider
                          value={[selectedText.letterSpacing]}
                          onValueChange={([v]) => updateText(selectedText.id, { letterSpacing: v })}
                          min={0}
                          max={20}
                          step={0.5}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">X Position: {selectedText.x}%</Label>
                          <Slider
                            value={[selectedText.x]}
                            onValueChange={([v]) => updateText(selectedText.id, { x: v })}
                            min={0}
                            max={100}
                            step={1}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Y Position: {selectedText.y}%</Label>
                          <Slider
                            value={[selectedText.y]}
                            onValueChange={([v]) => updateText(selectedText.id, { y: v })}
                            min={0}
                            max={100}
                            step={1}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Rotation: {selectedText.rotation}°</Label>
                        <Slider
                          value={[selectedText.rotation]}
                          onValueChange={([v]) => updateText(selectedText.id, { rotation: v })}
                          min={-180}
                          max={180}
                          step={1}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => updateText(selectedText.id, { bold: !selectedText.bold })}
                          className={cn(
                            "px-3 py-1 rounded-md text-xs font-bold border transition-all",
                            selectedText.bold
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border"
                          )}
                        >
                          B
                        </button>
                        <button
                          onClick={() => updateText(selectedText.id, { italic: !selectedText.italic })}
                          className={cn(
                            "px-3 py-1 rounded-md text-xs italic border transition-all",
                            selectedText.italic
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border"
                          )}
                        >
                          I
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* ─── Border Tab ─── */}
              <TabsContent value="border" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Border Style</Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["none", "solid", "double", "dashed", "ornate", "rounded"] as BorderStyle[]).map((style) => (
                      <button
                        key={style}
                        onClick={() => updateDesign({ borderStyle: style })}
                        className={cn(
                          "py-1.5 px-2 rounded-md text-xs font-medium border transition-all capitalize",
                          design.borderStyle === style
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {design.borderStyle !== "none" && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs">Border Color</Label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={design.borderColor}
                          onChange={(e) => updateDesign({ borderColor: e.target.value })}
                          className="w-8 h-8 rounded cursor-pointer border"
                        />
                        <Input
                          value={design.borderColor}
                          onChange={(e) => updateDesign({ borderColor: e.target.value })}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Line Width: {design.borderWidth}px</Label>
                      <Slider
                        value={[design.borderWidth]}
                        onValueChange={([v]) => updateDesign({ borderWidth: v })}
                        min={1}
                        max={8}
                        step={0.5}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Corner Radius: {design.borderRadius}px</Label>
                      <Slider
                        value={[design.borderRadius]}
                        onValueChange={([v]) => updateDesign({ borderRadius: v })}
                        min={0}
                        max={30}
                        step={1}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Inset: {design.borderInset}px</Label>
                      <Slider
                        value={[design.borderInset]}
                        onValueChange={([v]) => updateDesign({ borderInset: v })}
                        min={0}
                        max={40}
                        step={1}
                      />
                    </div>
                  </>
                )}

                {/* Inner border */}
                <div className="pt-2 border-t space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Inner Border</Label>
                    <button
                      onClick={() => updateDesign({ innerBorder: !design.innerBorder })}
                      className={cn(
                        "w-9 h-5 rounded-full transition-colors relative",
                        design.innerBorder ? "bg-primary" : "bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                          design.innerBorder ? "translate-x-4" : "translate-x-0.5"
                        )}
                      />
                    </button>
                  </div>

                  {design.innerBorder && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs">Inner Border Color</Label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={design.innerBorderColor.replace(/[0-9a-f]{2}$/i, "")}
                            onChange={(e) => updateDesign({ innerBorderColor: e.target.value + "80" })}
                            className="w-8 h-8 rounded cursor-pointer border"
                          />
                          <Input
                            value={design.innerBorderColor}
                            onChange={(e) => updateDesign({ innerBorderColor: e.target.value })}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Inner Inset: {design.innerBorderInset}px</Label>
                        <Slider
                          value={[design.innerBorderInset]}
                          onValueChange={([v]) => updateDesign({ innerBorderInset: v })}
                          min={10}
                          max={60}
                          step={1}
                        />
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Reset */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => setDesign({ ...DEFAULT_DESIGN })}
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Reset to Default
            </Button>
          </div>

          {/* Right: Preview */}
          <div className="flex-1 flex items-center justify-center p-6 bg-muted/30">
            <div className="flex flex-col items-center gap-4">
              <p className="text-xs text-muted-foreground">
                {cardWidth}" × {cardHeight}" Card Back Preview
              </p>
              <div
                className="rounded-lg shadow-2xl overflow-hidden"
                style={{
                  width: cardWidth * 96,
                  height: cardHeight * 96,
                }}
              >
                <canvas
                  ref={canvasRef}
                  style={{
                    width: cardWidth * 96,
                    height: cardHeight * 96,
                  }}
                  className="block"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onCancel}>
                  <X className="w-3 h-3 mr-1" /> Cancel
                </Button>
                <Button size="sm" onClick={handleApply}>
                  <Download className="w-3 h-3 mr-1" /> Apply to Print Cards
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
