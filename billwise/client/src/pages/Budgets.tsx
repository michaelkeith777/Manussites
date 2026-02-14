import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PiggyBank,
  Sparkles,
  Loader2,
  Trash2,
  TrendingUp,
  Lightbulb,
  DollarSign,
  Brain,
  Zap,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Budgets() {
  const [generating, setGenerating] = useState(false);
  const [latestParsed, setLatestParsed] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: budgets, isLoading } = trpc.budget.list.useQuery();
  const { data: stats } = trpc.analytics.dashboard.useQuery();

  const generateBudget = trpc.budget.generate.useMutation({
    onMutate: () => setGenerating(true),
    onSuccess: (result) => {
      utils.budget.list.invalidate();
      setLatestParsed(result.parsed);
      setGenerating(false);
      toast.success("Budget generated! Check out your personalized plan.");
    },
    onError: () => {
      setGenerating(false);
      toast.error("Failed to generate budget. Make sure you have bills and income added.");
    },
  });

  const deleteBudget = trpc.budget.delete.useMutation({
    onSuccess: () => {
      utils.budget.list.invalidate();
      toast.success("Budget deleted");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const monthlyIncome = parseFloat(stats?.monthlyIncome ?? "0");
  const totalDue = parseFloat(stats?.totalDue ?? "0");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold gradient-text">AI Budgets</h1>
          <p className="text-muted-foreground text-sm mt-1">AI-generated budget plans tailored to you</p>
        </div>
        <Button
          onClick={() => generateBudget.mutate()}
          disabled={generating}
          className="bg-gradient-to-r from-primary to-chart-2 text-white border-0 hover:opacity-90 transition-all neon-purple"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Generate Budget
            </>
          )}
        </Button>
      </div>

      {/* Income vs Bills Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-chart-2/10 to-chart-2/5">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Monthly Income</p>
              <p className="text-2xl font-display font-bold mt-1 text-chart-2">${monthlyIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-destructive/10 to-destructive/5">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Bills Due</p>
              <p className="text-2xl font-display font-bold mt-1 text-destructive">${totalDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={`border-0 shadow-sm bg-gradient-to-br ${monthlyIncome - totalDue >= 0 ? "from-chart-5/10 to-chart-5/5" : "from-destructive/10 to-destructive/5"}`}>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Remaining</p>
              <p className={`text-2xl font-display font-bold mt-1 ${monthlyIncome - totalDue >= 0 ? "text-chart-5" : "text-destructive"}`}>
                ${(monthlyIncome - totalDue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Generating Animation */}
      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border-primary/20 shadow-lg neon-purple">
              <CardContent className="p-8 flex flex-col items-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Brain className="h-12 w-12 text-primary" />
                </motion.div>
                <div className="text-center">
                  <p className="font-display font-bold text-lg">AI is analyzing your finances...</p>
                  <p className="text-sm text-muted-foreground mt-1">Creating a personalized budget plan just for you</p>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Latest Generated Budget (expanded) */}
      {latestParsed && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {latestParsed.name}
                </CardTitle>
                <Badge className="bg-primary/20 text-primary border-0">Just Generated</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <p className="text-sm text-muted-foreground leading-relaxed">{latestParsed.summary}</p>

              {/* Breakdown */}
              {latestParsed.breakdown && latestParsed.breakdown.length > 0 && (
                <div>
                  <h3 className="text-sm font-display font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-chart-2" />
                    Budget Breakdown
                  </h3>
                  <div className="space-y-2">
                    {latestParsed.breakdown.map((item: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {item.percentage}%
                          </div>
                          <div>
                            <p className="text-sm font-medium">{item.category}</p>
                            <p className="text-xs text-muted-foreground">{item.notes}</p>
                          </div>
                        </div>
                        <p className="text-sm font-display font-bold">${item.allocated.toFixed(2)}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {latestParsed.suggestions && latestParsed.suggestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-display font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-chart-3" />
                    Smart Suggestions
                  </h3>
                  <div className="space-y-2">
                    {latestParsed.suggestions.map((suggestion: string, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-chart-3/5 border border-chart-3/10"
                      >
                        <Zap className="h-4 w-4 text-chart-3 mt-0.5 shrink-0" />
                        <p className="text-sm">{suggestion}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Budget History */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display font-semibold flex items-center gap-2">
            <PiggyBank className="h-4 w-4 text-primary" />
            Budget History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(!budgets || budgets.length === 0) && !latestParsed ? (
            <div className="text-center py-12">
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <Brain className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              </motion.div>
              <p className="text-sm text-muted-foreground">No budgets generated yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add your bills and income, then let AI create your budget</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => generateBudget.mutate()}
                disabled={generating}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Your First Budget
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {budgets?.map((budget, index) => {
                let suggestions: string[] = [];
                let breakdown: any[] = [];
                try { suggestions = JSON.parse(budget.suggestions || "[]"); } catch {}
                try { breakdown = JSON.parse(budget.breakdown || "[]"); } catch {}

                return (
                  <motion.div
                    key={budget.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl border hover:bg-muted/20 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-display font-semibold">{budget.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(budget.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Savings: ${parseFloat(budget.totalSavings).toFixed(2)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteBudget.mutate({ id: budget.id })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-muted-foreground">Income</p>
                        <p className="font-bold">${parseFloat(budget.totalIncome).toFixed(2)}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-muted-foreground">Bills</p>
                        <p className="font-bold">${parseFloat(budget.totalBills).toFixed(2)}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30">
                        <p className="text-muted-foreground">Categories</p>
                        <p className="font-bold">{breakdown.length}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
