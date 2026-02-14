import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns";

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: bills, isLoading } = trpc.bills.list.useQuery({});
  const { data: categories } = trpc.categories.list.useQuery();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const billsByDate = useMemo(() => {
    const map = new Map<string, typeof bills>();
    bills?.forEach((bill) => {
      const key = format(new Date(bill.dueDate), "yyyy-MM-dd");
      const existing = map.get(key) ?? [];
      existing.push(bill);
      map.set(key, existing);
    });
    return map;
  }, [bills]);

  const selectedBills = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return billsByDate.get(key) ?? [];
  }, [selectedDate, billsByDate]);

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId || !categories) return null;
    return categories.find((c) => c.id === categoryId)?.name;
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-emerald-500";
      case "overdue": return "bg-red-500";
      default: return "bg-amber-500";
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/10 text-[10px]">Paid</Badge>;
      case "overdue":
        return <Badge variant="destructive" className="text-[10px]">Overdue</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/10 text-[10px]">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight font-serif">Calendar</h1>
        <p className="text-muted-foreground text-sm mt-1">
          View your bills by due date
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold font-serif">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-px bg-border/50 rounded-lg overflow-hidden">
              {calendarDays.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const dayBills = billsByDate.get(key) ?? [];
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const today = isToday(day);

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      min-h-[80px] p-1.5 text-left transition-colors bg-background
                      ${!isCurrentMonth ? "opacity-40" : ""}
                      ${isSelected ? "bg-primary/5 ring-2 ring-primary/30 ring-inset" : "hover:bg-muted/50"}
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-medium inline-flex items-center justify-center h-6 w-6 rounded-full
                          ${today ? "bg-primary text-primary-foreground" : ""}
                        `}
                      >
                        {format(day, "d")}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {dayBills.slice(0, 3).map((bill) => (
                        <div
                          key={bill.id}
                          className="flex items-center gap-1 text-[10px] leading-tight"
                        >
                          <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusColor(bill.status)}`} />
                          <span className="truncate">{bill.name}</span>
                        </div>
                      ))}
                      {dayBills.length > 3 && (
                        <p className="text-[10px] text-muted-foreground">
                          +{dayBills.length - 3} more
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-xs text-muted-foreground">Pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground">Paid</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="text-xs text-muted-foreground">Overdue</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Detail */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              {selectedDate ? format(selectedDate, "EEEE, MMMM d") : "Select a date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <div className="text-center py-8">
                <CalendarDays className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Click a date to see bills
                </p>
              </div>
            ) : selectedBills.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No bills on this date</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{bill.name}</p>
                      {statusBadge(bill.status)}
                    </div>
                    <p className="text-lg font-semibold">${parseFloat(bill.amount).toFixed(2)}</p>
                    {getCategoryName(bill.categoryId) && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-1">
                        {getCategoryName(bill.categoryId)}
                      </Badge>
                    )}
                    {bill.description && (
                      <p className="text-xs text-muted-foreground mt-2">{bill.description}</p>
                    )}
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <span className="text-sm font-semibold">
                      ${selectedBills.reduce((sum, b) => sum + parseFloat(b.amount), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
