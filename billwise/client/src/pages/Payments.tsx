import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  CreditCard,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Payments() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: payments, isLoading } = trpc.payments.list.useQuery({});
  const { data: bills } = trpc.bills.list.useQuery({});

  const unpaidBills = useMemo(
    () => bills?.filter((b) => b.status !== "paid") ?? [],
    [bills]
  );

  const createPayment = trpc.payments.create.useMutation({
    onSuccess: () => {
      utils.payments.list.invalidate();
      utils.bills.list.invalidate();
      utils.analytics.dashboard.invalidate();
      setDialogOpen(false);
      setSelectedBill("");
      setPayAmount("");
      setPayMethod("");
      setPayNotes("");
      toast.success("Payment recorded successfully");
    },
    onError: (err) => toast.error(err.message),
  });

  const deletePayment = trpc.payments.delete.useMutation({
    onSuccess: () => {
      utils.payments.list.invalidate();
      utils.bills.list.invalidate();
      utils.analytics.dashboard.invalidate();
      setDeleteId(null);
      toast.success("Payment deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  const getBillName = (billId: number) => {
    return bills?.find((b) => b.id === billId)?.name ?? `Bill #${billId}`;
  };

  const totalPaid = useMemo(
    () => payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) ?? 0,
    [payments]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
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
          <h1 className="text-2xl font-display font-bold gradient-text">Payments</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track and manage your payment history
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-gradient-to-r from-primary to-chart-2 text-white border-0 hover:opacity-90 transition-all">
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Payments</p>
                <p className="text-2xl font-display font-bold mt-1">{payments?.length ?? 0}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount Paid</p>
                <p className="text-2xl font-display font-bold mt-1">
                  ${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      {!payments || payments.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <CreditCard className="h-12 w-12 text-muted-foreground/20 mb-4" />
            </motion.div>
            <p className="text-muted-foreground text-sm">No payments recorded yet</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Record your first payment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
          {payments.map((payment, index) => (
            <motion.div key={payment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{getBillName(payment.billId)}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(payment.paidAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        {payment.method && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {payment.method}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-emerald-600">
                      ${parseFloat(payment.amount).toFixed(2)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(payment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
      )}

      {/* Record Payment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md glass-strong">
          <DialogHeader>
            <DialogTitle className="font-display">Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Bill *</Label>
              <Select value={selectedBill} onValueChange={(v) => {
                setSelectedBill(v);
                const bill = unpaidBills.find((b) => b.id.toString() === v);
                if (bill) setPayAmount(bill.amount);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a bill" />
                </SelectTrigger>
                <SelectContent>
                  {unpaidBills.map((bill) => (
                    <SelectItem key={bill.id} value={bill.id.toString()}>
                      {bill.name} — ${parseFloat(bill.amount).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={payMethod} onValueChange={setPayMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                placeholder="Optional notes..."
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selectedBill || !payAmount) {
                  toast.error("Please select a bill and enter an amount");
                  return;
                }
                createPayment.mutate({
                  billId: parseInt(selectedBill),
                  amount: payAmount,
                  method: payMethod || undefined,
                  notes: payNotes || undefined,
                });
              }}
              disabled={createPayment.isPending}
              className="bg-gradient-to-r from-chart-5 to-chart-2 text-white border-0"
            >
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this payment record. The associated bill will be marked as unpaid.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deletePayment.mutate({ id: deleteId })}
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
