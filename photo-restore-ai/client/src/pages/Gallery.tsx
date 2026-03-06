/*
 * DESIGN: Temporal Alchemy — Dark Cinematic Restoration Studio
 * Gallery Page: Masonry grid of restored photos with filtering, download, and before/after view
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Download, Trash2, Eye, Filter, Sparkles, Image as ImageIcon,
  Calendar, X, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface GalleryItem {
  id: string;
  original: string;
  restored: string;
  mode: string;
  date: string;
  fileName: string;
}

const modeLabels: Record<string, string> = {
  repair: "Repair",
  colorize: "Colorize",
  upscale: "4K Upscale",
  all: "Full Restore",
};

const modeColors: Record<string, string> = {
  repair: "bg-amber/20 text-amber",
  colorize: "bg-teal/20 text-teal",
  upscale: "bg-blue-500/20 text-blue-400",
  all: "bg-amber/20 text-amber",
};

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [viewMode, setViewMode] = useState<"restored" | "comparison">("restored");
  const [sliderPos, setSliderPos] = useState(50);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("photoRestoreGallery") || "[]");
    setItems(stored);
  }, []);

  const filteredItems = filter === "all"
    ? items
    : items.filter((item) => item.mode === filter);

  const deleteItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    localStorage.setItem("photoRestoreGallery", JSON.stringify(updated));
    if (selectedItem?.id === id) setSelectedItem(null);
    toast.success("Photo removed from gallery");
  };

  const downloadItem = (item: GalleryItem) => {
    const link = document.createElement("a");
    link.download = `restored-${item.fileName}`;
    link.href = item.restored;
    link.click();
    toast.success("Image downloaded!");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="absolute top-20 right-0 w-72 h-72 bg-amber/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-40 left-0 w-72 h-72 bg-teal/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="container max-w-7xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold mb-3">
            Your <span className="text-gradient-amber">Gallery</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            All your restored photos in one place
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-center gap-2 mb-8 flex-wrap"
        >
          <Filter className="w-4 h-4 text-muted-foreground mr-1" />
          {[
            { id: "all", label: "All" },
            { id: "repair", label: "Repair" },
            { id: "colorize", label: "Colorize" },
            { id: "upscale", label: "4K Upscale" },
            { id: "all-mode", label: "Full Restore" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id === "all-mode" ? "all" : f.id === "all" ? "all" : f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                (f.id === "all" && filter === "all")
                  ? "bg-amber/20 text-amber"
                  : filter === f.id
                  ? "bg-amber/20 text-amber"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <ImageIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-muted-foreground mb-2">
              No Photos Yet
            </h3>
            <p className="text-muted-foreground/70 text-sm mb-6">
              {items.length === 0
                ? "Start restoring photos to build your gallery"
                : "No photos match this filter"}
            </p>
            {items.length === 0 && (
              <Link href="/restore">
                <Button className="gap-2 bg-amber text-primary-foreground hover:bg-amber-light">
                  <Sparkles className="w-4 h-4" />
                  Restore Your First Photo
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filteredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group glass-card rounded-xl overflow-hidden"
                >
                  {/* Image */}
                  <div
                    className="relative aspect-[4/3] overflow-hidden cursor-pointer"
                    onClick={() => {
                      setSelectedItem(item);
                      setViewMode("restored");
                    }}
                  >
                    <img
                      src={item.restored}
                      alt={item.fileName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2.5 glass-card rounded-lg text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            setViewMode("comparison");
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2.5 glass-card rounded-lg text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadItem(item);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2.5 glass-card rounded-lg text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(item.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Mode badge */}
                    <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-medium ${modeColors[item.mode] || modeColors.all}`}>
                      {modeLabels[item.mode] || "Restored"}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 flex items-center justify-between">
                    <div className="truncate">
                      <p className="text-sm font-medium text-foreground truncate">{item.fileName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.date)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[90vh] glass-card rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setViewMode("restored")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === "restored" ? "bg-amber/20 text-amber" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Restored
                  </button>
                  <button
                    onClick={() => setViewMode("comparison")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === "comparison" ? "bg-amber/20 text-amber" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Compare
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadItem(selectedItem)}
                    className="text-xs gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedItem(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Image */}
              <div className="relative overflow-auto max-h-[calc(90vh-60px)]">
                {viewMode === "comparison" ? (
                  <div
                    className="relative select-none cursor-col-resize"
                    onMouseDown={() => {}}
                    onMouseMove={(e) => {
                      if (e.buttons === 1) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                        setSliderPos(Math.max(0, Math.min(100, x)));
                      }
                    }}
                  >
                    <img src={selectedItem.restored} alt="Restored" className="w-full h-auto" />
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                    >
                      <img src={selectedItem.original} alt="Original" className="w-full h-auto" />
                    </div>
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-amber"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-amber flex items-center justify-center">
                        <ChevronLeft className="w-3 h-3 text-primary-foreground -mr-0.5" />
                        <ChevronRight className="w-3 h-3 text-primary-foreground -ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 px-3 py-1 glass-card rounded text-xs text-muted-foreground">Original</div>
                    <div className="absolute bottom-4 right-4 px-3 py-1 glass-card rounded text-xs text-amber">Restored</div>
                  </div>
                ) : (
                  <img src={selectedItem.restored} alt="Restored" className="w-full h-auto" />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
