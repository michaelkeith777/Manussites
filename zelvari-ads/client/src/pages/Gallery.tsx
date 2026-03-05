/**
 * Gallery — View all generated ad creatives with download, filter, and delete.
 */
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Image as ImageIcon, Download, Trash2, Eye, Search,
  Filter, Grid3X3, LayoutGrid, Copy, ExternalLink,
  Sparkles, Calendar, Loader2,
} from "lucide-react";

export default function Gallery() {
  const [viewMode, setViewMode] = useState<"grid" | "large">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const creativesQuery = trpc.creative.list.useQuery();
  const galleryQuery = trpc.gallery.list.useQuery();
  const deleteMutation = trpc.creative.delete.useMutation({
    onSuccess: () => {
      creativesQuery.refetch();
      galleryQuery.refetch();
      toast.success("Creative deleted");
    },
  });

  const creatives = creativesQuery.data ?? [];
  const galleryItems = galleryQuery.data ?? [];

  // Combine and filter
  const allItems = [
    ...creatives.map(c => ({
      id: c.id,
      type: "creative" as const,
      title: c.headline || `Creative #${c.id}`,
      imageUrl: c.generatedImageUrl,
      status: c.status,
      format: c.format,
      platform: c.platform,
      createdAt: c.createdAt,
      headline: c.headline,
      primaryText: c.primaryText,
      callToAction: c.callToAction,
      productImageUrl: c.productImageUrl,
    })),
  ].filter(item => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (searchTerm && !item.title?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleDelete = (id: number) => {
    if (confirm("Delete this creative?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-heading font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                <ImageIcon size={20} className="text-white" />
              </div>
              Creative Gallery
            </h1>
            <p className="text-muted-foreground mt-1">
              All your AI-generated ad creatives in one place
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-purple-500/20 text-purple-400" : "text-muted-foreground hover:bg-secondary"}`}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode("large")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "large" ? "bg-purple-500/20 text-purple-400" : "text-muted-foreground hover:bg-secondary"}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search creatives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-secondary/50"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-secondary/50">
              <Filter size={14} className="mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="generating">Generating</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Gallery Grid */}
        {creativesQuery.isLoading ? (
          <div className="py-20 text-center">
            <Loader2 size={32} className="animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading gallery...</p>
          </div>
        ) : allItems.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-20 text-center">
              <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-6">
                <Sparkles size={32} className="text-muted-foreground" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">No Creatives Yet</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                Head to the AI Creative Studio to generate your first ad creative.
              </p>
              <a href="/creative-studio">
                <Button className="bg-gradient-to-r from-purple-600 to-purple-500 text-white">
                  <Sparkles size={16} className="mr-2" /> Open Creative Studio
                </Button>
              </a>
            </CardContent>
          </Card>
        ) : (
          <div className={`grid gap-4 ${
            viewMode === "grid"
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2"
          }`}>
            {allItems.map((item) => (
              <Card
                key={`${item.type}-${item.id}`}
                className="bg-card border-border overflow-hidden group hover:border-purple-500/30 transition-all hover:shadow-lg hover:shadow-purple-900/10"
              >
                {/* Image */}
                <div className="relative aspect-square bg-secondary/30">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title || "Creative"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={32} className="text-muted-foreground" />
                    </div>
                  )}

                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => { setSelectedItem(item); setShowPreview(true); }}
                      className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    >
                      <Eye size={16} className="text-white" />
                    </button>
                    {item.imageUrl && (
                      <a
                        href={item.imageUrl}
                        download
                        className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30"
                      >
                        <Download size={16} className="text-white" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2.5 rounded-xl bg-red-500/30 backdrop-blur-sm hover:bg-red-500/50"
                    >
                      <Trash2 size={16} className="text-white" />
                    </button>
                  </div>

                  {/* Status badge */}
                  <div className="absolute top-2 right-2">
                    <Badge
                      className={`text-xs ${
                        item.status === "completed" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                        item.status === "generating" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                        "bg-red-500/20 text-red-400 border-red-500/30"
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>

                {/* Info */}
                <CardContent className="p-3">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1.5">
                      {item.platform && item.platform !== "all" && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{item.platform}</Badge>
                      )}
                      {item.format && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{item.format}</Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar size={10} />
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl bg-card border-border">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title || "Creative Preview"}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {selectedItem.imageUrl && (
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="w-full h-auto max-h-[500px] object-contain rounded-lg bg-black/10"
                />
              )}
              {selectedItem.headline && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Headline</p>
                  <p className="font-heading font-bold text-lg">{selectedItem.headline}</p>
                </div>
              )}
              {selectedItem.primaryText && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Primary Text</p>
                  <p className="text-sm">{selectedItem.primaryText}</p>
                </div>
              )}
              {selectedItem.callToAction && (
                <Badge className="bg-purple-500/20 text-purple-300">{selectedItem.callToAction}</Badge>
              )}
              <div className="flex gap-3 pt-2">
                {selectedItem.imageUrl && (
                  <a href={selectedItem.imageUrl} download className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white">
                      <Download size={16} className="mr-2" /> Download Image
                    </Button>
                  </a>
                )}
                {selectedItem.headline && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const text = `${selectedItem.headline}\n\n${selectedItem.primaryText || ""}\n\nCTA: ${selectedItem.callToAction || ""}`;
                      navigator.clipboard.writeText(text);
                      toast.success("Copied to clipboard!");
                    }}
                  >
                    <Copy size={16} className="mr-2" /> Copy Text
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
