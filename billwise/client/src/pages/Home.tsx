import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Receipt,
  Clock,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  ArrowRight,
  CalendarDays,
  Brain,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import { useLocation } from "wouter";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading: statsLoading } = trpc.analytics.dashboard.useQuery();
  const { data: bills, isLoading: billsLoading } = trpc.bills.list.useQuery({});
  const { data: categories } = trpc.categories.list.useQuery();

  const now = new Date();
  const upcomingBills = bills
    ?.filter((b) => b.status === "pending" && isAfter(new Date(b.dueDate), now))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5) ?? [];

  const overdueBills = bills?.filter((b) => b.status === "overdue") ?? [];
  const dueSoon = bills?.filter(
    (b) => b.status === "pending" && isBefore(new Date(b.dueDate), addDays(now, 7)) && isAfter(new Date(b.dueDate), now)
  ) ?? [];

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId || !categories) return null;
    return categories.find((c) => c.id === categoryId)?.name;
  };

  const getCategoryColor = (categoryId: number | null) => {
    if (!categoryId || !categories) return "#a78bfa";
    return categories.find((c) => c.id === categoryId)?.color ?? "#a78bfa";
  };

  if (statsLoading || billsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const monthlyIncome = parseFloat(stats?.monthlyIncome ?? "0");

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold gradient-text">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your financial command center
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/15 to-primary/5 neon-purple overflow-hidden relative">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Monthly Income</p>
                  <p className="text-2xl font-display font-bold mt-1">${monthlyIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-chart-2/15 to-chart-2/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Due</p>
                  <p className="text-2xl font-display font-bold mt-1">${parseFloat(stats?.totalDue ?? "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-chart-2/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-chart-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-chart-3/15 to-chart-3/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
                  <p className="text-2xl font-display font-bold mt-1">{stats?.pendingBills ?? 0}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">bills awaiting</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-chart-3/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-destructive/15 to-destructive/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overdue</p>
                  <p className="text-2xl font-display font-bold mt-1">{stats?.overdueBills ?? 0}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">need attention</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-chart-5/15 to-chart-5/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Paid This Month</p>
                  <p className="text-2xl font-display font-bold mt-1">${parseFloat(stats?.paidThisMonth ?? "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-chart-5/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-chart-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Bills */}
        {overdueBills.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-destructive/20 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display font-semibold flex items-center gap-2">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </motion.div>
                  Overdue Bills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {overdueBills.map((bill, i) => (
                  <motion.div
                    key={bill.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-destructive/5 hover:bg-destructive/10 transition-all cursor-pointer"
                    onClick={() => setLocation("/bills")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getCategoryColor(bill.categoryId) }} />
                      <div>
                        <p className="text-sm font-medium">{bill.name}</p>
                        <p className="text-xs text-muted-foreground">Due {format(new Date(bill.dueDate), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-display font-bold text-destructive">${parseFloat(bill.amount).toFixed(2)}</p>
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Overdue</Badge>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Upcoming Bills */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-display font-semibold flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Upcoming Bills
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setLocation("/bills")}>
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingBills.length === 0 ? (
                <div className="text-center py-8">
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Receipt className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground">No upcoming bills</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setLocation("/bills")}>
                    Add your first bill
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingBills.map((bill, i) => {
                    const daysUntil = Math.ceil((new Date(bill.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <motion.div
                        key={bill.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-all cursor-pointer"
                        onClick={() => setLocation("/bills")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getCategoryColor(bill.categoryId) }} />
                          <div>
                            <p className="text-sm font-medium">{bill.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-muted-foreground">{format(new Date(bill.dueDate), "MMM d")}</p>
                              {getCategoryName(bill.categoryId) && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{getCategoryName(bill.categoryId)}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-display font-bold">${parseFloat(bill.amount).toFixed(2)}</p>
                          <p className={`text-[10px] ${daysUntil <= 3 ? "text-chart-3" : "text-muted-foreground"}`}>
                            {daysUntil === 0 ? "Due today" : daysUntil === 1 ? "Due tomorrow" : `${daysUntil} days`}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-chart-3" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="h-auto py-4 w-full flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
                  onClick={() => setLocation("/assistant")}
                >
                  <Brain className="h-5 w-5 text-primary" />
                  <span className="text-xs">Ask AI</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="h-auto py-4 w-full flex flex-col items-center gap-2 hover:bg-chart-2/5 hover:border-chart-2/30 transition-all"
                  onClick={() => setLocation("/bills")}
                >
                  <Receipt className="h-5 w-5 text-chart-2" />
                  <span className="text-xs">Add Bill</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="h-auto py-4 w-full flex flex-col items-center gap-2 hover:bg-chart-5/5 hover:border-chart-5/30 transition-all"
                  onClick={() => setLocation("/payments")}
                >
                  <CheckCircle2 className="h-5 w-5 text-chart-5" />
                  <span className="text-xs">Record Payment</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="h-auto py-4 w-full flex flex-col items-center gap-2 hover:bg-chart-3/5 hover:border-chart-3/30 transition-all"
                  onClick={() => setLocation("/budgets")}
                >
                  <Sparkles className="h-5 w-5 text-chart-3" />
                  <span className="text-xs">AI Budget</span>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
