/*
 * Design: Liquid Amethyst — Ad Launcher with drag-drop upload area,
 * ad setup form, and preview panel. Purple gradients with gold CTAs.
 */
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Upload, Image, Video, Plus, X, ChevronDown, Rocket, Save,
  Eye, Copy, Trash2, GripVertical, FileText, Settings2, Layers,
} from "lucide-react";
import { toast } from "sonner";

const adAccounts = ["Zelvari Demo Account", "Agency Client - FashionCo", "Agency Client - TechStart"];
const adSetOptions = ["Summer Sale 2026", "Retargeting - Cart Abandoners", "Lookalike - Top Customers", "Brand Awareness Q1"];

export default function AdLauncher() {
  const [selectedAccount, setSelectedAccount] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(["creative_summer_01.mp4", "creative_summer_02.jpg", "creative_summer_03.jpg", "creative_summer_04.mp4"]);
  const [primaryText, setPrimaryText] = useState("Transform your style this summer with our exclusive collection. Shop now and get 30% off your first order!");
  const [headline, setHeadline] = useState("Summer Collection - 30% Off");
  const [adFormat, setAdFormat] = useState("single");
  const [showPreview, setShowPreview] = useState(false);

  const handleLaunch = () => {
    toast.success(`Successfully launched ${uploadedFiles.length} ads!`, {
      description: "Your ads are now being processed and will go live shortly.",
    });
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl">Ad Launcher</h1>
            <p className="text-muted-foreground text-sm mt-1">Launch ads across all platforms in seconds.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
              <Eye size={14} className="mr-2" /> Preview
            </Button>
            <Button variant="outline" size="sm">
              <Save size={14} className="mr-2" /> Save Draft
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Setup */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account selector */}
            <div className="glass-card rounded-xl p-5">
              <label className="text-sm font-medium mb-2 block">Ad Account</label>
              <div className="relative">
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(Number(e.target.value))}
                  className="w-full h-10 px-4 rounded-lg bg-secondary border-0 text-sm text-foreground appearance-none focus:ring-2 focus:ring-primary/50"
                >
                  {adAccounts.map((acc, i) => (
                    <option key={i} value={i}>{acc}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Ad Format */}
            <div className="glass-card rounded-xl p-5">
              <label className="text-sm font-medium mb-3 block">Ad Format</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "single", label: "Single", icon: Image },
                  { id: "carousel", label: "Carousel", icon: Layers },
                  { id: "flexible", label: "Flexible", icon: Settings2 },
                  { id: "multi", label: "Multi-Format", icon: Copy },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setAdFormat(f.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                      adFormat === f.id
                        ? "bg-purple-600/20 border-2 border-purple-500/50 text-purple-300"
                        : "bg-secondary/50 border-2 border-transparent text-muted-foreground hover:border-border"
                    }`}
                  >
                    <f.icon size={20} />
                    <span className="text-xs font-medium">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload area */}
            <div className="glass-card rounded-xl p-5">
              <label className="text-sm font-medium mb-3 block">Creatives</label>
              <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
                <Upload size={32} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">Drag & drop your creatives here</p>
                <p className="text-xs text-muted-foreground/60">or click to browse. Supports JPG, PNG, MP4, MOV</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Button variant="outline" size="sm"><Image size={14} className="mr-1" /> Google Drive</Button>
                  <Button variant="outline" size="sm"><FileText size={14} className="mr-1" /> Dropbox</Button>
                  <Button variant="outline" size="sm"><Video size={14} className="mr-1" /> Frame.io</Button>
                </div>
              </div>

              {/* Uploaded files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 bg-secondary/30 rounded-lg p-3 group">
                      <GripVertical size={14} className="text-muted-foreground/30 cursor-grab" />
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                        {file.endsWith(".mp4") ? <Video size={16} className="text-purple-400" /> : <Image size={16} className="text-purple-400" />}
                      </div>
                      <span className="text-sm flex-1 truncate">{file}</span>
                      <span className="text-xs text-muted-foreground">{file.endsWith(".mp4") ? "9:16" : "4:5"}</span>
                      <button onClick={() => handleRemoveFile(i)} className="text-muted-foreground/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">{uploadedFiles.length} files uploaded · Auto-grouped by aspect ratio</p>
                </div>
              )}
            </div>

            {/* Ad Copy */}
            <div className="glass-card rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Ad Copy</label>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-xs text-purple-400">
                    <Save size={12} className="mr-1" /> Save Template
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs text-purple-400">
                    <FileText size={12} className="mr-1" /> Load Template
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Primary Text</label>
                <textarea
                  value={primaryText}
                  onChange={(e) => setPrimaryText(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-secondary border-0 text-sm text-foreground resize-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
                  placeholder="Write your ad copy..."
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Headline</label>
                <input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full h-10 px-4 rounded-lg bg-secondary border-0 text-sm text-foreground focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
                  placeholder="Ad headline..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Call to Action</label>
                  <select className="w-full h-10 px-4 rounded-lg bg-secondary border-0 text-sm text-foreground appearance-none">
                    <option>Shop Now</option>
                    <option>Learn More</option>
                    <option>Sign Up</option>
                    <option>Download</option>
                    <option>Contact Us</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Destination URL</label>
                  <input
                    className="w-full h-10 px-4 rounded-lg bg-secondary border-0 text-sm text-foreground focus:ring-2 focus:ring-primary/50"
                    placeholder="https://..."
                    defaultValue="https://shop.example.com/summer"
                  />
                </div>
              </div>

              <Button variant="outline" size="sm" className="text-purple-400 border-purple-500/30">
                <Layers size={14} className="mr-2" /> Generate AI Variations
              </Button>
            </div>

            {/* Ad Set Selection */}
            <div className="glass-card rounded-xl p-5">
              <label className="text-sm font-medium mb-3 block">Target Ad Sets</label>
              <div className="space-y-2">
                {adSetOptions.map((set, i) => (
                  <label key={i} className="flex items-center gap-3 bg-secondary/30 rounded-lg p-3 cursor-pointer hover:bg-secondary/50 transition-colors">
                    <input type="checkbox" defaultChecked={i < 2} className="w-4 h-4 rounded border-border bg-secondary text-purple-600 focus:ring-purple-500" />
                    <span className="text-sm">{set}</span>
                  </label>
                ))}
                <Button variant="ghost" size="sm" className="text-purple-400">
                  <Plus size={14} className="mr-1" /> Create New Ad Set
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Preview & Launch */}
          <div className="space-y-6">
            {/* Ad Preview */}
            <div className="glass-card rounded-xl p-5 sticky top-20">
              <h3 className="font-heading font-semibold mb-4">Ad Preview</h3>
              <div className="bg-secondary/50 rounded-xl overflow-hidden">
                {/* Mock ad preview */}
                <div className="p-3 flex items-center gap-2 border-b border-border/30">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20" />
                  <div>
                    <div className="text-xs font-medium">Your Brand</div>
                    <div className="text-[10px] text-muted-foreground">Sponsored</div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-foreground/70 mb-3">{primaryText}</p>
                </div>
                <div className="aspect-[4/5] bg-gradient-to-br from-purple-900/40 to-purple-800/20 flex items-center justify-center">
                  <div className="text-center">
                    <Image size={32} className="mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground/30">Creative Preview</p>
                  </div>
                </div>
                <div className="p-3 border-t border-border/30">
                  <div className="text-xs font-medium">{headline}</div>
                  <div className="text-[10px] text-muted-foreground">shop.example.com</div>
                </div>
                <div className="px-3 pb-3">
                  <Button size="sm" className="w-full text-xs bg-secondary text-foreground">Shop Now</Button>
                </div>
              </div>

              {/* Launch summary */}
              <div className="mt-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Creatives</span>
                  <span className="font-medium">{uploadedFiles.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ad Sets</span>
                  <span className="font-medium">2</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Ads</span>
                  <span className="font-medium text-amber-400">{uploadedFiles.length * 2}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform</span>
                  <span className="font-medium">Meta Ads</span>
                </div>
              </div>

              <Button
                onClick={handleLaunch}
                className="w-full mt-5 bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-600/30 h-12"
              >
                <Rocket size={16} className="mr-2" /> Launch {uploadedFiles.length * 2} Ads
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-2">Estimated launch time: ~17 seconds</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
