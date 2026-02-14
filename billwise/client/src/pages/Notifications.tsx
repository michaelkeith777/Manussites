import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bell, BellRing, AlertTriangle, CheckCircle, Loader2, Send, Shield, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Notifications() {
  const { data: prefs, isLoading } = trpc.notifications.getPrefs.useQuery();
  const updatePrefs = trpc.notifications.updatePrefs.useMutation({
    onSuccess: () => {
      utils.notifications.getPrefs.invalidate();
      toast.success("Notification preferences saved!");
    },
  });
  const checkNotify = trpc.notifications.checkAndNotify.useMutation({
    onSuccess: (data) => {
      if (data.sent > 0) {
        toast.success(`Sent ${data.sent} notification${data.sent > 1 ? 's' : ''}!`);
      } else {
        toast.info("No notifications to send right now. All bills are on track!");
      }
    },
    onError: () => toast.error("Failed to send notifications"),
  });
  const utils = trpc.useUtils();
  const [localPrefs, setLocalPrefs] = useState<{
    enableReminders?: boolean;
    reminderDaysBefore?: number;
    enableOverdueAlerts?: boolean;
  }>({});

  const currentPrefs = {
    enableReminders: localPrefs.enableReminders ?? prefs?.enableReminders ?? true,
    reminderDaysBefore: localPrefs.reminderDaysBefore ?? prefs?.reminderDaysBefore ?? 3,
    enableOverdueAlerts: localPrefs.enableOverdueAlerts ?? prefs?.enableOverdueAlerts ?? true,
  };

  const handleSave = () => {
    updatePrefs.mutate(currentPrefs);
    setLocalPrefs({});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">Configure bill reminders and overdue alerts</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <BellRing className="h-5 w-5 text-primary" />
              Upcoming Bill Reminders
            </CardTitle>
            <CardDescription>Get notified before bills are due</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground">Enable Reminders</Label>
                <p className="text-xs text-muted-foreground">Receive notifications for upcoming bills</p>
              </div>
              <Switch
                checked={currentPrefs.enableReminders}
                onCheckedChange={(checked) => setLocalPrefs(p => ({ ...p, enableReminders: checked }))}
              />
            </div>

            {currentPrefs.enableReminders && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <Label className="text-sm font-medium text-foreground">Remind me before due date</Label>
                <Select
                  value={String(currentPrefs.reminderDaysBefore)}
                  onValueChange={(val) => setLocalPrefs(p => ({ ...p, reminderDaysBefore: parseInt(val) }))}
                >
                  <SelectTrigger className="w-48 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day before</SelectItem>
                    <SelectItem value="2">2 days before</SelectItem>
                    <SelectItem value="3">3 days before</SelectItem>
                    <SelectItem value="5">5 days before</SelectItem>
                    <SelectItem value="7">7 days before</SelectItem>
                    <SelectItem value="14">14 days before</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Overdue Alerts
            </CardTitle>
            <CardDescription>Get alerted when bills become overdue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground">Enable Overdue Alerts</Label>
                <p className="text-xs text-muted-foreground">Receive urgent notifications for overdue bills</p>
              </div>
              <Switch
                checked={currentPrefs.enableOverdueAlerts}
                onCheckedChange={(checked) => setLocalPrefs(p => ({ ...p, enableOverdueAlerts: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-3"
      >
        <Button
          onClick={handleSave}
          disabled={updatePrefs.isPending}
          className="bg-gradient-to-r from-primary to-chart-2 text-white border-0 hover:opacity-90"
        >
          {updatePrefs.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Save Preferences
        </Button>
        <Button
          variant="outline"
          onClick={() => checkNotify.mutate()}
          disabled={checkNotify.isPending}
          className="border-primary/30 text-primary hover:bg-primary/10"
        >
          {checkNotify.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Check & Send Now
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-card-foreground">
              <Shield className="h-4 w-4 text-primary" />
              How Notifications Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <p>Notifications are sent to the app owner when you click "Check & Send Now" or when the system detects upcoming or overdue bills.</p>
            </div>
            <div className="flex items-start gap-3">
              <BellRing className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <p>Upcoming bill reminders include the bill name, amount, and days until due date.</p>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
              <p>Overdue alerts are sent for any bill past its due date that hasn't been marked as paid.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
