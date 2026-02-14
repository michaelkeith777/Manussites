import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  Briefcase,
  TrendingUp,
  Wallet,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export default function Income() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    frequency: "monthly" as "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly",
    source: "",
    isActive: true,
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: incomes, isLoading } = trpc.income.list.useQuery();
  const { data: monthlyTotal } = trpc.income.monthlyTotal.useQuery();

  const createIncome = trpc.income.create.useMutation({
    onSuccess: () => {
      utils.income.list.invalidate();
      utils.income.monthlyTotal.invalidate();
      utils.analytics.dashboard.invalidate();
      toast.success("Income source added!");
      resetForm();
    },
  });

  const updateIncome = trpc.income.update.useMutation({
    onSuccess: () => {
      utils.income.list.invalidate();
      utils.income.monthlyTotal.invalidate();
      utils.analytics.dashboard.invalidate();
      toast.success("Income updated!");
      resetForm();
    },
  });

  const deleteIncome = trpc.income.delete.useMutation({
    onSuccess: () => {
      utils.income.list.invalidate();
      utils.income.monthlyTotal.invalidate();
      utils.analytics.dashboard.invalidate();
      toast.success("Income source removed");
    },
  });

  const resetForm = () => {
    setFormData({ name: "", amount: "", frequency: "monthly", source: "", isActive: true, notes: "" });
    setEditingIncome(null);
    setDialogOpen(false);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.amount) {
      toast.error("Please fill in name and amount");
      return;
    }
    if (editingIncome) {
      updateIncome.mutate({ id: editingIncome.id, ...formData });
    } else {
      createIncome.mutate(formData);
    }
  };

  const openEdit = (income: any) => {
    setEditingIncome(income);
    setFormData({
      name: income.name,
      amount: income.amount,
      frequency: income.frequency,
      source: income.source || "",
      isActive: income.isActive,
      notes: income.notes || "",
    });
    setDialogOpen(true);
  };

  const activeIncomes = useMemo(() => incomes?.filter(i => i.isActive) ?? [], [incomes]);
  const inactiveIncomes = useMemo(() => incomes?.filter(i => !i.isActive) ?? [], [incomes]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold gradient-text">Income</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your income sources</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-chart-2 text-white border-0 hover:opacity-90 transition-all">
              <Plus className="h-4 w-4 mr-2" />
              Add Income
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingIncome ? "Edit Income" : "Add Income Source"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="e.g., Salary, Freelance, Side hustle"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(v: any) => setFormData(prev => ({ ...prev, frequency: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Source (optional)</Label>
                <Input
                  placeholder="e.g., Company name, Client"
                  value={formData.source}
                  onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch checked={formData.isActive} onCheckedChange={(v) => setFormData(prev => ({ ...prev, isActive: v }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit} className="bg-gradient-to-r from-primary to-chart-2 text-white border-0">
                {editingIncome ? "Update" : "Add Income"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/10 to-primary/5 neon-purple">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Monthly Income</p>
                  <p className="text-2xl font-display font-bold mt-1">${parseFloat(monthlyTotal ?? "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Sources</p>
                  <p className="text-2xl font-display font-bold mt-1">{activeIncomes.length}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-chart-2/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-chart-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Yearly Estimate</p>
                  <p className="text-2xl font-display font-bold mt-1">${(parseFloat(monthlyTotal ?? "0") * 12).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-chart-3/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Income List */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display font-semibold flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Income Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(!incomes || incomes.length === 0) ? (
            <div className="text-center py-12">
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <DollarSign className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              </motion.div>
              <p className="text-sm text-muted-foreground">No income sources yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add your income to generate AI-powered budgets</p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-2">
                {incomes.map((income, index) => (
                  <motion.div
                    key={income.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:bg-muted/30 ${
                      !income.isActive ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{income.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {FREQUENCY_LABELS[income.frequency]}
                          </Badge>
                          {income.source && (
                            <span className="text-xs text-muted-foreground">{income.source}</span>
                          )}
                          {!income.isActive && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-display font-bold">${parseFloat(income.amount).toFixed(2)}</p>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(income)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteIncome.mutate({ id: income.id })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
