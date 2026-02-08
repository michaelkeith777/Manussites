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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  Heart,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  Wand2,
  Zap,
  AlertCircle,
  Trophy,
  Target,
  Star,
  Users,
  Award,
  GraduationCap,
  Filter,
  Crop,
  Type,
  Clock,
  XCircle,
  Layers,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { PromptHistory } from "@/components/PromptHistory";
import { ImageEditor } from "@/components/ImageEditor";
import { Watermark } from "@/components/Watermark";
import { PromptTemplates } from "@/components/PromptTemplates";
import { promptTemplates, applyTemplate, type PromptTemplate } from "../../../shared/promptTemplates";

import { ExportDialog } from "@/components/ExportDialog";

type Step = 1 | 2 | 3 | 4 | 5;
type Model = "nano-banana" | "nano-banana-pro" | "grok-imagine" | "openai-4o";
type AspectRatio = "2:3" | "3:4" | "1:1" | "3:2" | "4:3" | "9:16" | "16:9";
type Sport = "basketball" | "football" | "ncaa-basketball" | "ncaa-football" | "all";
type Category = "current-news" | "player-highlights" | "legends" | "rookies" | "records" | "march-madness" | "cfp" | "all";
type Style = "realistic" | "dynamic" | "vintage" | "modern" | "artistic" | "action";

interface SportsTopic {
  topic: string;
  playerName: string;
  sport: string;
  category: string;
  description: string;
  visualDescription: string;
  team: string;
  score: number;
}

interface PlayerResult {
  playerName: string;
  team: string;
  sport: string;
  position: string;
  description: string;
  visualDescription: string;
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
  1: "Choose Player/Topic",
  2: "Generate Prompt",
  3: "Configure Generation",
  4: "Generating Images",
  5: "Select & Download",
};

const sportLabels: Record<Sport, string> = {
  all: "All Sports",
  basketball: "🏀 NBA",
  football: "🏈 NFL",
  "ncaa-basketball": "🎓🏀 NCAA Basketball",
  "ncaa-football": "🎓🏈 NCAA Football",
};

const categoryColors: Record<string, string> = {
  "current-news": "bg-red-500/20 text-red-400 border-red-500/30",
  "player-highlights": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "legends": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "rookies": "bg-green-500/20 text-green-400 border-green-500/30",
  "records": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "march-madness": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "cfp": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

const categoryLabels: Record<string, string> = {
  "current-news": "🔥 Hot News",
  "player-highlights": "⭐ Highlights",
  "legends": "🏆 Legends",
  "rookies": "🌟 Rookies",
  "records": "📊 Records",
  "march-madness": "🏀 March Madness",
  "cfp": "🏈 CFP",
};

export default function Create() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [selectedTopic, setSelectedTopic] = useState<SportsTopic | null>(null);
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
  
  // Sports filters
  const [sportFilter, setSportFilter] = useState<Sport>("all");
  const [categoryFilter, setCategoryFilter] = useState<Category>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all-teams");
  const [artStyle, setArtStyle] = useState<Style>("dynamic");
  
  // Player search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"trending" | "search">("trending");
  
  // Image editor
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
  
  // Watermark
  const [watermarkOpen, setWatermarkOpen] = useState(false);
  const [watermarkImageUrl, setWatermarkImageUrl] = useState<string | null>(null);
  
  // Prompt templates
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  

  
  // Export dialog
  const [exportOpen, setExportOpen] = useState(false);
  const [exportImageUrl, setExportImageUrl] = useState<string | null>(null);
  const [exportImageName, setExportImageName] = useState<string>("cardking1971-card");

  // Mutations & Queries
  const discoverTrending = trpc.trending.discover.useMutation();
  const searchPlayer = trpc.trending.searchPlayer.useMutation();
  const teamsQuery = trpc.trending.getTeams.useQuery({ sport: sportFilter });
  const generatePrompt = trpc.prompts.generate.useMutation();
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

  // Load recreate data from sessionStorage
  useEffect(() => {
    const recreatePrompt = sessionStorage.getItem("recreatePrompt");
    const recreateTopic = sessionStorage.getItem("recreateTopic");
    if (recreatePrompt) {
      setPrompt(recreatePrompt);
      if (recreateTopic) {
        setCustomTopic(recreateTopic);
      }
      setStep(2);
      sessionStorage.removeItem("recreatePrompt");
      sessionStorage.removeItem("recreateTopic");
    }
  }, []);

  // Handle status updates
  useEffect(() => {
    if (checkStatus.data?.results) {
      console.log("[Create] Status check results:", checkStatus.data.results);
      
      const newImages = checkStatus.data.results.map((result) => {
        // Map API status to our internal status
        // API returns: waiting, queuing, generating, success, fail
        // Also handle: completed (from DB), unknown
        let mappedStatus: "pending" | "success" | "fail" = "pending";
        const status = result.status?.toLowerCase();
        
        if (status === "success" || status === "completed") {
          mappedStatus = "success";
        } else if (status === "fail" || status === "failed" || status === "error") {
          mappedStatus = "fail";
        }
        // waiting, queuing, generating, pending, processing all stay as "pending"
        
        console.log(`[Create] Task ${result.taskId}: API status="${result.status}" -> mapped="${mappedStatus}", imageUrl=${result.imageUrl ? 'present' : 'none'}`);
        
        return {
          taskId: result.taskId,
          status: mappedStatus,
          imageUrl: result.imageUrl,
          error: result.error,
        };
      });
      setGeneratedImages(newImages);

      // Check if all done (success or fail)
      const allDone = newImages.every((img) => img.status === "success" || img.status === "fail");
      const hasSuccessWithUrl = newImages.some((img) => img.status === "success" && img.imageUrl);
      
      console.log(`[Create] allDone=${allDone}, hasSuccessWithUrl=${hasSuccessWithUrl}, pollingActive=${pollingActive}, count=${newImages.length}`);
      
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
      if (elapsed >= 120000 && !showTimeoutWarning) { // 2 minutes
        setShowTimeoutWarning(true);
      }
    }, 5000);
    
    return () => clearInterval(timeoutCheck);
  }, [pollingActive, generationStartTime, showTimeoutWarning]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    if (checkStatus.refetch) {
      checkStatus.refetch();
      toast.info("Refreshing status...");
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

  // Get filtered teams
  const teams = useMemo(() => {
    return teamsQuery.data?.teams || [];
  }, [teamsQuery.data]);

  // Handlers
  const handleDiscoverTrending = () => {
    discoverTrending.mutate({ 
      sport: sportFilter, 
      category: categoryFilter,
      team: teamFilter === "all-teams" ? undefined : teamFilter,
    });
  };

  const handlePlayerSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a player name to search");
      return;
    }
    searchPlayer.mutate({
      query: searchQuery,
      sport: sportFilter,
    });
  };

  const handleSelectPlayer = (player: PlayerResult) => {
    setSelectedTopic({
      topic: `${player.playerName} - ${player.position}`,
      playerName: player.playerName,
      sport: player.sport,
      category: "player-highlights",
      description: player.description,
      visualDescription: player.visualDescription,
      team: player.team,
      score: player.score,
    });
    setCustomTopic("");
  };

  const handleGeneratePrompt = async () => {
    const topic = selectedTopic?.topic || customTopic;
    if (!topic) {
      toast.error("Please select or enter a topic");
      return;
    }

    try {
      // If a template is selected, apply it directly
      if (selectedTemplate) {
        const playerName = selectedTopic?.playerName || customTopic;
        const sport = selectedTopic?.sport || sportFilter;
        const templatePrompt = applyTemplate(selectedTemplate, playerName, sport);
        setPrompt(templatePrompt);
        setIsEnhanced(false);
        setStep(2);
        toast.success(`Applied "${selectedTemplate.name}" template`);
        return;
      }
      
      const result = await generatePrompt.mutateAsync({
        topic,
        playerName: selectedTopic?.playerName,
        team: selectedTopic?.team,
        sport: selectedTopic?.sport as "basketball" | "football" | undefined,
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
        // Multi-model generation
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
        
        // Save prompt to history for each model
        for (const m of models) {
          savePromptHistory.mutate({
            topic: selectedTopic?.topic || customTopic,
            sport: selectedTopic?.sport || sportFilter,
            playerName: selectedTopic?.playerName || undefined,
            team: selectedTopic?.team || (teamFilter !== "all-teams" ? teamFilter : undefined),
            prompt,
            enhancedPrompt: isEnhanced ? prompt : undefined,
            artStyle,
            model: m,
            aspectRatio,
          });
        }
      } else {
        // Single model generation
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
        
        // Save prompt to history
        savePromptHistory.mutate({
          topic: selectedTopic?.topic || customTopic,
          sport: selectedTopic?.sport || sportFilter,
          playerName: selectedTopic?.playerName || undefined,
          team: selectedTopic?.team || (teamFilter !== "all-teams" ? teamFilter : undefined),
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
        // Try direct fetch first
        const response = await fetch(img.imageUrl);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `sports-card-${img.taskId.slice(0, 8)}.png`;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          downloadedCount++;
          // Small delay between downloads to prevent browser blocking
          await new Promise(resolve => setTimeout(resolve, 300));
          continue;
        }
      } catch (error) {
        console.log("Direct fetch failed, trying alternative...");
      }
      
      // Fallback: anchor download
      try {
        const a = document.createElement('a');
        a.href = img.imageUrl;
        a.download = `sports-card-${img.taskId.slice(0, 8)}.png`;
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

  // Filter topics by sport
  const filteredTopics = discoverTrending.data?.topics || [];
  const searchResults = searchPlayer.data?.players || [];

  // Handler for selecting prompt from history
  const handleSelectFromHistory = (item: {
    topic: string;
    sport: string | null;
    playerName: string | null;
    team: string | null;
    prompt: string;
    enhancedPrompt: string | null;
    artStyle: string | null;
    model: "nano-banana" | "nano-banana-pro" | "grok-imagine" | "openai-4o";
    aspectRatio: string;
  }) => {
    // Set the topic
    if (item.playerName) {
      setSelectedTopic({
        topic: item.topic,
        playerName: item.playerName,
        sport: item.sport || "all",
        category: "player-highlights",
        description: "",
        visualDescription: "",
        team: item.team || "",
        score: 100,
      });
      setCustomTopic("");
    } else {
      setSelectedTopic(null);
      setCustomTopic(item.topic);
    }
    
    // Set the prompt
    setPrompt(item.enhancedPrompt || item.prompt);
    setIsEnhanced(!!item.enhancedPrompt);
    
    // Set configuration
    if (item.artStyle) setArtStyle(item.artStyle as Style);
    setModel(item.model);
    setAspectRatio(item.aspectRatio as AspectRatio);
    if (item.sport) setSportFilter(item.sport as Sport);
    
    // Go to step 2 (prompt editing)
    setStep(2);
  };

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
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to start creating amazing sports trading cards with AI.
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
                      <Trophy className="w-5 h-5 text-primary" />
                      Choose Your Sports Topic
                    </CardTitle>
                    <div className="flex gap-2">
                      <PromptTemplates 
                        onSelectTemplate={(t) => setSelectedTemplate(t)} 
                        selectedTemplateId={selectedTemplate?.id}
                      />
                      <PromptHistory onSelectPrompt={handleSelectFromHistory} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search Mode Toggle */}
                  <Tabs value={searchMode} onValueChange={(v) => setSearchMode(v as "trending" | "search")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="trending" className="gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Discover Trending
                      </TabsTrigger>
                      <TabsTrigger value="search" className="gap-2">
                        <Search className="w-4 h-4" />
                        Search Player
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Sport Filter - Always visible */}
                  <div className="space-y-2">
                    <Label>Sport League</Label>
                    <div className="flex flex-wrap gap-2">
                      {(["all", "basketball", "football", "ncaa-basketball", "ncaa-football"] as Sport[]).map((sport) => (
                        <button
                          key={sport}
                          onClick={() => {
                            setSportFilter(sport);
                            setTeamFilter("all-teams");
                          }}
                          className={cn(
                            "px-3 py-2 rounded-lg border text-sm transition-all flex items-center gap-2",
                            sportFilter === sport
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          {sport === "ncaa-basketball" || sport === "ncaa-football" ? (
                            <GraduationCap className="w-4 h-4" />
                          ) : sport === "basketball" ? (
                            <span>🏀</span>
                          ) : sport === "football" ? (
                            <span>🏈</span>
                          ) : (
                            <Users className="w-4 h-4" />
                          )}
                          {sportLabels[sport]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {searchMode === "trending" && (
                    <>
                      {/* Category & Team Filters */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as Category)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              <SelectItem value="current-news">🔥 Current News</SelectItem>
                              <SelectItem value="player-highlights">⭐ Player Highlights</SelectItem>
                              <SelectItem value="legends">🏆 Legends</SelectItem>
                              <SelectItem value="rookies">🌟 Rising Stars & Rookies</SelectItem>
                              <SelectItem value="records">📊 Records & Milestones</SelectItem>
                              {(sportFilter === "ncaa-basketball" || sportFilter === "all") && (
                                <SelectItem value="march-madness">🏀 March Madness</SelectItem>
                              )}
                              {(sportFilter === "ncaa-football" || sportFilter === "all") && (
                                <SelectItem value="cfp">🏈 College Football Playoff</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Filter by Team
                          </Label>
                          <Select value={teamFilter} onValueChange={setTeamFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="All teams" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all-teams">All Teams</SelectItem>
                              {teams.map((team, index) => (
                                <SelectItem key={`${team.name}-${team.league}-${index}`} value={team.name}>
                                  {team.name} ({team.league})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                          Discover Hot Topics
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          AI analyzes trending sports news {teamFilter && teamFilter !== "all-teams" && `for ${teamFilter}`}
                        </span>
                      </div>

                      {/* Topics Grid */}
                      {filteredTopics.length > 0 && (
                        <ScrollArea className="h-[350px] pr-4">
                          <div className="grid gap-3">
                            {filteredTopics.map((topic: SportsTopic, index: number) => (
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
                                          {topic.sport === "basketball" ? "🏀" : 
                                           topic.sport === "football" ? "🏈" :
                                           topic.sport === "ncaa-basketball" ? "🎓🏀" : "🎓🏈"}
                                        </span>
                                        <h4 className="font-semibold">{topic.playerName}</h4>
                                        <span className="text-xs text-muted-foreground">
                                          {topic.team}
                                        </span>
                                      </div>
                                      <p className="text-sm font-medium text-primary mb-1">
                                        {topic.topic}
                                      </p>
                                      <p className="text-sm text-muted-foreground line-clamp-2">
                                        {topic.description}
                                      </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                      <span
                                        className={cn(
                                          "text-xs px-2 py-1 rounded-full border whitespace-nowrap",
                                          categoryColors[topic.category] || "bg-muted"
                                        )}
                                      >
                                        {categoryLabels[topic.category] || topic.category}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3 text-green-500" />
                                        <span className="text-xs font-medium text-green-500">
                                          {topic.score}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </>
                  )}

                  {searchMode === "search" && (
                    <>
                      {/* Player Search Input */}
                      <div className="space-y-2">
                        <Label>Search for a Player</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g., LeBron James, Patrick Mahomes, Caitlin Clark..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handlePlayerSearch()}
                            className="flex-1"
                          />
                          <Button
                            onClick={handlePlayerSearch}
                            disabled={searchPlayer.isPending}
                          >
                            {searchPlayer.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Search className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Search across NBA, NFL, and NCAA players
                        </p>
                      </div>

                      {/* Search Results */}
                      {searchResults.length > 0 && (
                        <ScrollArea className="h-[350px] pr-4">
                          <div className="grid gap-3">
                            {searchResults.map((player: PlayerResult, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                              >
                                <button
                                  onClick={() => handleSelectPlayer(player)}
                                  className={cn(
                                    "w-full p-4 rounded-lg border text-left transition-all",
                                    selectedTopic?.playerName === player.playerName
                                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                                      : "border-border hover:border-primary/50 bg-card"
                                  )}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">
                                          {player.sport === "basketball" ? "🏀" : 
                                           player.sport === "football" ? "🏈" :
                                           player.sport === "ncaa-basketball" ? "🎓🏀" : "🎓🏈"}
                                        </span>
                                        <h4 className="font-semibold">{player.playerName}</h4>
                                        <span className="text-xs px-2 py-0.5 rounded bg-muted">
                                          {player.position}
                                        </span>
                                      </div>
                                      <p className="text-sm text-primary mb-1">
                                        {player.team}
                                      </p>
                                      <p className="text-sm text-muted-foreground line-clamp-2">
                                        {player.description}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3 text-yellow-500" />
                                      <span className="text-xs font-medium text-yellow-500">
                                        {player.score}
                                      </span>
                                    </div>
                                  </div>
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}

                      {searchPlayer.isPending && (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <span className="ml-2 text-muted-foreground">Searching players...</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Custom Topic Input */}
                  <div className="space-y-2">
                    <Label>Or enter your own player/topic</Label>
                    <Input
                      placeholder="e.g., LeBron James slam dunk, Patrick Mahomes touchdown pass..."
                      value={customTopic}
                      onChange={(e) => {
                        setCustomTopic(e.target.value);
                        setSelectedTopic(null);
                      }}
                    />
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

                  {/* Selected Template Indicator */}
                  {selectedTemplate && (
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm">
                          Template: <strong>{selectedTemplate.name}</strong>
                        </span>
                        <span className="text-xs text-muted-foreground">({selectedTemplate.category})</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTemplate(null)}
                      >
                        Clear
                      </Button>
                    </div>
                  )}

                  {/* Next Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleGeneratePrompt}
                      disabled={!selectedTopic && !customTopic || generatePrompt.isPending}
                      className={selectedTemplate ? "glow-purple-sm" : ""}
                    >
                      {generatePrompt.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : selectedTemplate ? (
                        <Sparkles className="w-4 h-4 mr-2" />
                      ) : (
                        <Wand2 className="w-4 h-4 mr-2" />
                      )}
                      {selectedTemplate ? "Apply Template" : "Generate Prompt"}
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
                      /* Multi-model checkbox selection */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {([
                          { id: "nano-banana" as Model, name: "Nano Banana", desc: "Google's fast generation (~$0.02/image)", badge: null, badgeColor: "" },
                          { id: "nano-banana-pro" as Model, name: "Nano Banana Pro", desc: "Higher quality, detailed artwork (~$0.04/image)", badge: "Recommended", badgeColor: "bg-primary/20 text-primary" },
                          { id: "grok-imagine" as Model, name: "Grok Imagine", desc: "xAI's multimodal model (~$0.02)", badge: "xAI", badgeColor: "bg-blue-500/20 text-blue-400" },
                          { id: "openai-4o" as Model, name: "OpenAI 4o", desc: "Precise text rendering (~$0.03/image)", badge: "GPT-Image-1", badgeColor: "bg-green-500/20 text-green-400" },
                        ]).map((m) => (
                          <button
                            key={m.id}
                            onClick={() => handleToggleModel(m.id)}
                            className={cn(
                              "flex items-start gap-3 p-4 rounded-lg border text-left transition-all",
                              selectedModels.has(m.id)
                                ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <div className={cn(
                              "mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                              selectedModels.has(m.id) ? "bg-primary border-primary" : "border-muted-foreground/40"
                            )}>
                              {selectedModels.has(m.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                            </div>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {m.name}
                                {m.badge && (
                                  <span className={cn("text-xs px-2 py-0.5 rounded", m.badgeColor)}>
                                    {m.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">{m.desc}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      /* Single model radio selection */
                      <RadioGroup
                        value={model}
                        onValueChange={(v) => setModel(v as Model)}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <Label
                          htmlFor="nano-banana"
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                            model === "nano-banana" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                          )}
                        >
                          <RadioGroupItem value="nano-banana" id="nano-banana" />
                          <div>
                            <div className="font-medium">Nano Banana</div>
                            <div className="text-sm text-muted-foreground">Google's fast generation (~$0.02/image)</div>
                          </div>
                        </Label>
                        <Label
                          htmlFor="nano-banana-pro"
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                            model === "nano-banana-pro" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                          )}
                        >
                          <RadioGroupItem value="nano-banana-pro" id="nano-banana-pro" />
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              Nano Banana Pro
                              <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">Recommended</span>
                            </div>
                            <div className="text-sm text-muted-foreground">Higher quality, detailed artwork (~$0.04/image)</div>
                          </div>
                        </Label>
                        <Label
                          htmlFor="grok-imagine"
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                            model === "grok-imagine" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                          )}
                        >
                          <RadioGroupItem value="grok-imagine" id="grok-imagine" />
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              Grok Imagine
                              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">xAI</span>
                            </div>
                            <div className="text-sm text-muted-foreground">xAI's multimodal model, 6 images per request (~$0.02)</div>
                          </div>
                        </Label>
                        <Label
                          htmlFor="openai-4o"
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                            model === "openai-4o" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                          )}
                        >
                          <RadioGroupItem value="openai-4o" id="openai-4o" />
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
                    <Label>Aspect Ratio (Trading Card Sizes)</Label>
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

                  {/* Image Count - changes based on mode */}
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
                    Generating Your Sports Cards
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
                        {/* Model label badge */}
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
                      Please wait while the AI generates your sports card artwork...
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
                            {/* Model label badge */}
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
