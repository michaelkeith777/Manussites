import { useAuth } from "@/_core/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Wand2,
  Zap,
  AlertCircle,
  Star,
  Crop,
  Type,
  Clock,
  XCircle,
  Layers,
  Palette,
  Flame,
  Ghost,
  TreePine,
  Sword,
  Rocket,
  Crown,
  Shapes,
  Tv,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { PromptHistory } from "@/components/PromptHistory";
import { ImageEditor } from "@/components/ImageEditor";
import { Watermark } from "@/components/Watermark";
import { ExportDialog } from "@/components/ExportDialog";

type Step = 1 | 2 | 3 | 4 | 5;
type Model = "nano-banana" | "nano-banana-pro" | "grok-imagine" | "openai-4o";
type AspectRatio = "2:3" | "3:4" | "1:1" | "3:2" | "4:3" | "9:16" | "16:9";
type NonSportsCategory = "pop-culture" | "fantasy" | "sci-fi" | "nature" | "mythology" | "horror" | "anime" | "historical" | "abstract" | "all";
type Style = "realistic" | "dynamic" | "vintage" | "modern" | "artistic" | "action";

interface NonSportsTopic {
  topic: string;
  subjectName: string;
  category: string;
  description: string;
  visualDescription: string;
  tags: string;
  score: number;
}

interface GeneratedImage {
  taskId: string;
  status: string;
  imageUrl?: string;
  error?: string;
  model?: string;
}

const stepTitles = {
  1: "Choose Topic",
  2: "Generate Prompt",
  3: "Configure Generation",
  4: "Generating Images",
  5: "Select & Download",
};

const categoryConfig: Record<NonSportsCategory, { label: string; icon: React.ReactNode; color: string }> = {
  "all": { label: "All Categories", icon: <Sparkles className="w-4 h-4" />, color: "bg-primary/20 text-primary border-primary/30" },
  "pop-culture": { label: "🎬 Pop Culture", icon: <Tv className="w-4 h-4" />, color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  "fantasy": { label: "🐉 Fantasy", icon: <Sword className="w-4 h-4" />, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  "sci-fi": { label: "🚀 Sci-Fi", icon: <Rocket className="w-4 h-4" />, color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  "nature": { label: "🌿 Nature", icon: <TreePine className="w-4 h-4" />, color: "bg-green-500/20 text-green-400 border-green-500/30" },
  "mythology": { label: "⚡ Mythology", icon: <Crown className="w-4 h-4" />, color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  "horror": { label: "👻 Horror", icon: <Ghost className="w-4 h-4" />, color: "bg-red-500/20 text-red-400 border-red-500/30" },
  "anime": { label: "🎌 Anime", icon: <Flame className="w-4 h-4" />, color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  "historical": { label: "⚔️ Historical", icon: <Sword className="w-4 h-4" />, color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  "abstract": { label: "🎨 Abstract", icon: <Shapes className="w-4 h-4" />, color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
};

const categoryEmojis: Record<string, string> = {
  "pop-culture": "🎬",
  "fantasy": "🐉",
  "sci-fi": "🚀",
  "nature": "🌿",
  "mythology": "⚡",
  "horror": "👻",
  "anime": "🎌",
  "historical": "⚔️",
  "abstract": "🎨",
};

export default function NonSportsCreate() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [selectedTopic, setSelectedTopic] = useState<NonSportsTopic | null>(null);
  const [customTopic, setCustomTopic] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [model, setModel] = useState<Model>("nano-banana");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("2:3");
  const [imageCount, setImageCount] = useState(4);
  
  // Multi-model comparison mode
  const [multiModelMode, setMultiModelMode] = useState(false);
  const [selectedModels, setSelectedModels] = useState<Set<Model>>(() => new Set<Model>(["nano-banana", "nano-banana-pro", "grok-imagine", "openai-4o"]));
  const [countPerModel, setCountPerModel] = useState(1);
  const [taskIds, setTaskIds] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [pollingActive, setPollingActive] = useState(false);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  
  // Category filter
  const [categoryFilter, setCategoryFilter] = useState<NonSportsCategory>("all");
  const [artStyle, setArtStyle] = useState<Style>("dynamic");
  
  // Image editor
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
  
  // Watermark
  const [watermarkOpen, setWatermarkOpen] = useState(false);
  const [watermarkImageUrl, setWatermarkImageUrl] = useState<string | null>(null);
  
  // Export dialog
  const [exportOpen, setExportOpen] = useState(false);
  const [exportImageUrl, setExportImageUrl] = useState<string | null>(null);
  const [exportImageName, setExportImageName] = useState<string>("cardking1971-card");

  // Mutations & Queries
  const discoverTrending = trpc.nonSportsTrending.discover.useMutation();
  const generatePrompt = trpc.nonSportsPrompts.generate.useMutation();
  const enhancePrompt = trpc.prompts.enhance.useMutation();
  const generateImages = trpc.images.generate.useMutation();
  const generateMultiModel = trpc.images.generateMultiModel.useMutation();
  const checkStatus = trpc.images.checkStatus.useQuery(
    { taskIds },
    { 
      enabled: pollingActive && taskIds.length > 0,
      refetchInterval: pollingActive ? 3000 : false,
    }
  );
  const toggleFavorite = trpc.images.toggleFavorite.useMutation();
  const savePromptHistory = trpc.promptHistory.save.useMutation();

  // Handle status updates
  useEffect(() => {
    if (checkStatus.data?.results) {
      const newImages = checkStatus.data.results.map((result) => {
        let mappedStatus: "pending" | "success" | "fail" = "pending";
        const status = result.status?.toLowerCase();
        
        if (status === "success" || status === "completed") {
          mappedStatus = "success";
        } else if (status === "fail" || status === "failed" || status === "error") {
          mappedStatus = "fail";
        }
        
        return {
          taskId: result.taskId,
          status: mappedStatus,
          imageUrl: result.imageUrl,
          error: result.error,
        };
      });
      setGeneratedImages(newImages);

      const allDone = newImages.every((img) => img.status === "success" || img.status === "fail");
      const hasSuccessWithUrl = newImages.some((img) => img.status === "success" && img.imageUrl);
      
      if (allDone && pollingActive && newImages.length > 0) {
        setPollingActive(false);
        const successCount = newImages.filter((img) => img.status === "success").length;
        if (successCount > 0) {
          toast.success(`${successCount} image(s) generated successfully!`);
          setStep(5);
        } else {
          toast.error("All image generations failed");
        }
      }
    }
  }, [checkStatus.data, pollingActive]);

  // Check for generation timeout (2 minutes)
  useEffect(() => {
    if (!pollingActive || !generationStartTime) return;
    
    const timeoutCheck = setInterval(() => {
      const elapsed = Date.now() - generationStartTime;
      if (elapsed >= 120000 && !showTimeoutWarning) {
        setShowTimeoutWarning(true);
      }
    }, 5000);
    
    return () => clearInterval(timeoutCheck);
  }, [pollingActive, generationStartTime, showTimeoutWarning]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    if (checkStatus.refetch) {
      checkStatus.refetch();
    }
  };

  // Cancel generation handler
  const handleCancelGeneration = () => {
    setPollingActive(false);
    setGenerationStartTime(null);
    setShowTimeoutWarning(false);
    setStep(3);
    toast.info("Generation cancelled. You can try again.");
  };

  // Handlers
  const handleDiscoverTrending = () => {
    discoverTrending.mutate({ 
      category: categoryFilter,
    });
  };

  const handleGeneratePrompt = async () => {
    const topic = selectedTopic?.topic || customTopic;
    if (!topic) {
      toast.error("Please select or enter a topic");
      return;
    }

    try {
      const result = await generatePrompt.mutateAsync({
        topic,
        subjectName: selectedTopic?.subjectName,
        category: selectedTopic?.category,
        visualDescription: selectedTopic?.visualDescription,
        style: artStyle,
      });
      setPrompt(result.prompt);
      setIsEnhanced(false);
      setStep(2);
    } catch (error) {
      toast.error("Failed to generate prompt");
    }
  };

  const handleEnhancePrompt = async () => {
    if (!prompt) return;
    try {
      const result = await enhancePrompt.mutateAsync({ prompt });
      setPrompt(result.enhancedPrompt);
      setIsEnhanced(true);
      toast.success("Prompt enhanced!");
    } catch (error) {
      toast.error("Failed to enhance prompt");
    }
  };

  const handleToggleModel = (m: Model) => {
    setSelectedModels(prev => {
      const next = new Set(prev);
      if (next.has(m)) {
        if (next.size > 1) next.delete(m);
        else toast.error("At least one model must be selected");
      } else {
        next.add(m);
      }
      return next;
    });
  };

  const handleStartGeneration = async () => {
    try {
      if (multiModelMode) {
        const models = Array.from(selectedModels);
        const result = await generateMultiModel.mutateAsync({
          prompt,
          models,
          aspectRatio,
          countPerModel,
        });
        const ids = result.tasks.map((t: { taskId: string }) => t.taskId);
        setTaskIds(ids);
        setGeneratedImages(result.tasks.map((t: { taskId: string; model: string }) => ({
          taskId: t.taskId,
          status: "pending",
          model: t.model,
        })));
        setPollingActive(true);
        setGenerationStartTime(Date.now());
        setShowTimeoutWarning(false);
        setStep(4);
        
        for (const m of models) {
          savePromptHistory.mutate({
            topic: selectedTopic?.topic || customTopic,
            sport: "non-sports",
            playerName: selectedTopic?.subjectName || undefined,
            team: selectedTopic?.category || undefined,
            prompt,
            enhancedPrompt: isEnhanced ? prompt : undefined,
            artStyle,
            model: m,
            aspectRatio,
          });
        }
      } else {
        const result = await generateImages.mutateAsync({
          prompt,
          model,
          aspectRatio,
          count: imageCount,
        });
        const ids = result.tasks.map((t: { taskId: string }) => t.taskId);
        setTaskIds(ids);
        setGeneratedImages(ids.map((id: string) => ({ taskId: id, status: "pending", model })));
        setPollingActive(true);
        setGenerationStartTime(Date.now());
        setShowTimeoutWarning(false);
        setStep(4);
        
        savePromptHistory.mutate({
          topic: selectedTopic?.topic || customTopic,
          sport: "non-sports",
          playerName: selectedTopic?.subjectName || undefined,
          team: selectedTopic?.category || undefined,
          prompt,
          enhancedPrompt: isEnhanced ? prompt : undefined,
          artStyle,
          model,
          aspectRatio,
        });
      }
    } catch (error) {
      toast.error("Failed to start image generation");
    }
  };

  const handleToggleSelect = (taskId: string) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleDownloadSelected = async () => {
    const selectedImgs = generatedImages.filter(img => selectedImages.has(img.taskId) && img.imageUrl);
    
    if (selectedImgs.length === 0) {
      toast.error("No images selected for download");
      return;
    }
    
    toast.info(`Downloading ${selectedImgs.length} image(s)...`);
    let downloadedCount = 0;
    
    for (const img of selectedImgs) {
      if (!img.imageUrl) continue;
      
      try {
        const response = await fetch(img.imageUrl);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `cardking1971-card-${img.taskId.slice(0, 8)}.png`;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          downloadedCount++;
          await new Promise(resolve => setTimeout(resolve, 300));
          continue;
        }
      } catch (error) {
        console.log("Direct fetch failed, trying alternative...");
      }
      
      try {
        const a = document.createElement('a');
        a.href = img.imageUrl;
        a.download = `cardking1971-card-${img.taskId.slice(0, 8)}.png`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        downloadedCount++;
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error("Download failed:", error);
        window.open(img.imageUrl, '_blank');
        downloadedCount++;
      }
    }
    
    if (downloadedCount > 0) {
      toast.success(`Downloaded ${downloadedCount} image(s) - check your downloads folder`);
    } else {
      toast.error("No images to download");
    }
  };

  // Calculate progress
  const completedCount = generatedImages.filter(
    (img) => img.status === "success" || img.status === "fail"
  ).length;
  const progressPercent = taskIds.length > 0 ? (completedCount / taskIds.length) * 100 : 0;

  // Filter topics
  const filteredTopics = discoverTrending.data?.topics || [];

  // Auth loading
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
                <Palette className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to start creating amazing non-sports trading cards with AI.
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
        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {([1, 2, 3, 4, 5] as Step[]).map((s, index) => (
              <div key={s} className="flex items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: step === s ? 1.1 : 1,
                    backgroundColor: step >= s ? "var(--primary)" : "var(--muted)",
                  }}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    step >= s ? "text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </motion.div>
                {index < 4 && (
                  <div
                    className={cn(
                      "w-12 lg:w-24 h-1 mx-2 rounded-full transition-colors",
                      step > s ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            {([1, 2, 3, 4, 5] as Step[]).map((s) => (
              <span key={s} className={cn("text-center", step === s && "text-primary font-medium")}>
                {stepTitles[s]}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Choose Topic */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-primary" />
                      Choose Your Topic
                    </CardTitle>
                    <PromptHistory onSelectPrompt={(item) => {
                      if (item.playerName) {
                        setSelectedTopic({
                          topic: item.topic,
                          subjectName: item.playerName,
                          category: item.team || "all",
                          description: "",
                          visualDescription: "",
                          tags: "",
                          score: 100,
                        });
                        setCustomTopic("");
                      } else {
                        setSelectedTopic(null);
                        setCustomTopic(item.topic);
                      }
                      setPrompt(item.enhancedPrompt || item.prompt);
                      setIsEnhanced(!!item.enhancedPrompt);
                      if (item.artStyle) setArtStyle(item.artStyle as Style);
                      setModel(item.model);
                      setAspectRatio(item.aspectRatio as AspectRatio);
                      setStep(2);
                    }} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(categoryConfig) as NonSportsCategory[]).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={cn(
                            "px-3 py-2 rounded-lg border text-sm transition-all flex items-center gap-2",
                            categoryFilter === cat
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          {categoryConfig[cat].icon}
                          {categoryConfig[cat].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Discover Button */}
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleDiscoverTrending}
                      disabled={discoverTrending.isPending}
                      className="glow-purple-sm"
                    >
                      {discoverTrending.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4 mr-2" />
                      )}
                      Discover Trending Topics
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      AI finds the hottest non-sports topics for card artwork
                    </span>
                  </div>

                  {/* Topics Grid */}
                  {filteredTopics.length > 0 && (
                    <ScrollArea className="h-[350px] pr-4">
                      <div className="grid gap-3">
                        {filteredTopics.map((topic: NonSportsTopic, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <button
                              onClick={() => {
                                setSelectedTopic(topic);
                                setCustomTopic("");
                              }}
                              className={cn(
                                "w-full p-4 rounded-lg border text-left transition-all",
                                selectedTopic?.topic === topic.topic
                                  ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                                  : "border-border hover:border-primary/50 bg-card"
                              )}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">
                                      {categoryEmojis[topic.category] || "✨"}
                                    </span>
                                    <h4 className="font-semibold">{topic.subjectName}</h4>
                                    <span className={cn(
                                      "text-xs px-2 py-0.5 rounded border",
                                      categoryConfig[topic.category as NonSportsCategory]?.color || "bg-muted text-muted-foreground"
                                    )}>
                                      {topic.category}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium text-primary mb-1">
                                    {topic.topic}
                                  </p>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {topic.description}
                                  </p>
                                  {topic.tags && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {topic.tags.split(",").slice(0, 4).map((tag, i) => (
                                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                          {tag.trim()}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  <span className="text-xs font-medium text-yellow-500">
                                    {topic.score}
                                  </span>
                                </div>
                              </div>
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  {discoverTrending.isPending && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Discovering trending topics...</span>
                    </div>
                  )}

                  {/* Custom Topic Input */}
                  <div className="space-y-2">
                    <Label>Or enter your own topic</Label>
                    <Input
                      placeholder="e.g., Bigfoot running in the woods, dragon breathing fire, cyberpunk city at night..."
                      value={customTopic}
                      onChange={(e) => {
                        setCustomTopic(e.target.value);
                        setSelectedTopic(null);
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Type anything you can imagine — fantasy creatures, historical figures, sci-fi scenes, nature, abstract art, and more!
                    </p>
                  </div>

                  {/* Art Style Selection */}
                  <div className="space-y-2">
                    <Label>Art Style</Label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {(["realistic", "dynamic", "vintage", "modern", "artistic", "action"] as Style[]).map((style) => (
                        <button
                          key={style}
                          onClick={() => setArtStyle(style)}
                          className={cn(
                            "p-2 rounded-lg border text-sm capitalize transition-all",
                            artStyle === style
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Next Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleGeneratePrompt}
                      disabled={!selectedTopic && !customTopic || generatePrompt.isPending}
                    >
                      {generatePrompt.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4 mr-2" />
                      )}
                      Generate Prompt
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Review/Edit Prompt */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-primary" />
                    Review & Enhance Prompt
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Generated Prompt</Label>
                      {isEnhanced && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Enhanced
                        </span>
                      )}
                    </div>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={handleEnhancePrompt}
                      disabled={enhancePrompt.isPending || isEnhanced}
                    >
                      {enhancePrompt.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      {isEnhanced ? "Already Enhanced" : "Enhance with AI"}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Optional: AI will add more detail and artistic flair
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button onClick={() => setStep(3)}>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Configure Generation */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Configure Generation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Generation Mode Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" />
                      <div>
                        <div className="font-medium text-sm">Multi-Model Compare</div>
                        <div className="text-xs text-muted-foreground">Generate with multiple AI models at once</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setMultiModelMode(!multiModelMode)}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        multiModelMode ? "bg-primary" : "bg-muted-foreground/30"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        multiModelMode ? "translate-x-6" : "translate-x-1"
                      )} />
                    </button>
                  </div>

                  {/* Model Selection */}
                  <div className="space-y-3">
                    <Label>{multiModelMode ? "Select Models to Compare" : "AI Model"}</Label>
                    
                    {multiModelMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        {(["nano-banana", "nano-banana-pro", "grok-imagine", "openai-4o"] as Model[]).map((m) => (
                          <button
                            key={m}
                            onClick={() => handleToggleModel(m)}
                            className={cn(
                              "p-3 rounded-lg border text-left transition-all",
                              selectedModels.has(m)
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50 opacity-60"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-4 h-4 rounded border-2 flex items-center justify-center",
                                selectedModels.has(m) ? "border-primary bg-primary" : "border-muted-foreground"
                              )}>
                                {selectedModels.has(m) && <Check className="w-3 h-3 text-primary-foreground" />}
                              </div>
                              <div>
                                <div className="font-medium text-sm capitalize">
                                  {m === "nano-banana" ? "Nano Banana" : m === "nano-banana-pro" ? "Nano Banana Pro" : m === "grok-imagine" ? "Grok Imagine" : "OpenAI 4o"}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <RadioGroup
                        value={model}
                        onValueChange={(v) => setModel(v as Model)}
                        className="grid gap-3"
                      >
                        <Label
                          htmlFor="ns-nano-banana"
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                            model === "nano-banana" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                          )}
                        >
                          <RadioGroupItem value="nano-banana" id="ns-nano-banana" />
                          <div>
                            <div className="font-medium">Nano Banana</div>
                            <div className="text-sm text-muted-foreground">Google's fast generation (~$0.02/image)</div>
                          </div>
                        </Label>
                        <Label
                          htmlFor="ns-nano-banana-pro"
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                            model === "nano-banana-pro" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                          )}
                        >
                          <RadioGroupItem value="nano-banana-pro" id="ns-nano-banana-pro" />
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              Nano Banana Pro
                              <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">Recommended</span>
                            </div>
                            <div className="text-sm text-muted-foreground">Higher quality, detailed artwork (~$0.04/image)</div>
                          </div>
                        </Label>
                        <Label
                          htmlFor="ns-grok-imagine"
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                            model === "grok-imagine" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                          )}
                        >
                          <RadioGroupItem value="grok-imagine" id="ns-grok-imagine" />
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              Grok Imagine
                              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">xAI</span>
                            </div>
                            <div className="text-sm text-muted-foreground">xAI's multimodal model, 6 images per request (~$0.02)</div>
                          </div>
                        </Label>
                        <Label
                          htmlFor="ns-openai-4o"
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                            model === "openai-4o" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                          )}
                        >
                          <RadioGroupItem value="openai-4o" id="ns-openai-4o" />
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              OpenAI 4o
                              <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">GPT-Image-1</span>
                            </div>
                            <div className="text-sm text-muted-foreground">Precise text rendering, consistent styles (~$0.03/image)</div>
                          </div>
                        </Label>
                      </RadioGroup>
                    )}

                    {multiModelMode && (
                      <p className="text-xs text-muted-foreground">
                        {selectedModels.size} model{selectedModels.size !== 1 ? "s" : ""} selected — total: {selectedModels.size * countPerModel} image{selectedModels.size * countPerModel !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>

                  {/* Aspect Ratio */}
                  <div className="space-y-3">
                    <Label>Aspect Ratio (Card Sizes)</Label>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                      {(["2:3", "3:4", "1:1", "3:2", "4:3", "9:16", "16:9"] as AspectRatio[]).map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => setAspectRatio(ratio)}
                          className={cn(
                            "p-2 rounded-lg border text-sm transition-all",
                            aspectRatio === ratio
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50",
                            ratio === "2:3" && "ring-1 ring-yellow-500/50"
                          )}
                        >
                          {ratio}
                          {ratio === "2:3" && (
                            <div className="text-[10px] text-yellow-500">Standard</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Count */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{multiModelMode ? "Variations per Model" : "Number of Variations"}</Label>
                      <span className="text-sm font-medium text-primary">
                        {multiModelMode ? countPerModel : imageCount}
                      </span>
                    </div>
                    <Slider
                      value={[multiModelMode ? countPerModel : imageCount]}
                      onValueChange={([v]) => multiModelMode ? setCountPerModel(v) : setImageCount(v)}
                      min={1}
                      max={multiModelMode ? 4 : 10}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1</span>
                      <span>{multiModelMode ? "4" : "10"}</span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleStartGeneration}
                      disabled={generateImages.isPending || generateMultiModel.isPending}
                      className="glow-purple-sm"
                    >
                      {(generateImages.isPending || generateMultiModel.isPending) ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : multiModelMode ? (
                        <Layers className="w-4 h-4 mr-2" />
                      ) : (
                        <Zap className="w-4 h-4 mr-2" />
                      )}
                      {multiModelMode
                        ? `Compare ${selectedModels.size} Models (${selectedModels.size * countPerModel} images)`
                        : `Generate ${imageCount} Image${imageCount > 1 ? "s" : ""}`
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Progress */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    Generating Your Cards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {completedCount} / {taskIds.length} completed
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {generatedImages.map((img, index) => (
                      <motion.div
                        key={img.taskId}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                      >
                        <div className={cn(
                          "aspect-[2/3] rounded-lg border-2 flex items-center justify-center",
                          img.status === "pending" && "border-dashed border-muted animate-pulse bg-muted/20",
                          img.status === "success" && "border-green-500 bg-green-500/10",
                          img.status === "fail" && "border-red-500 bg-red-500/10"
                        )}>
                          {img.status === "pending" && (
                            <div className="text-center">
                              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
                              {img.model && (
                                <p className="text-xs text-muted-foreground mt-2 capitalize">{img.model.replace(/-/g, " ")}</p>
                              )}
                            </div>
                          )}
                          {img.status === "success" && img.imageUrl && (
                            <img
                              src={img.imageUrl}
                              alt={`Generated ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          )}
                          {img.status === "fail" && (
                            <div className="text-center p-2">
                              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                              <span className="text-xs text-red-400">Failed</span>
                            </div>
                          )}
                        </div>
                        {img.model && (
                          <div className={cn(
                            "absolute top-1 left-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md backdrop-blur-sm",
                            img.model === "nano-banana" && "bg-purple-500/80 text-white",
                            img.model === "nano-banana-pro" && "bg-primary/80 text-white",
                            img.model === "grok-imagine" && "bg-blue-500/80 text-white",
                            img.model === "openai-4o" && "bg-green-500/80 text-white"
                          )}>
                            {img.model === "nano-banana" ? "Nano" : img.model === "nano-banana-pro" ? "Pro" : img.model === "grok-imagine" ? "Grok" : "OpenAI"}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Timeout Warning */}
                  {showTimeoutWarning && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30"
                    >
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-amber-500">Taking longer than expected</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            The AI is still working on your images. This can happen during high demand periods.
                          </p>
                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowTimeoutWarning(false)}
                            >
                              Continue Waiting
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={handleCancelGeneration}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Status Message and Refresh Button */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Please wait while the AI generates your card artwork...
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleManualRefresh}
                      disabled={checkStatus.isFetching}
                    >
                      <RefreshCw className={cn("w-4 h-4 mr-1", checkStatus.isFetching && "animate-spin")} />
                      Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 5: Select & Download */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-primary" />
                    Select & Download Your Cards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {generatedImages
                      .filter((img) => img.status === "success" && img.imageUrl)
                      .map((img, index) => (
                        <motion.div
                          key={img.taskId}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative group"
                        >
                          <button
                            onClick={() => handleToggleSelect(img.taskId)}
                            className={cn(
                              "w-full aspect-[2/3] rounded-lg overflow-hidden border-2 transition-all",
                              selectedImages.has(img.taskId)
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-transparent hover:border-primary/50"
                            )}
                          >
                            <img
                              src={img.imageUrl}
                              alt={`Generated ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {selectedImages.has(img.taskId) && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-4 h-4 text-primary-foreground" />
                              </div>
                            )}
                            {img.model && (
                              <div className={cn(
                                "absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm shadow-sm",
                                img.model === "nano-banana" && "bg-purple-500/90 text-white",
                                img.model === "nano-banana-pro" && "bg-primary/90 text-white",
                                img.model === "grok-imagine" && "bg-blue-500/90 text-white",
                                img.model === "openai-4o" && "bg-green-500/90 text-white"
                              )}>
                                {img.model === "nano-banana" ? "Nano Banana" : img.model === "nano-banana-pro" ? "Nano Pro" : img.model === "grok-imagine" ? "Grok" : "OpenAI 4o"}
                              </div>
                            )}
                          </button>
                          {/* Edit button on hover */}
                          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="w-full text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingImageUrl(img.imageUrl || null);
                                setEditorOpen(true);
                              }}
                            >
                              <Crop className="w-3 h-3 mr-1" />
                              Edit & Crop
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="w-full text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setWatermarkImageUrl(img.imageUrl || null);
                                setWatermarkOpen(true);
                              }}
                            >
                              <Type className="w-3 h-3 mr-1" />
                              Watermark
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="w-full text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExportImageUrl(img.imageUrl || null);
                                setExportImageName(`cardking1971-card-${index + 1}`);
                                setExportOpen(true);
                              }}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Export
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {selectedImages.size} image{selectedImages.size !== 1 ? "s" : ""} selected
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setStep(1);
                          setSelectedTopic(null);
                          setCustomTopic("");
                          setPrompt("");
                          setTaskIds([]);
                          setGeneratedImages([]);
                          setSelectedImages(new Set());
                        }}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Create More
                      </Button>
                      <Button
                        onClick={handleDownloadSelected}
                        disabled={selectedImages.size === 0}
                        className="glow-purple-sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Selected
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Editor Modal */}
        {editingImageUrl && (
          <ImageEditor
            imageUrl={editingImageUrl}
            isOpen={editorOpen}
            onClose={() => {
              setEditorOpen(false);
              setEditingImageUrl(null);
            }}
          />
        )}

        {/* Watermark Modal */}
        {watermarkImageUrl && (
          <Watermark
            imageUrl={watermarkImageUrl}
            isOpen={watermarkOpen}
            onClose={() => {
              setWatermarkOpen(false);
              setWatermarkImageUrl(null);
            }}
          />
        )}

        {/* Export Dialog */}
        {exportImageUrl && (
          <ExportDialog
            open={exportOpen}
            onOpenChange={(open) => {
              setExportOpen(open);
              if (!open) setExportImageUrl(null);
            }}
            imageUrl={exportImageUrl}
            imageName={exportImageName}
          />
        )}
      </div>
    </AppLayout>
  );
}
