/**
 * AI Creative Studio — The core UGC ad creative generation page.
 * Users can upload a product image, describe their product, and AI generates
 * a complete ad creative (image + copy). Inspired by AdCreative.ai, Creatify, Pencil.
 */
import { useState, useCallback, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Upload, Sparkles, Wand2, Image as ImageIcon, Type, Zap,
  Download, Copy, Trash2, Eye, RefreshCw, Loader2,
  RectangleHorizontal, Square, RectangleVertical, Smartphone,
  Target, Megaphone, ShoppingBag, Palette, Globe,
} from "lucide-react";

const ASPECT_RATIOS = [
  { value: "1:1", label: "1:1 Square", icon: Square },
  { value: "4:5", label: "4:5 Portrait", icon: RectangleVertical },
  { value: "9:16", label: "9:16 Story", icon: Smartphone },
  { value: "16:9", label: "16:9 Landscape", icon: RectangleHorizontal },
];

const PLATFORMS = [
  { value: "all", label: "All Platforms" },
  { value: "meta", label: "Meta / Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "google", label: "Google Ads" },
  { value: "snapchat", label: "Snapchat" },
  { value: "pinterest", label: "Pinterest" },
];

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual & Fun" },
  { value: "luxury", label: "Luxury & Premium" },
  { value: "urgency", label: "Urgency & FOMO" },
  { value: "storytelling", label: "Storytelling" },
  { value: "educational", label: "Educational" },
];

const STYLES = [
  { value: "modern", label: "Modern & Clean" },
  { value: "bold", label: "Bold & Vibrant" },
  { value: "minimal", label: "Minimalist" },
  { value: "retro", label: "Retro / Vintage" },
  { value: "neon", label: "Neon & Futuristic" },
  { value: "organic", label: "Organic & Natural" },
];

export default function CreativeStudio() {
  const [activeTab, setActiveTab] = useState("generate");
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    id: number;
    imageUrl?: string;
    headline?: string;
    primaryText?: string;
    callToAction?: string;
  } | null>(null);
  const [copyVariations, setCopyVariations] = useState<Array<{
    headline: string;
    primaryText: string;
    callToAction: string;
    hook: string;
  }>>([]);

  // Form state
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [platform, setPlatform] = useState("all");
  const [tone, setTone] = useState("professional");
  const [style, setStyle] = useState("modern");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [customPrompt, setCustomPrompt] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.upload.productImage.useMutation();
  const generateFullAd = trpc.creative.generateFullAd.useMutation();
  const generateCopy = trpc.creative.generateCopy.useMutation();
  const generateImageMutation = trpc.creative.generateImage.useMutation();
  const creditsQuery = trpc.usage.credits.useQuery();

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }

    setProductImageFile(file);

    // Preview
    const reader = new FileReader();
    reader.onload = () => setProductImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setProductImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setProductImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const uploadImage = async (): Promise<string | null> => {
    if (!productImageFile) return null;
    setIsUploading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.readAsDataURL(productImageFile);
      });
      const result = await uploadMutation.mutateAsync({
        fileName: productImageFile.name,
        fileBase64: base64,
        contentType: productImageFile.type,
      });
      return result.url;
    } catch (err) {
      toast.error("Failed to upload image");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateFullAd = async () => {
    if (!productName.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    setIsGenerating(true);
    setGeneratedResult(null);

    try {
      let imageUrl: string | undefined;
      if (productImageFile) {
        const uploaded = await uploadImage();
        imageUrl = uploaded ?? undefined;
      }

      if (!imageUrl && !productImage) {
        // Generate image-only ad without product image
        const result = await generateImageMutation.mutateAsync({
          prompt: `Professional advertising image for ${productName}. ${productDescription || ""}. ${customPrompt || ""}`,
          aspectRatio,
          style,
        });
        setGeneratedResult({
          id: result.id,
          imageUrl: result.imageUrl ?? undefined,
        });

        // Also generate copy
        const copyResult = await generateCopy.mutateAsync({
          productName,
          productDescription: productDescription || productName,
          targetAudience,
          tone,
          platform,
        });
        if (copyResult.variations?.length > 0) {
          setCopyVariations(copyResult.variations);
          setGeneratedResult(prev => prev ? {
            ...prev,
            headline: copyResult.variations[0].headline,
            primaryText: copyResult.variations[0].primaryText,
            callToAction: copyResult.variations[0].callToAction,
          } : null);
        }
      } else {
        const result = await generateFullAd.mutateAsync({
          productImageUrl: imageUrl || productImage || "",
          productName,
          productDescription,
          targetAudience,
          tone,
          platform: platform as any,
          aspectRatio,
          style,
        });
        setGeneratedResult(result);
      }

      creditsQuery.refetch();
      toast.success("Ad creative generated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate ad");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCopyOnly = async () => {
    if (!productName.trim()) {
      toast.error("Please enter a product name");
      return;
    }
    setIsGenerating(true);
    setCopyVariations([]);
    try {
      const result = await generateCopy.mutateAsync({
        productName,
        productDescription: productDescription || productName,
        targetAudience,
        tone,
        platform,
      });
      setCopyVariations(result.variations || []);
      creditsQuery.refetch();
      toast.success("Ad copy generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate copy");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-heading font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              AI Creative Studio
            </h1>
            <p className="text-muted-foreground mt-1">
              Upload a product image and let AI generate stunning ad creatives
            </p>
          </div>
          <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-3">
            <Zap size={16} className="text-amber-400" />
            <span className="text-sm">
              <span className="font-bold text-foreground">{creditsQuery.data?.remaining ?? 0}</span>
              <span className="text-muted-foreground"> / {creditsQuery.data?.monthly ?? 10} credits</span>
            </span>
            <Badge variant="outline" className="text-xs capitalize">{creditsQuery.data?.plan ?? "free"}</Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Input Panel */}
          <div className="lg:col-span-2 space-y-5">
            {/* Product Image Upload */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload size={16} className="text-purple-400" />
                  Product Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer hover:border-purple-500/50 ${
                    productImage ? "border-purple-500/30 bg-purple-500/5" : "border-border"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {productImage ? (
                    <div className="relative p-2">
                      <img
                        src={productImage}
                        alt="Product"
                        className="w-full h-48 object-contain rounded-lg"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProductImage(null);
                          setProductImageFile(null);
                        }}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-destructive/80 text-white hover:bg-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                        <ImageIcon size={24} className="text-purple-400" />
                      </div>
                      <p className="text-sm font-medium mb-1">Drop your product image here</p>
                      <p className="text-xs text-muted-foreground">or click to browse (PNG, JPG, WebP up to 10MB)</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Optional — AI can generate ads without a product image too
                </p>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingBag size={16} className="text-purple-400" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Product Name *</Label>
                  <Input
                    placeholder="e.g., Premium Wireless Earbuds"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Description</Label>
                  <Textarea
                    placeholder="Describe your product, its key features, and what makes it special..."
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    rows={3}
                    className="bg-secondary/50 resize-none"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Target Audience</Label>
                  <Input
                    placeholder="e.g., Tech-savvy millennials, 25-35"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Creative Settings */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette size={16} className="text-purple-400" />
                  Creative Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Platform</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map(p => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TONES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Visual Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Aspect Ratio</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {ASPECT_RATIOS.map(ar => (
                      <button
                        key={ar.value}
                        onClick={() => setAspectRatio(ar.value)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                          aspectRatio === ar.value
                            ? "border-purple-500 bg-purple-500/10 text-purple-400"
                            : "border-border hover:border-purple-500/30"
                        }`}
                      >
                        <ar.icon size={18} />
                        <span className="text-xs">{ar.value}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Custom Instructions (optional)</Label>
                  <Textarea
                    placeholder="Any specific instructions for the AI..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={2}
                    className="bg-secondary/50 resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Generate Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleGenerateFullAd}
                disabled={isGenerating || !productName.trim()}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-600/30 text-base"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Generating Ad Creative...
                  </>
                ) : (
                  <>
                    <Wand2 size={18} className="mr-2" />
                    Generate Full Ad (3 credits)
                  </>
                )}
              </Button>
              <Button
                onClick={handleGenerateCopyOnly}
                disabled={isGenerating || !productName.trim()}
                variant="outline"
                className="w-full"
              >
                <Type size={16} className="mr-2" />
                Generate Copy Only (1 credit)
              </Button>
            </div>
          </div>

          {/* Right: Output Panel */}
          <div className="lg:col-span-3 space-y-5">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-secondary/50 w-full justify-start">
                <TabsTrigger value="generate" className="gap-2">
                  <Wand2 size={14} /> Generated Ad
                </TabsTrigger>
                <TabsTrigger value="copy" className="gap-2">
                  <Type size={14} /> Copy Variations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="generate" className="mt-4">
                {isGenerating ? (
                  <Card className="bg-card border-border">
                    <CardContent className="py-20 text-center">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600/20 to-amber-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                        <Sparkles size={32} className="text-purple-400 animate-spin" style={{ animationDuration: "3s" }} />
                      </div>
                      <h3 className="font-heading font-bold text-lg mb-2">AI is creating your ad...</h3>
                      <p className="text-muted-foreground text-sm">
                        Analyzing product, generating copy, and creating visuals. This usually takes 15-30 seconds.
                      </p>
                      <div className="mt-6 w-48 h-1.5 bg-secondary rounded-full mx-auto overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-600 to-amber-500 rounded-full animate-shimmer" style={{ width: "60%" }} />
                      </div>
                    </CardContent>
                  </Card>
                ) : generatedResult ? (
                  <div className="space-y-4">
                    {/* Generated Image */}
                    {generatedResult.imageUrl && (
                      <Card className="bg-card border-border overflow-hidden">
                        <div className="relative group">
                          <img
                            src={generatedResult.imageUrl}
                            alt="Generated Ad"
                            className="w-full h-auto max-h-[500px] object-contain bg-black/20"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <a
                              href={generatedResult.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                            >
                              <Eye size={20} className="text-white" />
                            </a>
                            <a
                              href={generatedResult.imageUrl}
                              download
                              className="p-3 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                            >
                              <Download size={20} className="text-white" />
                            </a>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Generated Copy */}
                    {(generatedResult.headline || generatedResult.primaryText) && (
                      <Card className="bg-card border-border">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Generated Ad Copy</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {generatedResult.headline && (
                            <div>
                              <Label className="text-xs text-muted-foreground mb-1 block">Headline</Label>
                              <div className="flex items-center gap-2">
                                <p className="font-heading font-bold text-lg flex-1">{generatedResult.headline}</p>
                                <button onClick={() => copyToClipboard(generatedResult.headline!)} className="p-1.5 rounded-lg hover:bg-secondary">
                                  <Copy size={14} className="text-muted-foreground" />
                                </button>
                              </div>
                            </div>
                          )}
                          {generatedResult.primaryText && (
                            <div>
                              <Label className="text-xs text-muted-foreground mb-1 block">Primary Text</Label>
                              <div className="flex items-start gap-2">
                                <p className="text-sm text-foreground/80 flex-1">{generatedResult.primaryText}</p>
                                <button onClick={() => copyToClipboard(generatedResult.primaryText!)} className="p-1.5 rounded-lg hover:bg-secondary shrink-0">
                                  <Copy size={14} className="text-muted-foreground" />
                                </button>
                              </div>
                            </div>
                          )}
                          {generatedResult.callToAction && (
                            <div>
                              <Label className="text-xs text-muted-foreground mb-1 block">Call to Action</Label>
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                {generatedResult.callToAction}
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button onClick={handleGenerateFullAd} variant="outline" className="flex-1">
                        <RefreshCw size={16} className="mr-2" /> Regenerate
                      </Button>
                      {generatedResult.imageUrl && (
                        <a href={generatedResult.imageUrl} download className="flex-1">
                          <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white">
                            <Download size={16} className="mr-2" /> Download
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <Card className="bg-card border-border">
                    <CardContent className="py-20 text-center">
                      <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-6">
                        <Wand2 size={32} className="text-muted-foreground" />
                      </div>
                      <h3 className="font-heading font-bold text-lg mb-2">Ready to Create</h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto">
                        Fill in your product details on the left and click "Generate Full Ad" to create a complete ad creative with AI-generated image and copy.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="copy" className="mt-4">
                {copyVariations.length > 0 ? (
                  <div className="space-y-4">
                    {copyVariations.map((variation, i) => (
                      <Card key={i} className="bg-card border-border hover:border-purple-500/30 transition-colors">
                        <CardContent className="pt-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">Variation {i + 1}</Badge>
                            <button
                              onClick={() => copyToClipboard(`${variation.headline}\n\n${variation.primaryText}\n\nCTA: ${variation.callToAction}`)}
                              className="p-1.5 rounded-lg hover:bg-secondary"
                            >
                              <Copy size={14} className="text-muted-foreground" />
                            </button>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Hook</p>
                            <p className="text-sm font-medium text-amber-400">{variation.hook}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Headline</p>
                            <p className="font-heading font-bold">{variation.headline}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Primary Text</p>
                            <p className="text-sm text-foreground/80">{variation.primaryText}</p>
                          </div>
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                            {variation.callToAction}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-card border-border">
                    <CardContent className="py-16 text-center">
                      <Type size={32} className="text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-heading font-bold text-lg mb-2">No Copy Variations Yet</h3>
                      <p className="text-muted-foreground text-sm">
                        Generate copy variations to see multiple ad copy options here.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
