import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  Receipt,
  Pencil,
  Trash2,
  CheckCircle2,
  Filter,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type BillFormData = {
  name: string;
  description: string;
  amount: string;
  dueDate: string;
  categoryId: string;
  isRecurring: boolean;
  recurringInterval: string;
  autopay: boolean;
  notes: string;
};

const defaultForm: BillFormData = {
  name: "",
  description: "",
  amount: "",
  dueDate: format(new Date(), "yyyy-MM-dd"),
  categoryId: "",
  isRecurring: false,
  recurringInterval: "monthly",
  autopay: false,
  notes: "",
};

export default function Bills() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<number | null>(null);
  const [form, setForm] = useState<BillFormData>(defaultForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [payBillId, setPayBillId] = useState<number | null>(null);
  const [payAmount, setPayAmount] = useState("");

  const utils = trpc.useUtils();
  const { data: bills, isLoading } = trpc.bills.list.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    categoryId: categoryFilter !== "all" ? parseInt(categoryFilter) : undefined,
    search: search || undefined,
  });
  const { data: categories } = trpc.categories.list.useQuery();

  const createBill = trpc.bills.create.useMutation({
    onSuccess: () => {
      utils.bills.list.invalidate();
      utils.analytics.dashboard.invalidate();
      setDialogOpen(false);
      setForm(defaultForm);
      toast.success("Bill created successfully");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateBill = trpc.bills.update.useMutation({
    onSuccess: () => {
      utils.bills.list.invalidate();
      utils.analytics.dashboard.invalidate();
      setDialogOpen(false);
      setEditingBill(null);
      setForm(defaultForm);
      toast.success("Bill updated successfully");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteBill = trpc.bills.delete.useMutation({
    onSuccess: () => {
      utils.bills.list.invalidate();
      utils.analytics.dashboard.invalidate();
      setDeleteId(null);
      toast.success("Bill deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  const createPayment = trpc.payments.create.useMutation({
    onSuccess: () => {
      utils.bills.list.invalidate();
      utils.payments.list.invalidate();
      utils.analytics.dashboard.invalidate();
      setPayDialogOpen(false);
      setPayBillId(null);
      setPayAmount("");
      toast.success("Payment recorded");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!form.name || !form.amount || !form.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    const data = {
      name: form.name,
      description: form.description || undefined,
      amount: form.amount,
      dueDate: new Date(form.dueDate),
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      isRecurring: form.isRecurring,
      recurringInterval: form.isRecurring ? (form.recurringInterval as any) : null,
      autopay: form.autopay,
      notes: form.notes || undefined,
    };

    if (editingBill) {
      updateBill.mutate({ id: editingBill, ...data });
    } else {
      createBill.mutate(data);
    }
  };

  const openEdit = (bill: any) => {
    setEditingBill(bill.id);
    setForm({
      name: bill.name,
      description: bill.description || "",
      amount: bill.amount,
      dueDate: format(new Date(bill.dueDate), "yyyy-MM-dd"),
      categoryId: bill.categoryId?.toString() || "",
      isRecurring: bill.isRecurring,
      recurringInterval: bill.recurringInterval || "monthly",
      autopay: bill.autopay,
      notes: bill.notes || "",
    });
    setDialogOpen(true);
  };

  const openPay = (bill: any) => {
    setPayBillId(bill.id);
    setPayAmount(bill.amount);
    setPayDialogOpen(true);
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId || !categories) return null;
    return categories.find((c) => c.id === categoryId)?.name;
  };

  const getCategoryColor = (categoryId: number | null) => {
    if (!categoryId || !categories) return "#6366f1";
    return categories.find((c) => c.id === categoryId)?.color ?? "#6366f1";
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/10">Paid</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/10">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight font-serif">Bills</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and track all your bills
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingBill(null);
            setForm(defaultForm);
            setDialogOpen(true);
          }}
          className="shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Bill
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bills List */}
      {!bills || bills.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Receipt className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-sm">No bills found</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setEditingBill(null);
                setForm(defaultForm);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add your first bill
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {bills.map((bill) => (
            <Card key={bill.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="h-10 w-1 rounded-full shrink-0"
                      style={{ backgroundColor: getCategoryColor(bill.categoryId) }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate">{bill.name}</p>
                        {bill.isRecurring && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            <RefreshCw className="h-2.5 w-2.5 mr-1" />
                            {bill.recurringInterval}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <p className="text-xs text-muted-foreground">
                          Due {format(new Date(bill.dueDate), "MMM d, yyyy")}
                        </p>
                        {getCategoryName(bill.categoryId) && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {getCategoryName(bill.categoryId)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold">${parseFloat(bill.amount).toFixed(2)}</p>
                      <div className="mt-1">{statusBadge(bill.status)}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {bill.status !== "paid" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                          onClick={() => openPay(bill)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(bill)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(bill.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editingBill ? "Edit Bill" : "Add New Bill"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Bill Name *</Label>
              <Input
                placeholder="e.g., Electric Bill"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Recurring Bill</Label>
              <Switch
                checked={form.isRecurring}
                onCheckedChange={(v) => setForm({ ...form, isRecurring: v })}
              />
            </div>
            {form.isRecurring && (
              <div className="space-y-2">
                <Label>Recurring Interval</Label>
                <Select
                  value={form.recurringInterval}
                  onValueChange={(v) => setForm({ ...form, recurringInterval: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Biweekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Optional notes..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createBill.isPending || updateBill.isPending}
            >
              {editingBill ? "Save Changes" : "Add Bill"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pay Dialog */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Payment Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (payBillId && payAmount) {
                  createPayment.mutate({ billId: payBillId, amount: payAmount });
                }
              }}
              disabled={createPayment.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark as Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this bill and all associated payment records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteBill.mutate({ id: deleteId })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
