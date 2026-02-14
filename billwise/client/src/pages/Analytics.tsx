import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

const COLORS = [
  "#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#3b82f6",
  "#ec4899", "#06b6d4", "#8b5cf6", "#14b8a6", "#f97316",
];

export default function Analytics() {
  const [months] = useState(6);
  const now = useMemo(() => new Date(), []);
  const [startDate] = useState(() => startOfMonth(subMonths(now, 12)));
  const [endDate] = useState(() => endOfMonth(now));

  const { data: stats, isLoading: statsLoading } = trpc.analytics.dashboard.useQuery();
  const { data: categorySpending, isLoading: catLoading } = trpc.analytics.spendingByCategory.useQuery({
    startDate,
    endDate,
  });
  const { data: monthlySpending, isLoading: monthlyLoading } = trpc.analytics.monthlySpending.useQuery({ months: 12 });
  const { data: bills } = trpc.bills.list.useQuery({});

  const pieData = useMemo(() => {
    if (!categorySpending) return [];
    return categorySpending.map((item) => ({
      name: item.categoryName || "Uncategorized",
      value: parseFloat(item.total ?? "0"),
      color: item.categoryColor || "#6366f1",
    }));
  }, [categorySpending]);

  const barData = useMemo(() => {
    if (!monthlySpending) return [];
    return monthlySpending.map((item) => ({
      month: format(new Date(item.month + "-01"), "MMM"),
      amount: parseFloat(item.total ?? "0"),
      count: item.count,
    }));
  }, [monthlySpending]);

  // Budget vs Actual (bills due vs paid per month)
  const budgetData = useMemo(() => {
    if (!bills) return [];
    const monthMap = new Map<string, { due: number; paid: number }>();
    bills.forEach((bill) => {
      const monthKey = format(new Date(bill.dueDate), "yyyy-MM");
      const existing = monthMap.get(monthKey) ?? { due: 0, paid: 0 };
      existing.due += parseFloat(bill.amount);
      if (bill.status === "paid") {
        existing.paid += parseFloat(bill.amount);
      }
      monthMap.set(monthKey, existing);
    });
    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, val]) => ({
        month: format(new Date(key + "-01"), "MMM"),
        due: val.due,
        paid: val.paid,
      }));
  }, [bills]);

  const totalSpent = useMemo(
    () => pieData.reduce((sum, item) => sum + item.value, 0),
    [pieData]
  );

  const isLoading = statsLoading || catLoading || monthlyLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight font-serif">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Insights into your spending patterns and budget
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Spent</p>
                <p className="text-2xl font-semibold mt-1">
                  ${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Monthly</p>
                <p className="text-2xl font-semibold mt-1">
                  ${barData.length > 0
                    ? (barData.reduce((s, d) => s + d.amount, 0) / barData.length).toLocaleString("en-US", { minimumFractionDigits: 2 })
                    : "0.00"
                  }
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Categories</p>
                <p className="text-2xl font-semibold mt-1">{pieData.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <PieChart className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
                No spending data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Monthly Spending Trend */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Monthly Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
                No spending data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={barData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Spent"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    fill="url(#colorAmount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Budget vs Actual */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Budget vs Actual (Bills Due vs Paid)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {budgetData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
                No data yet — add some bills to see comparisons
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `$${value.toFixed(2)}`,
                      name === "due" ? "Bills Due" : "Bills Paid",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend formatter={(value) => (value === "due" ? "Bills Due" : "Bills Paid")} />
                  <Bar dataKey="due" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="paid" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
