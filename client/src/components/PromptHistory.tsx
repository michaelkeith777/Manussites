import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Clock,
  Trash2,
  RefreshCw,
  Sparkles,
  X,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface PromptHistoryItem {
  id: number;
  topic: string;
  sport: string | null;
  playerName: string | null;
  team: string | null;
  prompt: string;
  enhancedPrompt: string | null;
  artStyle: string | null;
  model: "nano-banana" | "nano-banana-pro" | "grok-imagine" | "openai-4o";
  aspectRatio: string;
  usageCount: number;
  lastUsedAt: Date;
  createdAt: Date;
}

interface PromptHistoryProps {
  onSelectPrompt: (item: PromptHistoryItem) => void;
}

export function PromptHistory({ onSelectPrompt }: PromptHistoryProps) {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: history, isLoading } = trpc.promptHistory.list.useQuery(
    { limit: 20 },
    { enabled: open }
  );

  const deletePrompt = trpc.promptHistory.delete.useMutation({
    onSuccess: () => {
      utils.promptHistory.list.invalidate();
      toast.success("Prompt deleted from history");
    },
    onError: () => {
      toast.error("Failed to delete prompt");
    },
  });

  const clearHistory = trpc.promptHistory.clear.useMutation({
    onSuccess: () => {
      utils.promptHistory.list.invalidate();
      toast.success("History cleared");
    },
    onError: () => {
      toast.error("Failed to clear history");
    },
  });

  const handleSelect = (item: PromptHistoryItem) => {
    onSelectPrompt(item);
    setOpen(false);
    toast.success("Prompt loaded from history");
  };

  const getSportEmoji = (sport: string | null) => {
    switch (sport) {
      case "basketball":
        return "🏀";
      case "football":
        return "🏈";
      case "ncaa-basketball":
        return "🎓🏀";
      case "ncaa-football":
        return "🎓🏈";
      default:
        return "⚡";
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-border/50 hover:bg-accent/50"
        >
          <History className="h-4 w-4" />
          History
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background/95 backdrop-blur-xl border-border/50">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Prompt History
          </SheetTitle>
          <SheetDescription>
            Your recently used prompts. Click to reuse.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {history && history.length > 0 && (
            <div className="flex justify-end mb-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your saved prompts. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => clearHistory.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          <ScrollArea className="h-[calc(100vh-200px)]">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 rounded-lg bg-muted/50 animate-pulse"
                  />
                ))}
              </div>
            ) : history && history.length > 0 ? (
              <AnimatePresence mode="popLayout">
                <div className="space-y-3 pr-4">
                  {history.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group relative p-4 rounded-lg border border-border/50",
                        "bg-card/50 hover:bg-card/80 transition-all cursor-pointer",
                        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                      )}
                      onClick={() => handleSelect(item)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">
                              {getSportEmoji(item.sport)}
                            </span>
                            <h4 className="font-medium text-sm truncate">
                              {item.playerName || item.topic}
                            </h4>
                            {item.usageCount > 1 && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                                ×{item.usageCount}
                              </span>
                            )}
                          </div>
                          {item.team && (
                            <p className="text-xs text-muted-foreground mb-1">
                              {item.team}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {item.prompt.slice(0, 150)}...
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(item.lastUsedAt), {
                                addSuffix: true,
                              })}
                            </span>
                            {item.artStyle && (
                              <span className="px-1.5 py-0.5 rounded bg-accent/50 capitalize">
                                {item.artStyle}
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 rounded bg-accent/50">
                              {item.aspectRatio}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePrompt.mutate({ id: item.id });
                            }}
                          >
                            <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                      {item.enhancedPrompt && (
                        <div className="absolute top-2 right-12">
                          <Sparkles className="h-3 w-3 text-yellow-500" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  No history yet
                </h3>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Your generated prompts will appear here
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
