import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FolderPlus,
  Folder,
  Plus,
  Settings,
  Trash2,
  Edit,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Collection {
  id: number;
  name: string;
  description: string | null;
  theme: string | null;
  borderStyle: string;
  borderColor: string;
  maxCards: number;
  cardCount: number;
  isPublic: boolean;
}

interface CollectionManagerProps {
  onSelectCollection?: (collectionId: number | null) => void;
  selectedCollectionId?: number | null;
  mode?: "select" | "manage";
}

const borderStyles = [
  { id: "classic", name: "Classic", preview: "border-amber-500" },
  { id: "modern", name: "Modern", preview: "border-slate-400" },
  { id: "fantasy", name: "Fantasy", preview: "border-purple-500" },
  { id: "sports", name: "Sports", preview: "border-green-500" },
  { id: "neon", name: "Neon", preview: "border-cyan-400" },
  { id: "vintage", name: "Vintage", preview: "border-orange-700" },
];

const borderColors = [
  { id: "#ffd700", name: "Gold" },
  { id: "#c0c0c0", name: "Silver" },
  { id: "#cd7f32", name: "Bronze" },
  { id: "#e5e4e2", name: "Platinum" },
  { id: "#b9f2ff", name: "Diamond" },
  { id: "#50c878", name: "Emerald" },
  { id: "#e0115f", name: "Ruby" },
  { id: "#0f52ba", name: "Sapphire" },
];

export function CollectionManager({
  onSelectCollection,
  selectedCollectionId,
  mode = "select",
}: CollectionManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
    theme: "",
    borderStyle: "classic",
    borderColor: "#ffd700",
    maxCards: 100,
  });

  const utils = trpc.useUtils();
  
  const { data: collections, isLoading } = trpc.collections.list.useQuery();
  
  const createMutation = trpc.collections.create.useMutation({
    onSuccess: () => {
      toast.success("Collection created!");
      setIsCreateOpen(false);
      setNewCollection({
        name: "",
        description: "",
        theme: "",
        borderStyle: "classic",
        borderColor: "#ffd700",
        maxCards: 100,
      });
      utils.collections.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.collections.delete.useMutation({
    onSuccess: () => {
      toast.success("Collection deleted");
      utils.collections.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreate = () => {
    if (!newCollection.name.trim()) {
      toast.error("Please enter a collection name");
      return;
    }
    createMutation.mutate(newCollection);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-primary" />
          <Label className="text-sm font-medium">Card Collection</Label>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>
                Organize your cards into themed collections with custom borders and numbering.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Collection Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., NBA Legends 2024"
                  value={newCollection.name}
                  onChange={(e) =>
                    setNewCollection({ ...newCollection, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your collection..."
                  value={newCollection.description}
                  onChange={(e) =>
                    setNewCollection({
                      ...newCollection,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Border Style</Label>
                  <Select
                    value={newCollection.borderStyle}
                    onValueChange={(value) =>
                      setNewCollection({ ...newCollection, borderStyle: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {borderStyles.map((style) => (
                        <SelectItem key={style.id} value={style.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "w-4 h-4 rounded border-2",
                                style.preview
                              )}
                            />
                            {style.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Border Color</Label>
                  <Select
                    value={newCollection.borderColor}
                    onValueChange={(value) =>
                      setNewCollection({ ...newCollection, borderColor: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {borderColors.map((color) => (
                        <SelectItem key={color.id} value={color.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: color.id }}
                            />
                            {color.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxCards">Max Cards in Collection</Label>
                <Select
                  value={newCollection.maxCards.toString()}
                  onValueChange={(value) =>
                    setNewCollection({
                      ...newCollection,
                      maxCards: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 cards</SelectItem>
                    <SelectItem value="50">50 cards</SelectItem>
                    <SelectItem value="100">100 cards</SelectItem>
                    <SelectItem value="200">200 cards</SelectItem>
                    <SelectItem value="500">500 cards</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Collection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Collection List */}
      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {/* No Collection Option */}
          <Card
            className={cn(
              "cursor-pointer transition-all hover:bg-muted/50",
              selectedCollectionId === null && "ring-2 ring-primary"
            )}
            onClick={() => onSelectCollection?.(null)}
          >
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <FolderPlus className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">No Collection</p>
                  <p className="text-xs text-muted-foreground">
                    Card won't be added to any collection
                  </p>
                </div>
              </div>
              {selectedCollectionId === null && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading collections...
            </div>
          ) : collections?.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No collections yet. Create one to organize your cards!
            </div>
          ) : (
            collections?.map((collection) => (
              <Card
                key={collection.id}
                className={cn(
                  "cursor-pointer transition-all hover:bg-muted/50",
                  selectedCollectionId === collection.id && "ring-2 ring-primary"
                )}
                onClick={() => onSelectCollection?.(collection.id)}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center border-2"
                      style={{ borderColor: collection.borderColor || "#ffd700" }}
                    >
                      <Folder className="w-5 h-5" style={{ color: collection.borderColor || "#ffd700" }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{collection.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {collection.cardCount}/{collection.maxCards}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {collection.borderStyle}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedCollectionId === collection.id && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                    {mode === "manage" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate({ id: collection.id });
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Collection badge for displaying on cards
export function CollectionBadge({
  collectionName,
  cardNumber,
  maxCards,
  borderColor,
  className,
}: {
  collectionName: string;
  cardNumber: number;
  maxCards: number;
  borderColor: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        "bg-black/60 backdrop-blur-sm",
        className
      )}
      style={{ borderColor, borderWidth: 1 }}
    >
      <Folder className="w-3 h-3" style={{ color: borderColor }} />
      <span className="text-white">{collectionName}</span>
      <span className="text-white/70">
        #{cardNumber}/{maxCards}
      </span>
    </div>
  );
}
