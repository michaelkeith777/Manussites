import { cn } from "@/lib/utils";
import { Sparkles, Star, Crown, Gem } from "lucide-react";

export type RarityLevel = "common" | "rare" | "epic" | "legendary";

interface CardRarityProps {
  rarity: RarityLevel;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const rarityConfig = {
  common: {
    label: "Common",
    icon: Star,
    color: "text-gray-400",
    bgColor: "bg-gray-500/20",
    borderColor: "border-gray-500/50",
    gradient: "from-gray-400 to-gray-600",
  },
  rare: {
    label: "Rare",
    icon: Sparkles,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/50",
    gradient: "from-blue-400 to-blue-600",
  },
  epic: {
    label: "Epic",
    icon: Gem,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500/50",
    gradient: "from-purple-400 to-purple-600",
  },
  legendary: {
    label: "Legendary",
    icon: Crown,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500/50",
    gradient: "from-amber-400 via-yellow-300 to-amber-500",
  },
};

const sizeConfig = {
  sm: {
    badge: "px-1.5 py-0.5 text-xs",
    icon: "w-3 h-3",
  },
  md: {
    badge: "px-2 py-1 text-sm",
    icon: "w-4 h-4",
  },
  lg: {
    badge: "px-3 py-1.5 text-base",
    icon: "w-5 h-5",
  },
};

export function CardRarityBadge({
  rarity,
  showLabel = true,
  size = "md",
  className,
}: CardRarityProps) {
  const config = rarityConfig[rarity];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border",
        config.bgColor,
        config.borderColor,
        sizes.badge,
        className
      )}
    >
      <Icon className={cn(sizes.icon, config.color)} />
      {showLabel && (
        <span className={cn("font-medium", config.color)}>{config.label}</span>
      )}
    </div>
  );
}

interface CardRarityBorderProps {
  rarity: RarityLevel;
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
}

export function CardRarityBorder({
  rarity,
  children,
  className,
  animated = true,
}: CardRarityBorderProps) {
  const isLegendary = rarity === "legendary";
  const isEpic = rarity === "epic";
  const isRare = rarity === "rare";

  return (
    <div className={cn("relative", className)}>
      {/* Holographic/Glow effect for rare+ cards */}
      {(isRare || isEpic || isLegendary) && animated && (
        <div
          className={cn(
            "absolute -inset-1 rounded-xl opacity-75 blur-sm",
            isLegendary && "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 animate-pulse",
            isEpic && "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500",
            isRare && "bg-gradient-to-r from-blue-400 to-cyan-400"
          )}
          style={{
            animation: isLegendary
              ? "pulse 2s ease-in-out infinite, hue-rotate 3s linear infinite"
              : isEpic
              ? "pulse 3s ease-in-out infinite"
              : undefined,
          }}
        />
      )}

      {/* Sparkle overlay for legendary */}
      {isLegendary && animated && (
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none z-10">
          <div className="sparkle-container">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="sparkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Card content */}
      <div
        className={cn(
          "relative rounded-xl overflow-hidden",
          isLegendary && "ring-2 ring-amber-400/50",
          isEpic && "ring-2 ring-purple-400/50",
          isRare && "ring-2 ring-blue-400/50"
        )}
      >
        {children}
      </div>
    </div>
  );
}

// CSS for sparkle animation (add to index.css)
export const sparkleStyles = `
@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes hue-rotate {
  0% {
    filter: hue-rotate(0deg);
  }
  100% {
    filter: hue-rotate(360deg);
  }
}

.sparkle-container {
  position: absolute;
  inset: 0;
}

.sparkle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: radial-gradient(circle, white 0%, transparent 70%);
  border-radius: 50%;
  animation: sparkle 2s ease-in-out infinite;
}
`;

// Helper function to determine rarity based on prompt complexity
export function calculateRarity(prompt: string, model: string): RarityLevel {
  let score = 0;

  // Prompt length contributes to rarity
  if (prompt.length > 200) score += 2;
  else if (prompt.length > 100) score += 1;

  // Specific keywords increase rarity
  const epicKeywords = ["legendary", "mythical", "ancient", "divine", "celestial", "cosmic"];
  const rareKeywords = ["epic", "rare", "unique", "special", "golden", "diamond"];
  
  const lowerPrompt = prompt.toLowerCase();
  
  epicKeywords.forEach((keyword) => {
    if (lowerPrompt.includes(keyword)) score += 3;
  });
  
  rareKeywords.forEach((keyword) => {
    if (lowerPrompt.includes(keyword)) score += 2;
  });

  // Model quality affects rarity
  if (model === "openai-4o") score += 2;
  else if (model === "nano-banana-pro") score += 1;

  // Random factor for excitement
  const randomBonus = Math.random();
  if (randomBonus > 0.95) score += 4; // 5% chance for big bonus
  else if (randomBonus > 0.85) score += 2; // 10% chance for medium bonus

  // Determine rarity based on score
  if (score >= 8) return "legendary";
  if (score >= 5) return "epic";
  if (score >= 2) return "rare";
  return "common";
}
