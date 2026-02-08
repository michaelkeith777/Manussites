import { cn } from "@/lib/utils";
import { Zap, Shield, Flame, Wind, Heart, Brain } from "lucide-react";

export interface CardStatsData {
  power: number;
  speed: number;
  defense: number;
  energy: number;
  health: number;
  intelligence: number;
  overall?: number;
}

interface CardStatsProps {
  stats: CardStatsData;
  compact?: boolean;
  showOverall?: boolean;
  className?: string;
}

const statConfig = {
  power: {
    label: "Power",
    shortLabel: "PWR",
    icon: Flame,
    color: "text-red-400",
    bgColor: "bg-red-500",
  },
  speed: {
    label: "Speed",
    shortLabel: "SPD",
    icon: Wind,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500",
  },
  defense: {
    label: "Defense",
    shortLabel: "DEF",
    icon: Shield,
    color: "text-blue-400",
    bgColor: "bg-blue-500",
  },
  energy: {
    label: "Energy",
    shortLabel: "NRG",
    icon: Zap,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500",
  },
  health: {
    label: "Health",
    shortLabel: "HP",
    icon: Heart,
    color: "text-green-400",
    bgColor: "bg-green-500",
  },
  intelligence: {
    label: "Intelligence",
    shortLabel: "INT",
    icon: Brain,
    color: "text-purple-400",
    bgColor: "bg-purple-500",
  },
};

function StatBar({
  stat,
  value,
  compact,
}: {
  stat: keyof typeof statConfig;
  value: number;
  compact?: boolean;
}) {
  const config = statConfig[stat];
  const Icon = config.icon;
  const percentage = Math.min(100, Math.max(0, value));

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Icon className={cn("w-3 h-3", config.color)} />
        <span className="text-xs font-mono font-bold text-foreground">
          {value}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className={cn("w-4 h-4", config.color)} />
          <span className="text-xs font-medium text-muted-foreground">
            {config.label}
          </span>
        </div>
        <span className="text-sm font-mono font-bold text-foreground">
          {value}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", config.bgColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function CardStats({
  stats,
  compact = false,
  showOverall = true,
  className,
}: CardStatsProps) {
  const overall =
    stats.overall ??
    Math.round(
      (stats.power +
        stats.speed +
        stats.defense +
        stats.energy +
        stats.health +
        stats.intelligence) /
        6
    );

  if (compact) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {Object.entries(stats).map(([key, value]) => {
          if (key === "overall") return null;
          return (
            <StatBar
              key={key}
              stat={key as keyof typeof statConfig}
              value={value}
              compact
            />
          );
        })}
        {showOverall && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/20 rounded">
            <span className="text-xs font-bold text-primary">{overall}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {Object.entries(stats).map(([key, value]) => {
        if (key === "overall") return null;
        return (
          <StatBar
            key={key}
            stat={key as keyof typeof statConfig}
            value={value}
          />
        );
      })}
      {showOverall && (
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Overall Rating
            </span>
            <span className="text-2xl font-bold text-primary">{overall}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact card overlay version
export function CardStatsOverlay({
  stats,
  className,
}: {
  stats: CardStatsData;
  className?: string;
}) {
  const overall =
    stats.overall ??
    Math.round(
      (stats.power +
        stats.speed +
        stats.defense +
        stats.energy +
        stats.health +
        stats.intelligence) /
        6
    );

  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 via-black/70 to-transparent",
        className
      )}
    >
      <div className="grid grid-cols-3 gap-1 text-center">
        <div className="flex flex-col items-center">
          <Flame className="w-3 h-3 text-red-400" />
          <span className="text-[10px] font-mono font-bold text-white">
            {stats.power}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <Wind className="w-3 h-3 text-cyan-400" />
          <span className="text-[10px] font-mono font-bold text-white">
            {stats.speed}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <Shield className="w-3 h-3 text-blue-400" />
          <span className="text-[10px] font-mono font-bold text-white">
            {stats.defense}
          </span>
        </div>
      </div>
      <div className="mt-1 text-center">
        <span className="text-xs font-bold text-primary">OVR {overall}</span>
      </div>
    </div>
  );
}

// Generate random stats based on prompt and rarity
export function generateCardStats(
  prompt: string,
  rarity: "common" | "rare" | "epic" | "legendary"
): CardStatsData {
  // Base ranges by rarity
  const rarityRanges = {
    common: { min: 30, max: 60 },
    rare: { min: 45, max: 75 },
    epic: { min: 60, max: 90 },
    legendary: { min: 75, max: 99 },
  };

  const range = rarityRanges[rarity];

  // Generate base stats with some variance
  const generateStat = () =>
    Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

  // Analyze prompt for stat biases
  const lowerPrompt = prompt.toLowerCase();
  const biases = {
    power: 0,
    speed: 0,
    defense: 0,
    energy: 0,
    health: 0,
    intelligence: 0,
  };

  // Power keywords
  if (
    lowerPrompt.includes("strong") ||
    lowerPrompt.includes("powerful") ||
    lowerPrompt.includes("mighty")
  ) {
    biases.power += 10;
  }

  // Speed keywords
  if (
    lowerPrompt.includes("fast") ||
    lowerPrompt.includes("quick") ||
    lowerPrompt.includes("swift")
  ) {
    biases.speed += 10;
  }

  // Defense keywords
  if (
    lowerPrompt.includes("armor") ||
    lowerPrompt.includes("shield") ||
    lowerPrompt.includes("tank")
  ) {
    biases.defense += 10;
  }

  // Energy keywords
  if (
    lowerPrompt.includes("magic") ||
    lowerPrompt.includes("energy") ||
    lowerPrompt.includes("electric")
  ) {
    biases.energy += 10;
  }

  // Health keywords
  if (
    lowerPrompt.includes("giant") ||
    lowerPrompt.includes("massive") ||
    lowerPrompt.includes("huge")
  ) {
    biases.health += 10;
  }

  // Intelligence keywords
  if (
    lowerPrompt.includes("wise") ||
    lowerPrompt.includes("smart") ||
    lowerPrompt.includes("genius")
  ) {
    biases.intelligence += 10;
  }

  return {
    power: Math.min(99, generateStat() + biases.power),
    speed: Math.min(99, generateStat() + biases.speed),
    defense: Math.min(99, generateStat() + biases.defense),
    energy: Math.min(99, generateStat() + biases.energy),
    health: Math.min(99, generateStat() + biases.health),
    intelligence: Math.min(99, generateStat() + biases.intelligence),
  };
}
