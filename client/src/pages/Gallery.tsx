import { useAuth } from "@/_core/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Heart,
  Images,
  Loader2,
  MoreVertical,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
  Maximize2,
  Copy,
  Type,
  Columns,
  ChevronLeft,
  ChevronRight,
  Upload,
  Printer,
} from "lucide-react";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { ImageEditor } from "@/components/ImageEditor";
import { Watermark } from "@/components/Watermark";
import { ImageComparison } from "@/components/ImageComparison";
import { ExportDialog } from "@/components/ExportDialog";

interface GalleryImage {
  id: number;
  taskId: string;
  prompt: string;
  originalTopic: string | null;
  model: "nano-banana" | "nano-banana-pro" | "grok-imagine" | "openai-4o";
  aspectRatio: string;
  imageUrl: string | null;
  isFavorite: boolean;
  createdAt: Date;
}

export default function Gallery() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [watermarkOpen, setWatermarkOpen] = useState(false);
  const [watermarkImage, setWatermarkImage] = useState<GalleryImage | null>(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportImage, setExportImage] = useState<GalleryImage | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();

  // Upload mutation
  const uploadMutation = trpc.images.upload.useMutation({
    onSuccess: () => {
      utils.images.list.invalidate();
      utils.images.count.invalidate();
      toast.success("Image uploaded to gallery!");
    },
    onError: (err) => {
      toast.error("Failed to upload image: " + err.message);
    },
  });

  // Handle file upload
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return;
      }

      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            await uploadMutation.mutateAsync({
              imageDataUrl: reader.result as string,
              fileName: file.name,
              prompt: `Uploaded: ${file.name}`,
            });
          } catch {
            // Error handled by mutation
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    });

    await Promise.all(uploadPromises);
    setIsUploading(false);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [uploadMutation]);

  // Queries
  const allImages = trpc.images.list.useQuery(
    { limit: 100, offset: 0, favoritesOnly: false },
    { enabled: isAuthenticated }
  );
  const favoriteImages = trpc.images.list.useQuery(
    { limit: 100, offset: 0, favoritesOnly: true },
    { enabled: isAuthenticated }
  );

  // Minimum swipe distance for navigation (in px)
  const minSwipeDistance = 50;

  // Get current image index and navigation functions
  const currentImages = useMemo(() => allImages.data || [], [allImages.data]);
  const currentImageIndex = useMemo(() => {
    if (!selectedImage) return -1;
    return currentImages.findIndex(img => img.id === selectedImage.id);
  }, [selectedImage, currentImages]);

  const navigateToImage = useCallback((direction: 'prev' | 'next') => {
    if (currentImageIndex === -1 || currentImages.length === 0) return;
    
    let newIndex: number;
    if (direction === 'prev') {
      newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : currentImages.length - 1;
    } else {
      newIndex = currentImageIndex < currentImages.length - 1 ? currentImageIndex + 1 : 0;
    }
    setSelectedImage(currentImages[newIndex]);
  }, [currentImageIndex, currentImages]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      navigateToImage('next');
    } else if (isRightSwipe) {
      navigateToImage('prev');
    }
  };

  // Mutations
  const toggleFavorite = trpc.images.toggleFavorite.useMutation({
    onSuccess: () => {
      utils.images.list.invalidate();
      utils.images.count.invalidate();
    },
    onError: () => {
      toast.error("Failed to update favorite");
    },
  });

  const deleteImage = trpc.images.delete.useMutation({
    onSuccess: () => {
      utils.images.list.invalidate();
      utils.images.count.invalidate();
      toast.success("Image deleted");
      setViewerOpen(false);
    },
    onError: () => {
      toast.error("Failed to delete image");
    },
  });

  // Handlers
  const handleToggleFavorite = (imageId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    toggleFavorite.mutate({ imageId });
  };

  const handleDelete = (imageId: number) => {
    if (confirm("Are you sure you want to delete this image?")) {
      deleteImage.mutate({ imageId });
    }
  };

  const handleDownload = async (image: GalleryImage, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!image.imageUrl) {
      toast.error("No image URL available");
      return;
    }

    toast.info("Preparing download...");
    
    try {
      // Try direct fetch first
      const response = await fetch(image.imageUrl);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `trading-card-${image.id}.png`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Image downloaded!");
        return;
      }
    } catch (error) {
      console.log("Direct fetch failed, trying alternative method...");
    }
    
    // Fallback: Create a link and trigger download via anchor
    try {
      const a = document.createElement("a");
      a.href = image.imageUrl;
      a.download = `trading-card-${image.id}.png`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Download started - check your downloads folder");
    } catch (error) {
      console.error("Download failed:", error);
      // Final fallback: open in new tab
      window.open(image.imageUrl, '_blank');
      toast.info("Image opened in new tab - right-click to save");
    }
  };

  const handleRecreate = (image: GalleryImage) => {
    // Store the prompt in sessionStorage and navigate to create page
    sessionStorage.setItem("recreatePrompt", image.prompt);
    sessionStorage.setItem("recreateTopic", image.originalTopic || "");
    setLocation("/create");
    toast.info("Prompt loaded - ready to recreate!");
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied to clipboard");
  };

  const images = activeTab === "favorites" ? favoriteImages.data : allImages.data;
  const isLoading = activeTab === "favorites" ? favoriteImages.isLoading : allImages.isLoading;

  // Auth check
  if (authLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Images className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to view your image gallery.
              </p>
              <Button asChild className="w-full">
                <a href={getLoginUrl()}>Sign In to Continue</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Gallery</h1>
              <p className="text-muted-foreground">
                All your generated trading card images in one place
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <Button
                variant="outline"
                onClick={() => setComparisonOpen(true)}
                disabled={!allImages.data || allImages.data.length < 2}
              >
                <Columns className="w-4 h-4 mr-2" />
                Compare
              </Button>
              <Button asChild variant="outline">
                <Link href="/print">
                  <Printer className="w-4 h-4 mr-2" />
                  Print Cards
                </Link>
              </Button>
              <Button asChild className="glow-purple-sm">
                <Link href="/create">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create New
                </Link>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "favorites")}>
            <TabsList className="mb-6">
              <TabsTrigger value="all" className="gap-2">
                <Images className="w-4 h-4" />
                All Images
                {allImages.data && (
                  <span className="ml-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                    {allImages.data.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-2">
                <Heart className="w-4 h-4" />
                Favorites
                {favoriteImages.data && (
                  <span className="ml-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                    {favoriteImages.data.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <ImageGrid
                images={images as GalleryImage[] | undefined}
                isLoading={isLoading}
                onImageClick={(img) => {
                  setSelectedImage(img);
                  setViewerOpen(true);
                }}
                onToggleFavorite={handleToggleFavorite}
                onDownload={handleDownload}
              />
            </TabsContent>

            <TabsContent value="favorites" className="mt-0">
              <ImageGrid
                images={images as GalleryImage[] | undefined}
                isLoading={isLoading}
                onImageClick={(img) => {
                  setSelectedImage(img);
                  setViewerOpen(true);
                }}
                onToggleFavorite={handleToggleFavorite}
                onDownload={handleDownload}
                emptyMessage="No favorites yet. Click the heart icon on any image to add it to your favorites."
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Image Viewer Dialog */}
        <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
          <DialogContent className="max-w-7xl w-[98vw] h-[95vh] max-h-[95vh] p-0 overflow-y-auto bg-background text-foreground flex flex-col">
            <VisuallyHidden.Root>
              <DialogTitle>Image Details</DialogTitle>
              <DialogDescription>View and manage your generated trading card image</DialogDescription>
            </VisuallyHidden.Root>
            {selectedImage && (
              <>
                {/* Main content area */}
                <div className="flex flex-col lg:flex-row flex-1 min-h-0 lg:overflow-hidden">
                  {/* Image with Swipe Support */}
                  <div 
                    className="flex-shrink-0 h-[40vh] lg:h-auto lg:w-1/2 xl:w-3/5 bg-black/90 flex items-center justify-center p-4 lg:p-6 relative"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                  >
                    {/* Navigation Arrows */}
                    {currentImages.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10 lg:h-12 lg:w-12"
                          onClick={() => navigateToImage('prev')}
                        >
                          <ChevronLeft className="w-6 h-6 lg:w-8 lg:h-8" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10 lg:h-12 lg:w-12"
                          onClick={() => navigateToImage('next')}
                        >
                          <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8" />
                        </Button>
                      </>
                    )}
                    
                    {/* Image Counter */}
                    {currentImages.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs lg:text-sm px-3 py-1 rounded-full">
                        {currentImageIndex + 1} / {currentImages.length}
                      </div>
                    )}
                    
                    {selectedImage.imageUrl ? (
                      <img
                        src={selectedImage.imageUrl}
                        alt="Generated image"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
                        draggable={false}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23333" width="200" height="200"/><text fill="%23999" x="50%" y="50%" text-anchor="middle" dy=".3em">Image not available</text></svg>';
                        }}
                      />
                    ) : (
                      <div className="text-muted-foreground">Image not available</div>
                    )}
                    {/* Favorite badge on image */}
                    {selectedImage.isFavorite && (
                      <div className="absolute top-4 left-4 bg-black/60 rounded-full p-2">
                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                      </div>
                    )}
                  </div>

                  {/* Details Panel */}
                  <div className="flex-1 lg:flex-initial lg:w-1/2 xl:w-2/5 flex flex-col bg-card/50 backdrop-blur-sm overflow-y-auto lg:overflow-hidden">
                    {/* Header with Close Button */}
                    <div className="p-4 lg:p-5 border-b border-border">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-lg lg:text-xl font-bold">Image Details</h2>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-red-500/10"
                            onClick={() => handleToggleFavorite(selectedImage.id)}
                          >
                            <Heart
                              className={cn(
                                "w-5 h-5 lg:w-6 lg:h-6 transition-all",
                                selectedImage.isFavorite
                                  ? "fill-red-500 text-red-500 scale-110"
                                  : "text-muted-foreground hover:text-red-400"
                              )}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            onClick={() => setViewerOpen(false)}
                          >
                            <X className="w-5 h-5 lg:w-6 lg:h-6" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Scrollable Content */}
                    <ScrollArea className="flex-1 p-5">
                      <div className="space-y-5">
                        {/* Topic Card */}
                        {selectedImage.originalTopic && (
                          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-primary" />
                              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Topic</span>
                            </div>
                            <p className="text-lg font-semibold">{selectedImage.originalTopic}</p>
                          </div>
                        )}

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Model */}
                          <div className="bg-muted/30 rounded-xl p-4">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Model</span>
                            <p className="font-semibold capitalize text-sm">
                              {selectedImage.model.replace("-", " ")}
                            </p>
                          </div>

                          {/* Aspect Ratio */}
                          <div className="bg-muted/30 rounded-xl p-4">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Aspect Ratio</span>
                            <p className="font-semibold text-sm">{selectedImage.aspectRatio}</p>
                          </div>
                        </div>

                        {/* Created Date */}
                        <div className="bg-muted/30 rounded-xl p-4">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Created</span>
                          <p className="font-semibold">
                            {new Date(selectedImage.createdAt).toLocaleDateString(undefined, {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedImage.createdAt).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        {/* Prompt Section */}
                        <div className="bg-muted/30 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Prompt</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs hover:bg-primary/10 hover:text-primary"
                              onClick={() => handleCopyPrompt(selectedImage.prompt)}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <p className="text-sm leading-relaxed text-foreground/80 bg-background/50 p-3 rounded-lg max-h-40 overflow-y-auto border border-border/50">
                            {selectedImage.prompt}
                          </p>
                        </div>
                      </div>
                    </ScrollArea>

                    {/* Actions Footer */}
                    <div className="p-5 border-t border-border bg-background/50">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <Button
                          className="h-10"
                          onClick={() => handleDownload(selectedImage)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          className="h-10"
                          onClick={() => {
                            setEditingImage(selectedImage);
                            setEditorOpen(true);
                            setViewerOpen(false);
                          }}
                        >
                          <Maximize2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="h-10"
                          onClick={() => {
                            setWatermarkImage(selectedImage);
                            setWatermarkOpen(true);
                            setViewerOpen(false);
                          }}
                        >
                          <Type className="w-4 h-4 mr-2" />
                          Watermark
                        </Button>
                        <Button
                          variant="outline"
                          className="h-10"
                          onClick={() => handleRecreate(selectedImage)}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Recreate
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="h-10"
                          onClick={() => {
                            setExportImage(selectedImage);
                            setExportOpen(true);
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(selectedImage.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Image Editor */}
        {editingImage && editingImage.imageUrl && (
          <ImageEditor
            imageUrl={editingImage.imageUrl}
            isOpen={editorOpen}
            onClose={() => {
              setEditorOpen(false);
              setEditingImage(null);
            }}
          />
        )}

        {/* Watermark Editor */}
        {watermarkImage && watermarkImage.imageUrl && (
          <Watermark
            imageUrl={watermarkImage.imageUrl}
            isOpen={watermarkOpen}
            onClose={() => {
              setWatermarkOpen(false);
              setWatermarkImage(null);
            }}
          />
        )}

        {/* Image Comparison */}
        {allImages.data && allImages.data.length >= 2 && (
          <ImageComparison
            images={allImages.data.filter((img): img is typeof img & { imageUrl: string } => img.imageUrl !== null).map(img => ({
              id: img.id,
              imageUrl: img.imageUrl,
              model: img.model,
              prompt: img.prompt,
              createdAt: img.createdAt,
            }))}
            isOpen={comparisonOpen}
            onClose={() => setComparisonOpen(false)}
          />
        )}

        {/* Export Dialog */}
        {exportImage && exportImage.imageUrl && (
          <ExportDialog
            open={exportOpen}
            onOpenChange={(open) => {
              setExportOpen(open);
              if (!open) setExportImage(null);
            }}
            imageUrl={exportImage.imageUrl}
            imageName={`cardking1971-card-${exportImage.id}`}
          />
        )}
        {/* Hidden file input for uploads */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Upload loading overlay */}
        {isUploading && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-background rounded-xl p-6 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="font-medium">Uploading images...</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// Image Grid Component
interface ImageGridProps {
  images: GalleryImage[] | undefined;
  isLoading: boolean;
  onImageClick: (image: GalleryImage) => void;
  onToggleFavorite: (imageId: number, e?: React.MouseEvent) => void;
  onDownload: (image: GalleryImage, e?: React.MouseEvent) => void;
  emptyMessage?: string;
}

// Lazy loading image component with intersection observer
function LazyImage({ src, alt, className, onLoad }: { src: string; alt: string; className?: string; onLoad?: () => void }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className="relative w-full h-full">
      {/* Skeleton placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <Images className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      
      {/* Actual image - only load when in view */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={cn(
            className,
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          loading="lazy"
          decoding="async"
          onLoad={() => {
            setIsLoaded(true);
            onLoad?.();
          }}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}

function ImageGrid({
  images,
  isLoading,
  onImageClick,
  onToggleFavorite,
  onDownload,
  emptyMessage = "No images yet. Start creating to build your gallery!",
}: ImageGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg bg-muted animate-pulse flex items-center justify-center"
          >
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Images className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Images Found</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {emptyMessage}
        </p>
        <Button asChild>
          <Link href="/create">
            <Sparkles className="w-4 h-4 mr-2" />
            Create Your First Image
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <AnimatePresence>
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: Math.min(index * 0.03, 0.3) }}
            className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-muted"
            onClick={() => onImageClick(image)}
          >
            {image.imageUrl && (
              <LazyImage
                src={image.imageUrl}
                alt={image.originalTopic || "Generated image"}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Top Actions */}
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-black/50 hover:bg-black/70"
                  onClick={(e) => onToggleFavorite(image.id, e)}
                >
                  <Heart
                    className={cn(
                      "w-4 h-4",
                      image.isFavorite
                        ? "fill-red-500 text-red-500"
                        : "text-white"
                    )}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-black/50 hover:bg-black/70"
                  onClick={(e) => onDownload(image, e)}
                >
                  <Download className="w-4 h-4 text-white" />
                </Button>
              </div>

              {/* Bottom Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-sm font-medium truncate">
                  {image.originalTopic || "Custom"}
                </p>
                <p className="text-white/70 text-xs capitalize">
                  {image.model.replace("-", " ")}
                </p>
              </div>
            </div>

            {/* Favorite Badge */}
            {image.isFavorite && (
              <div className="absolute top-2 left-2">
                <Heart className="w-4 h-4 fill-red-500 text-red-500 drop-shadow-lg" />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
