import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Camera,
  Trophy,
  Star,
  User,
  Focus,
  Crown,
  Clock,
  Sparkles,
  Layers,
  Square,
  Diamond,
  Palette,
  Brush,
  Monitor,
  Circle,
  Award,
  Triangle,
  LayoutTemplate,
  Check,
} from "lucide-react";
import {
  promptTemplates,
  templateCategories,
  type PromptTemplate,
} from "../../../shared/promptTemplates";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Camera,
  Trophy,
  Star,
  User,
  Focus,
  Crown,
  Clock,
  Sparkles,
  Layers,
  Square,
  Diamond,
  Palette,
  Brush,
  Monitor,
  Circle,
  Award,
  Triangle,
};

interface PromptTemplatesProps {
  onSelectTemplate: (template: PromptTemplate) => void;
  selectedTemplateId?: string | null;
}

export function PromptTemplates({ onSelectTemplate, selectedTemplateId }: PromptTemplatesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("action");

  const filteredTemplates = promptTemplates.filter(
    (t) => t.category === selectedCategory
  );

  const handleSelectTemplate = (template: PromptTemplate) => {
    onSelectTemplate(template);
    setIsOpen(false);
  };

  const CategoryIcon = iconMap[templateCategories.find(c => c.id === selectedCategory)?.icon || "Zap"];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <LayoutTemplate className="w-4 h-4" />
          Templates
          {selectedTemplateId && (
            <Badge variant="secondary" className="ml-1 text-xs">
              Active
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-primary" />
            Prompt Templates Library
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 h-[60vh]">
          {/* Category Sidebar */}
          <div className="w-48 flex-shrink-0 space-y-1">
            <p className="text-xs text-muted-foreground mb-2 px-2">Categories</p>
            {templateCategories.map((category) => {
              const Icon = iconMap[category.icon];
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className={`text-xs ${selectedCategory === category.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {category.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Templates Grid */}
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-2 gap-3 pr-4">
              <AnimatePresence mode="popLayout">
                {filteredTemplates.map((template, index) => {
                  const Icon = iconMap[template.icon];
                  const isSelected = selectedTemplateId === template.id;
                  
                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <button
                        onClick={() => handleSelectTemplate(template)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className={`p-2 rounded-lg ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                            {Icon && <Icon className="w-4 h-4" />}
                          </div>
                          {isSelected && (
                            <div className="p-1 rounded-full bg-primary text-primary-foreground">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        
                        <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {template.description}
                        </p>
                        
                        {/* Style Preview Tags */}
                        <div className="flex flex-wrap gap-1">
                          {template.styleModifiers.slice(0, 2).map((mod, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {mod}
                            </Badge>
                          ))}
                          {template.styleModifiers.length > 2 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              +{template.styleModifiers.length - 2}
                            </Badge>
                          )}
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>

        {/* Selected Template Preview */}
        {selectedTemplateId && (
          <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Selected: {promptTemplates.find(t => t.id === selectedTemplateId)?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  This template will be applied to your generated prompt
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectTemplate(null as any)}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
