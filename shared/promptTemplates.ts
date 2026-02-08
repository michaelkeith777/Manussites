// Prompt Templates Library for Trading Card Generation

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: "action" | "portrait" | "vintage" | "modern" | "artistic" | "special";
  icon: string; // Lucide icon name
  basePrompt: string;
  styleModifiers: string[];
  colorPalette?: string;
  lightingStyle?: string;
  backgroundStyle?: string;
  example?: string;
}

export const promptTemplates: PromptTemplate[] = [
  // Action Templates
  {
    id: "action-dynamic",
    name: "Dynamic Action Shot",
    description: "High-energy action pose with motion blur and dramatic angles",
    category: "action",
    icon: "Zap",
    basePrompt: "dynamic action shot, explosive energy, motion blur effect, dramatic low angle",
    styleModifiers: [
      "intense movement",
      "speed lines",
      "dramatic lighting",
      "powerful stance",
      "athletic pose"
    ],
    lightingStyle: "dramatic rim lighting with lens flare",
    backgroundStyle: "blurred stadium or arena with crowd silhouettes",
    example: "Dynamic action shot of [PLAYER] mid-jump, explosive energy, motion blur effect"
  },
  {
    id: "action-freeze-frame",
    name: "Freeze Frame Moment",
    description: "Captured at the peak of action, frozen in time",
    category: "action",
    icon: "Camera",
    basePrompt: "freeze frame moment, peak action, crystal clear detail, suspended in time",
    styleModifiers: [
      "perfect timing",
      "sharp focus",
      "decisive moment",
      "athletic excellence"
    ],
    lightingStyle: "bright stadium lights with sharp shadows",
    backgroundStyle: "out of focus crowd with bokeh lights"
  },
  {
    id: "action-slam-dunk",
    name: "Slam Dunk Spectacular",
    description: "Basketball-specific high-flying dunk pose",
    category: "action",
    icon: "Trophy",
    basePrompt: "spectacular slam dunk, soaring through the air, powerful athletic form",
    styleModifiers: [
      "above the rim",
      "powerful grip on ball",
      "intense expression",
      "crowd going wild"
    ],
    lightingStyle: "arena spotlights with dramatic shadows",
    backgroundStyle: "basketball hoop and backboard, cheering crowd"
  },
  {
    id: "action-touchdown",
    name: "Touchdown Celebration",
    description: "Football-specific scoring celebration pose",
    category: "action",
    icon: "Star",
    basePrompt: "triumphant touchdown celebration, victorious pose, emotional moment",
    styleModifiers: [
      "arms raised in victory",
      "football in hand",
      "team celebration",
      "confetti falling"
    ],
    lightingStyle: "golden hour stadium lighting",
    backgroundStyle: "end zone with team colors, celebrating teammates"
  },

  // Portrait Templates
  {
    id: "portrait-hero",
    name: "Hero Portrait",
    description: "Iconic hero-style portrait with dramatic lighting",
    category: "portrait",
    icon: "User",
    basePrompt: "heroic portrait, powerful presence, iconic pose, legendary status",
    styleModifiers: [
      "confident expression",
      "strong jawline lighting",
      "team jersey prominent",
      "championship aura"
    ],
    lightingStyle: "Rembrandt lighting with golden highlights",
    backgroundStyle: "gradient with team colors, subtle smoke effects"
  },
  {
    id: "portrait-close-up",
    name: "Intense Close-Up",
    description: "Dramatic close-up focusing on determination and focus",
    category: "portrait",
    icon: "Focus",
    basePrompt: "intense close-up portrait, fierce determination, eyes of a champion",
    styleModifiers: [
      "sweat glistening",
      "focused gaze",
      "game face",
      "battle-ready expression"
    ],
    lightingStyle: "high contrast dramatic lighting",
    backgroundStyle: "dark moody background with subtle team color accents"
  },
  {
    id: "portrait-legacy",
    name: "Legacy Portrait",
    description: "Timeless portrait style for legendary players",
    category: "portrait",
    icon: "Crown",
    basePrompt: "legacy portrait, timeless elegance, hall of fame worthy, distinguished presence",
    styleModifiers: [
      "dignified pose",
      "championship rings visible",
      "trophy nearby",
      "legendary status"
    ],
    lightingStyle: "soft golden lighting with vignette",
    backgroundStyle: "classic dark background with subtle gold accents"
  },

  // Vintage Templates
  {
    id: "vintage-classic",
    name: "Classic Vintage Card",
    description: "1950s-60s style vintage trading card aesthetic",
    category: "vintage",
    icon: "Clock",
    basePrompt: "classic vintage trading card style, 1950s aesthetic, retro illustration",
    styleModifiers: [
      "hand-painted look",
      "warm sepia tones",
      "classic composition",
      "nostalgic feel"
    ],
    colorPalette: "warm sepia, muted reds, cream whites, aged paper tones",
    lightingStyle: "soft diffused lighting",
    backgroundStyle: "solid color or simple gradient, vintage texture overlay"
  },
  {
    id: "vintage-retro-80s",
    name: "Retro 80s Style",
    description: "Bold 1980s trading card aesthetic with neon accents",
    category: "vintage",
    icon: "Sparkles",
    basePrompt: "retro 1980s trading card style, bold colors, neon accents, rad aesthetic",
    styleModifiers: [
      "bright saturated colors",
      "geometric patterns",
      "chrome effects",
      "action lines"
    ],
    colorPalette: "hot pink, electric blue, neon green, chrome silver",
    lightingStyle: "bright flash photography style",
    backgroundStyle: "geometric shapes, laser grid, neon glow effects"
  },
  {
    id: "vintage-90s-insert",
    name: "90s Insert Card",
    description: "Premium 1990s insert card style with special effects",
    category: "vintage",
    icon: "Layers",
    basePrompt: "1990s premium insert card style, die-cut effect, special edition look",
    styleModifiers: [
      "refractor shine",
      "embossed look",
      "premium quality",
      "collector's edition"
    ],
    colorPalette: "deep purples, metallic gold, silver chrome, rich blacks",
    lightingStyle: "studio lighting with metallic reflections",
    backgroundStyle: "abstract patterns, holographic shimmer effect"
  },

  // Modern Templates
  {
    id: "modern-clean",
    name: "Modern Clean Design",
    description: "Contemporary minimalist trading card style",
    category: "modern",
    icon: "Square",
    basePrompt: "modern minimalist design, clean lines, contemporary aesthetic",
    styleModifiers: [
      "sharp edges",
      "negative space",
      "bold typography friendly",
      "sleek presentation"
    ],
    colorPalette: "monochromatic with single accent color",
    lightingStyle: "clean studio lighting",
    backgroundStyle: "solid color or subtle gradient, geometric accents"
  },
  {
    id: "modern-premium",
    name: "Premium Luxury Card",
    description: "High-end luxury trading card aesthetic",
    category: "modern",
    icon: "Diamond",
    basePrompt: "luxury premium card design, high-end aesthetic, exclusive collector quality",
    styleModifiers: [
      "gold foil accents",
      "embossed texture",
      "premium materials look",
      "VIP exclusive feel"
    ],
    colorPalette: "black, gold, silver, deep burgundy",
    lightingStyle: "dramatic studio lighting with gold reflections",
    backgroundStyle: "textured dark background with metallic accents"
  },

  // Artistic Templates
  {
    id: "artistic-comic",
    name: "Comic Book Style",
    description: "Bold comic book illustration aesthetic",
    category: "artistic",
    icon: "Palette",
    basePrompt: "comic book art style, bold ink lines, dynamic illustration, superhero aesthetic",
    styleModifiers: [
      "halftone dots",
      "bold outlines",
      "action panels",
      "speech bubble ready"
    ],
    colorPalette: "primary colors, bold blacks, white highlights",
    lightingStyle: "flat comic book lighting with cel shading",
    backgroundStyle: "action lines, burst effects, comic panel background"
  },
  {
    id: "artistic-anime",
    name: "Anime Style",
    description: "Japanese anime-inspired illustration",
    category: "artistic",
    icon: "Star",
    basePrompt: "anime art style, Japanese illustration, dynamic pose, expressive features",
    styleModifiers: [
      "large expressive eyes",
      "speed lines",
      "dramatic hair flow",
      "vibrant colors"
    ],
    colorPalette: "vibrant anime colors, soft gradients, bright highlights",
    lightingStyle: "anime-style rim lighting with soft shadows",
    backgroundStyle: "sparkle effects, gradient sky, cherry blossoms"
  },
  {
    id: "artistic-oil-painting",
    name: "Oil Painting Style",
    description: "Classical oil painting aesthetic",
    category: "artistic",
    icon: "Brush",
    basePrompt: "oil painting style, classical art aesthetic, museum quality, masterpiece",
    styleModifiers: [
      "visible brushstrokes",
      "rich textures",
      "classical composition",
      "renaissance influence"
    ],
    colorPalette: "rich earth tones, deep shadows, golden highlights",
    lightingStyle: "chiaroscuro lighting, dramatic shadows",
    backgroundStyle: "dark classical background, subtle drapery"
  },
  {
    id: "artistic-digital",
    name: "Digital Art Concept",
    description: "Modern digital concept art style",
    category: "artistic",
    icon: "Monitor",
    basePrompt: "digital concept art, modern illustration, professional quality, AAA game style",
    styleModifiers: [
      "detailed rendering",
      "atmospheric effects",
      "cinematic quality",
      "professional polish"
    ],
    colorPalette: "cinematic color grading, complementary colors",
    lightingStyle: "cinematic three-point lighting",
    backgroundStyle: "environmental storytelling, atmospheric depth"
  },

  // Special Effect Templates
  {
    id: "special-holographic",
    name: "Holographic Foil",
    description: "Shimmering holographic rainbow effect",
    category: "special",
    icon: "Sparkles",
    basePrompt: "holographic foil effect, rainbow shimmer, prismatic reflections, collector's chase card",
    styleModifiers: [
      "iridescent surface",
      "light refraction",
      "premium chase card",
      "rainbow spectrum"
    ],
    colorPalette: "rainbow spectrum, silver base, prismatic highlights",
    lightingStyle: "multi-directional lighting for holographic effect",
    backgroundStyle: "holographic pattern, shifting colors"
  },
  {
    id: "special-chrome",
    name: "Chrome Refractor",
    description: "Metallic chrome refractor card effect",
    category: "special",
    icon: "Circle",
    basePrompt: "chrome refractor effect, metallic shine, mirror-like surface, premium parallel",
    styleModifiers: [
      "mirror finish",
      "light streaks",
      "metallic sheen",
      "collector's parallel"
    ],
    colorPalette: "chrome silver, metallic blue, reflective surfaces",
    lightingStyle: "studio lighting with chrome reflections",
    backgroundStyle: "refractor pattern, light ray effects"
  },
  {
    id: "special-gold",
    name: "Gold Parallel",
    description: "Luxurious gold foil parallel card",
    category: "special",
    icon: "Award",
    basePrompt: "gold foil parallel, luxurious golden shine, premium numbered card, elite status",
    styleModifiers: [
      "24k gold effect",
      "embossed details",
      "limited edition",
      "numbered parallel"
    ],
    colorPalette: "gold, black, cream, bronze accents",
    lightingStyle: "warm golden lighting with metallic reflections",
    backgroundStyle: "gold foil pattern, luxury texture"
  },
  {
    id: "special-prizm",
    name: "Prizm Effect",
    description: "Popular prizm-style light refraction effect",
    category: "special",
    icon: "Triangle",
    basePrompt: "prizm card effect, geometric light refraction, premium parallel, modern chase card",
    styleModifiers: [
      "geometric patterns",
      "light prisms",
      "angular reflections",
      "modern premium"
    ],
    colorPalette: "silver base with rainbow refractions",
    lightingStyle: "angular lighting for prizm effect",
    backgroundStyle: "geometric prizm pattern, angular light rays"
  }
];

// Helper function to get templates by category
export function getTemplatesByCategory(category: PromptTemplate["category"]): PromptTemplate[] {
  return promptTemplates.filter(t => t.category === category);
}

// Helper function to apply template to a topic/player
export function applyTemplate(template: PromptTemplate, playerName: string, sport: string): string {
  const sportContext = sport === "basketball" ? "NBA basketball player" : 
                       sport === "football" ? "NFL football player" :
                       sport === "ncaa-basketball" ? "college basketball player" :
                       sport === "ncaa-football" ? "college football player" : "athlete";
  
  let prompt = `${template.basePrompt}, featuring ${playerName} as a ${sportContext}`;
  
  if (template.styleModifiers.length > 0) {
    prompt += `, ${template.styleModifiers.slice(0, 3).join(", ")}`;
  }
  
  if (template.lightingStyle) {
    prompt += `, ${template.lightingStyle}`;
  }
  
  if (template.backgroundStyle) {
    prompt += `, ${template.backgroundStyle}`;
  }
  
  if (template.colorPalette) {
    prompt += `, color palette: ${template.colorPalette}`;
  }
  
  return prompt;
}

// Template categories for UI
export const templateCategories = [
  { id: "action", name: "Action Shots", icon: "Zap", description: "High-energy dynamic poses" },
  { id: "portrait", name: "Portraits", icon: "User", description: "Iconic player portraits" },
  { id: "vintage", name: "Vintage", icon: "Clock", description: "Classic retro styles" },
  { id: "modern", name: "Modern", icon: "Square", description: "Contemporary designs" },
  { id: "artistic", name: "Artistic", icon: "Palette", description: "Creative art styles" },
  { id: "special", name: "Special Effects", icon: "Sparkles", description: "Premium card effects" },
] as const;
