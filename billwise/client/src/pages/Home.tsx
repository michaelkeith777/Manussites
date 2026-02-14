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
} from "lucide-react";
import { useLocation } from "wouter";
import { format, isAfter, isBefore, addDays } from "date-fns";

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
    if (!categoryId || !categories) return "#6366f1";
    return categories.find((c) => c.id === categoryId)?.color ?? "#6366f1";
  };

  if (statsLoading || billsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight font-serif">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your financial overview at a glance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Due</p>
                <p className="text-2xl font-semibold mt-1">${parseFloat(stats?.totalDue ?? "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-500/5 to-amber-500/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-semibold mt-1">{stats?.pendingBills ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">bills awaiting payment</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-destructive/5 to-destructive/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overdue</p>
                <p className="text-2xl font-semibold mt-1">{stats?.overdueBills ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">need attention</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Paid This Month</p>
                <p className="text-2xl font-semibold mt-1">${parseFloat(stats?.paidThisMonth ?? "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Bills */}
        {overdueBills.length > 0 && (
          <Card className="border-destructive/20 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Overdue Bills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {overdueBills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 hover:bg-destructive/10 transition-colors cursor-pointer"
                  onClick={() => setLocation("/bills")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: getCategoryColor(bill.categoryId) }}
                    />
                    <div>
                      <p className="text-sm font-medium">{bill.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {format(new Date(bill.dueDate), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-destructive">
                      ${parseFloat(bill.amount).toFixed(2)}
                    </p>
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      Overdue
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Upcoming Bills */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Upcoming Bills
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => setLocation("/bills")}
              >
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingBills.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No upcoming bills</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setLocation("/bills")}
                >
                  Add your first bill
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingBills.map((bill) => {
                  const daysUntil = Math.ceil(
                    (new Date(bill.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setLocation("/bills")}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: getCategoryColor(bill.categoryId) }}
                        />
                        <div>
                          <p className="text-sm font-medium">{bill.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(bill.dueDate), "MMM d")}
                            </p>
                            {getCategoryName(bill.categoryId) && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {getCategoryName(bill.categoryId)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          ${parseFloat(bill.amount).toFixed(2)}
                        </p>
                        <p className={`text-[10px] ${daysUntil <= 3 ? "text-amber-600" : "text-muted-foreground"}`}>
                          {daysUntil === 0 ? "Due today" : daysUntil === 1 ? "Due tomorrow" : `${daysUntil} days`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Due Soon Alert */}
        {dueSoon.length > 0 && overdueBills.length === 0 && (
          <Card className="border-amber-500/20 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                Due This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dueSoon.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer"
                  onClick={() => setLocation("/bills")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: getCategoryColor(bill.categoryId) }}
                    />
                    <div>
                      <p className="text-sm font-medium">{bill.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {format(new Date(bill.dueDate), "EEEE, MMM d")}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">${parseFloat(bill.amount).toFixed(2)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/20"
              onClick={() => setLocation("/bills")}
            >
              <Receipt className="h-5 w-5 text-primary" />
              <span className="text-xs">Add Bill</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-emerald-500/5 hover:border-emerald-500/20"
              onClick={() => setLocation("/payments")}
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span className="text-xs">Record Payment</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-amber-500/5 hover:border-amber-500/20"
              onClick={() => setLocation("/calendar")}
            >
              <CalendarDays className="h-5 w-5 text-amber-600" />
              <span className="text-xs">View Calendar</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-violet-500/5 hover:border-violet-500/20"
              onClick={() => setLocation("/assistant")}
            >
              <Receipt className="h-5 w-5 text-violet-600" />
              <span className="text-xs">Ask AI</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
