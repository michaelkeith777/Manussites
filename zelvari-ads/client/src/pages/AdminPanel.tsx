/**
 * Admin Panel — Manage users, subscriptions, and platform settings.
 * Only accessible to admin users.
 */
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Shield, Users, CreditCard, BarChart3, Settings,
  Crown, Edit, Loader2,
} from "lucide-react";

const PLAN_CREDITS: Record<string, number> = {
  free: 10,
  pro: 100,
  agency: 500,
  enterprise: 9999,
};

export default function AdminPanel() {
  const { user } = useAuth();
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editPlan, setEditPlan] = useState("free");
  const [editCredits, setEditCredits] = useState(10);

  const usersQuery = trpc.admin.users.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const updatePlanMutation = trpc.admin.updateUserPlan.useMutation({
    onSuccess: () => {
      usersQuery.refetch();
      setEditingUser(null);
      toast.success("User plan updated");
    },
    onError: (err) => toast.error(err.message),
  });

  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="py-20 text-center">
          <Shield size={48} className="text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading font-bold text-xl mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  const allUsers = usersQuery.data ?? [];
  const planCounts = {
    free: allUsers.filter(u => u.plan === "free").length,
    pro: allUsers.filter(u => u.plan === "pro").length,
    agency: allUsers.filter(u => u.plan === "agency").length,
    enterprise: allUsers.filter(u => u.plan === "enterprise").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-red-500 flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">Manage users, subscriptions, and platform settings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: allUsers.length, icon: Users, color: "from-purple-500 to-purple-700" },
            { label: "Free Users", value: planCounts.free, icon: CreditCard, color: "from-gray-500 to-gray-700" },
            { label: "Pro Users", value: planCounts.pro, icon: Crown, color: "from-blue-500 to-blue-700" },
            { label: "Agency+", value: planCounts.agency + planCounts.enterprise, icon: BarChart3, color: "from-amber-500 to-orange-600" },
          ].map((stat, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-heading font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon size={18} className="text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Users Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {usersQuery.isLoading ? (
              <div className="py-10 text-center">
                <Loader2 className="animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading users...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {(u.name || u.email || "U").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{u.name || "Unnamed"}</p>
                              <p className="text-xs text-muted-foreground">{u.email || u.openId.slice(0, 12)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.role === "admin" ? "default" : "outline"} className="text-xs capitalize">
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs capitalize ${
                            u.plan === "enterprise" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                            u.plan === "agency" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" :
                            u.plan === "pro" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                            "bg-secondary text-muted-foreground"
                          }`}>
                            {u.plan}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {u.creditsRemaining} / {u.creditsMonthly}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingUser(u);
                              setEditPlan(u.plan);
                              setEditCredits(u.creditsMonthly);
                            }}
                          >
                            <Edit size={14} className="mr-1" /> Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit User Plan</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">{editingUser.name || "Unnamed User"}</p>
                <p className="text-xs text-muted-foreground">{editingUser.email || editingUser.openId}</p>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Subscription Plan</Label>
                <Select value={editPlan} onValueChange={(v) => { setEditPlan(v); setEditCredits(PLAN_CREDITS[v] || 10); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free (10 credits/mo)</SelectItem>
                    <SelectItem value="pro">Pro (100 credits/mo)</SelectItem>
                    <SelectItem value="agency">Agency (500 credits/mo)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (Unlimited)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Monthly Credits</Label>
                <Input
                  type="number"
                  value={editCredits}
                  onChange={(e) => setEditCredits(Number(e.target.value))}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button
              onClick={() => {
                if (editingUser) {
                  updatePlanMutation.mutate({
                    userId: editingUser.id,
                    plan: editPlan as any,
                    creditsMonthly: editCredits,
                  });
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-purple-500 text-white"
              disabled={updatePlanMutation.isPending}
            >
              {updatePlanMutation.isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
