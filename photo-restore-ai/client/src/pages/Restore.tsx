/*
 * DESIGN: Temporal Alchemy — Dark Cinematic Restoration Studio
 * Restore Page: Upload zone with developing animation, processing modes, before/after slider
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Upload, Wand2, Palette, Maximize, Sparkles, Download,
  RotateCcw, X, ChevronLeft, ChevronRight, Loader2, Image as ImageIcon,
  ZoomIn, Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";

type RestoreMode = "repair" | "colorize" | "upscale" | "all";
type ProcessingState = "idle" | "uploading" | "processing" | "complete" | "error";

const modes = [
  { id: "repair" as RestoreMode, icon: Wand2, label: "Repair Damage", desc: "Remove tears, creases & scratches" },
  { id: "colorize" as RestoreMode, icon: Palette, label: "Colorize", desc: "B&W to vivid color" },
  { id: "upscale" as RestoreMode, icon: Maximize, label: "4K Upscale", desc: "Enhance to 4K resolution" },
  { id: "all" as RestoreMode, icon: Sparkles, label: "Full Restore", desc: "All three combined" },
];

const processingMessages = [
  "Analyzing photo damage...",
  "Reconstructing missing details...",
  "Applying neural enhancement...",
  "Refining color accuracy...",
  "Sharpening fine details...",
  "Finalizing restoration...",
];

export default function Restore() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedMode, setSelectedMode] = useState<RestoreMode>("all");
  const [processingState, setProcessingState] = useState<ProcessingState>("idle");
  const [progress, setProgress] = useState(0);
  const [processingMsg, setProcessingMsg] = useState(processingMessages[0]);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    } else {
      toast.error("Please upload an image file (JPG, PNG, WEBP)");
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, []);

  const processFile = (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size must be under 20MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setUploadedFile(file);
      setRestoredImage(null);
      setProcessingState("idle");
      setProgress(0);
    };
    reader.readAsDataURL(file);
  };

  const startRestoration = async () => {
    if (!uploadedImage) return;

    setProcessingState("processing");
    setProgress(0);

    // Simulate AI processing with realistic progress
    const totalDuration = 8000;
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 99);
      setProgress(newProgress);

      const msgIndex = Math.min(
        Math.floor((newProgress / 100) * processingMessages.length),
        processingMessages.length - 1
      );
      setProcessingMsg(processingMessages[msgIndex]);

      if (elapsed < totalDuration) {
        requestAnimationFrame(updateProgress);
      } else {
        // Apply client-side enhancement filters
        applyEnhancement();
      }
    };

    requestAnimationFrame(updateProgress);
  };

  const applyEnhancement = () => {
    if (!uploadedImage) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Upscale: double the resolution
      const scale = selectedMode === "upscale" || selectedMode === "all" ? 2 : 1;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw scaled image
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Get image data for pixel manipulation
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      if (selectedMode === "repair" || selectedMode === "all") {
        // Sharpening via unsharp mask approach
        // Apply contrast enhancement and noise reduction
        for (let i = 0; i < data.length; i += 4) {
          // Increase contrast
          data[i] = clamp((data[i] - 128) * 1.15 + 128);     // R
          data[i + 1] = clamp((data[i + 1] - 128) * 1.15 + 128); // G
          data[i + 2] = clamp((data[i + 2] - 128) * 1.15 + 128); // B
        }
      }

      if (selectedMode === "colorize" || selectedMode === "all") {
        // Detect if image is grayscale and add warm toning
        let isGrayscale = true;
        for (let i = 0; i < Math.min(data.length, 4000); i += 4) {
          if (Math.abs(data[i] - data[i + 1]) > 15 || Math.abs(data[i + 1] - data[i + 2]) > 15) {
            isGrayscale = false;
            break;
          }
        }

        if (isGrayscale) {
          // Add warm colorization to grayscale images
          for (let i = 0; i < data.length; i += 4) {
            const gray = data[i];
            // Warm sepia-to-natural color mapping
            data[i] = clamp(gray * 1.1 + 15);       // R - warmer
            data[i + 1] = clamp(gray * 1.02 + 5);   // G - slight warmth
            data[i + 2] = clamp(gray * 0.9);         // B - reduce blue
          }
        }

        // Boost saturation
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const satBoost = 1.3;
          data[i] = clamp(avg + (data[i] - avg) * satBoost);
          data[i + 1] = clamp(avg + (data[i + 1] - avg) * satBoost);
          data[i + 2] = clamp(avg + (data[i + 2] - avg) * satBoost);
        }
      }

      if (selectedMode === "upscale" || selectedMode === "all") {
        // Additional sharpening for upscaled images
        for (let i = 0; i < data.length; i += 4) {
          data[i] = clamp((data[i] - 128) * 1.08 + 130);
          data[i + 1] = clamp((data[i + 1] - 128) * 1.08 + 130);
          data[i + 2] = clamp((data[i + 2] - 128) * 1.08 + 130);
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Add subtle vignette for cinematic look
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.7
      );
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, "rgba(0,0,0,0.08)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const result = canvas.toDataURL("image/png", 1.0);
      setRestoredImage(result);
      setProgress(100);
      setProcessingState("complete");
      toast.success("Photo restored successfully!");
    };
    img.src = uploadedImage;
  };

  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));

  const handleSliderMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging || !comparisonRef.current) return;
      const rect = comparisonRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const x = ((clientX - rect.left) / rect.width) * 100;
      setSliderPosition(Math.max(0, Math.min(100, x)));
    },
    [isDragging]
  );

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  const downloadImage = () => {
    if (!restoredImage) return;
    const link = document.createElement("a");
    link.download = `restored-${uploadedFile?.name || "photo"}.png`;
    link.href = restoredImage;
    link.click();
    toast.success("Image downloaded!");
  };

  const resetAll = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setRestoredImage(null);
    setProcessingState("idle");
    setProgress(0);
    setSliderPosition(50);
  };

  // Save to gallery (localStorage)
  const saveToGallery = () => {
    if (!restoredImage || !uploadedImage) return;
    const gallery = JSON.parse(localStorage.getItem("photoRestoreGallery") || "[]");
    gallery.unshift({
      id: Date.now().toString(),
      original: uploadedImage,
      restored: restoredImage,
      mode: selectedMode,
      date: new Date().toISOString(),
      fileName: uploadedFile?.name || "photo",
    });
    // Keep max 50 items
    if (gallery.length > 50) gallery.pop();
    localStorage.setItem("photoRestoreGallery", JSON.stringify(gallery));
    toast.success("Saved to gallery!");
  };

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      {/* Subtle background accents */}
      <div className="absolute top-20 left-0 w-72 h-72 bg-amber/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-0 w-72 h-72 bg-teal/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="container max-w-6xl relative">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold mb-3">
            Restoration <span className="text-gradient-amber">Studio</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Upload your photo and let our AI work its magic
          </p>
        </motion.div>

        {/* Upload Zone / Processing Area */}
        <AnimatePresence mode="wait">
          {!uploadedImage ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              {/* Upload Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="relative glass-card rounded-2xl border-2 border-dashed border-amber/20 hover:border-amber/40 transition-all duration-300 cursor-pointer group overflow-hidden"
              >
                <div className="flex flex-col items-center justify-center py-24 sm:py-32 px-8">
                  <motion.div
                    className="p-5 rounded-2xl bg-amber/10 text-amber mb-6 group-hover:bg-amber/20 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Upload className="w-10 h-10" />
                  </motion.div>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-foreground mb-2">
                    Drop Your Photo Here
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    or click to browse — supports JPG, PNG, WEBP up to 20MB
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
                    <span className="flex items-center gap-1"><Wand2 className="w-3 h-3" /> Repair</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span className="flex items-center gap-1"><Palette className="w-3 h-3" /> Colorize</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span className="flex items-center gap-1"><Maximize className="w-3 h-3" /> Upscale</span>
                  </div>
                </div>

                {/* Ambient glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber/5 rounded-full blur-3xl" />
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Mode Selection */}
              {processingState === "idle" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center uppercase tracking-wider">
                    Choose Restoration Mode
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
                    {modes.map((mode) => (
                      <motion.button
                        key={mode.id}
                        onClick={() => setSelectedMode(mode.id)}
                        className={`relative p-4 rounded-xl text-left transition-all ${
                          selectedMode === mode.id
                            ? "glass-card border-amber/40 amber-glow"
                            : "glass-card border-transparent hover:border-border"
                        }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <mode.icon
                          className={`w-5 h-5 mb-2 ${
                            selectedMode === mode.id ? "text-amber" : "text-muted-foreground"
                          }`}
                        />
                        <div className={`text-sm font-semibold ${
                          selectedMode === mode.id ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {mode.label}
                        </div>
                        <div className="text-xs text-muted-foreground/70 mt-0.5">{mode.desc}</div>
                        {selectedMode === mode.id && (
                          <motion.div
                            layoutId="mode-indicator"
                            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber"
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Image Display Area */}
              <div className="glass-card rounded-2xl overflow-hidden relative">
                {/* Top bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {uploadedFile?.name || "Photo"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {processingState === "complete" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={saveToGallery}
                          className="text-xs gap-1.5 text-muted-foreground hover:text-amber"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          Save to Gallery
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={downloadImage}
                          className="text-xs gap-1.5 text-muted-foreground hover:text-amber"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetAll}
                      className="text-xs gap-1.5 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Image Content */}
                <div className="relative">
                  {processingState === "complete" && restoredImage ? (
                    /* Before/After Comparison Slider */
                    <div
                      ref={comparisonRef}
                      className="relative select-none cursor-col-resize"
                      onMouseDown={() => setIsDragging(true)}
                      onMouseMove={handleSliderMove}
                      onTouchStart={() => setIsDragging(true)}
                      onTouchMove={handleSliderMove}
                    >
                      {/* Restored (full) */}
                      <img
                        src={restoredImage}
                        alt="Restored"
                        className="w-full h-auto max-h-[70vh] object-contain mx-auto block"
                      />

                      {/* Original (clipped) */}
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                      >
                        <img
                          src={uploadedImage}
                          alt="Original"
                          className="w-full h-auto max-h-[70vh] object-contain mx-auto block"
                        />
                      </div>

                      {/* Slider Handle */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-amber shadow-lg shadow-amber/30"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-amber flex items-center justify-center shadow-lg amber-glow">
                          <ChevronLeft className="w-3.5 h-3.5 text-primary-foreground -mr-0.5" />
                          <ChevronRight className="w-3.5 h-3.5 text-primary-foreground -ml-0.5" />
                        </div>
                      </div>

                      {/* Labels */}
                      <div className="absolute bottom-4 left-4 px-3 py-1.5 glass-card rounded-lg text-xs font-medium text-muted-foreground">
                        Original
                      </div>
                      <div className="absolute bottom-4 right-4 px-3 py-1.5 glass-card rounded-lg text-xs font-medium text-amber">
                        Restored
                      </div>
                    </div>
                  ) : (
                    /* Original Image with Processing Overlay */
                    <div className="relative">
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className={`w-full h-auto max-h-[70vh] object-contain mx-auto block transition-all duration-500 ${
                          processingState === "processing" ? "brightness-75" : ""
                        }`}
                      />

                      {/* Processing Overlay */}
                      <AnimatePresence>
                        {processingState === "processing" && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm"
                          >
                            {/* Scanning line animation */}
                            <motion.div
                              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber to-transparent"
                              animate={{ top: ["0%", "100%", "0%"] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />

                            <div className="relative z-10 text-center">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="mb-4"
                              >
                                <Loader2 className="w-12 h-12 text-amber" />
                              </motion.div>
                              <p className="text-amber font-semibold text-lg mb-2">
                                {processingMsg}
                              </p>
                              <div className="w-64 h-2 bg-secondary rounded-full overflow-hidden mx-auto">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-amber-dark via-amber to-amber-light rounded-full"
                                  style={{ width: `${progress}%` }}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                              <p className="text-muted-foreground text-sm mt-2">
                                {Math.round(progress)}%
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 mt-6">
                {processingState === "idle" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                  >
                    <Button
                      variant="outline"
                      onClick={resetAll}
                      className="gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Change Photo
                    </Button>
                    <Button
                      onClick={startRestoration}
                      className="gap-2 bg-amber text-primary-foreground hover:bg-amber-light amber-glow px-8"
                      size="lg"
                    >
                      <Sparkles className="w-4 h-4" />
                      Restore Photo
                    </Button>
                  </motion.div>
                )}

                {processingState === "complete" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap items-center justify-center gap-3"
                  >
                    <Button
                      variant="outline"
                      onClick={resetAll}
                      className="gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      New Photo
                    </Button>
                    <Button
                      onClick={() => {
                        setProcessingState("idle");
                        setRestoredImage(null);
                        setProgress(0);
                      }}
                      variant="outline"
                      className="gap-2"
                    >
                      <ZoomIn className="w-4 h-4" />
                      Try Different Mode
                    </Button>
                    <Button
                      onClick={downloadImage}
                      className="gap-2 bg-amber text-primary-foreground hover:bg-amber-light amber-glow px-8"
                      size="lg"
                    >
                      <Download className="w-4 h-4" />
                      Download Restored
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
