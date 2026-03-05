/*
 * Design: Liquid Amethyst — Automated rules engine with rule cards,
 * builder interface, and activity log.
 */
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Plus, Zap, Pause, TrendingUp, DollarSign, AlertCircle, Bell,
  ToggleLeft, ToggleRight, Clock, CheckCircle2, Edit, Trash2,
} from "lucide-react";
import { toast } from "sonner";

const rules = [
  { id: 1, name: "Pause Low ROAS Ads", condition: "If ROAS < 1.5x for 3 days", action: "Pause ad", active: true, triggered: 12, saved: "$2,400", icon: Pause, color: "from-red-500 to-pink-600" },
  { id: 2, name: "Scale Winning Ads", condition: "If ROAS > 3x & Spend > $100", action: "Increase budget 20%", active: true, triggered: 8, saved: "+$4,200 revenue", icon: TrendingUp, color: "from-green-500 to-emerald-600" },
  { id: 3, name: "CPA Alert", condition: "If CPA > $15", action: "Send notification", active: true, triggered: 24, saved: "24 alerts sent", icon: Bell, color: "from-amber-500 to-orange-600" },
  { id: 4, name: "Budget Cap Protection", condition: "If Daily spend > $500", action: "Pause campaign", active: true, triggered: 3, saved: "$1,500 protected", icon: DollarSign, color: "from-blue-500 to-cyan-600" },
  { id: 5, name: "Low CTR Detector", condition: "If CTR < 0.5% for 2 days", action: "Pause and notify", active: false, triggered: 0, saved: "—", icon: AlertCircle, color: "from-purple-500 to-violet-600" },
  { id: 6, name: "Frequency Cap", condition: "If Frequency > 3.0", action: "Reduce budget 30%", active: true, triggered: 5, saved: "$800 saved", icon: Clock, color: "from-teal-500 to-cyan-600" },
];

const recentActivity = [
  { rule: "Pause Low ROAS Ads", ad: "Summer_Sale_V2_Static", action: "Paused", time: "5 min ago", status: "success" },
  { rule: "Scale Winning Ads", ad: "UGC_Testimonial_Reel_03", action: "Budget +20%", time: "22 min ago", status: "success" },
  { rule: "CPA Alert", ad: "Retargeting_Cart_DPA", action: "Alert sent", time: "1 hr ago", status: "alert" },
  { rule: "Budget Cap Protection", ad: "Brand_Awareness_Campaign", action: "Campaign paused", time: "2 hrs ago", status: "success" },
  { rule: "Frequency Cap", ad: "Holiday_Collection_Carousel", action: "Budget -30%", time: "3 hrs ago", status: "success" },
];

export default function RulesEngine() {
  const [activeRules, setActiveRules] = useState(rules);

  const toggleRule = (id: number) => {
    setActiveRules(prev => prev.map(r =>
      r.id === id ? { ...r, active: !r.active } : r
    ));
    const rule = activeRules.find(r => r.id === id);
    toast.success(`Rule "${rule?.name}" ${rule?.active ? "disabled" : "enabled"}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl">Automated Rules</h1>
            <p className="text-muted-foreground text-sm mt-1">Set rules. Let them run 24/7.</p>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-600/30 w-fit">
            <Plus size={16} className="mr-2" /> Create Rule
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Rules", value: activeRules.filter(r => r.active).length.toString(), icon: Zap },
            { label: "Triggered Today", value: "47", icon: CheckCircle2 },
            { label: "Money Saved", value: "$4,700", icon: DollarSign },
            { label: "Monitoring", value: "24/7", icon: Clock },
          ].map((s, i) => (
            <div key={i} className="glass-card rounded-xl p-5 text-center">
              <s.icon size={20} className="mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-heading font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Rules Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeRules.map((rule) => (
            <div key={rule.id} className={`glass-card rounded-xl p-5 transition-all hover:scale-[1.02] ${!rule.active ? "opacity-50" : ""}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rule.color} flex items-center justify-center shadow-lg`}>
                  <rule.icon size={18} className="text-white" />
                </div>
                <button onClick={() => toggleRule(rule.id)} className="text-foreground/60 hover:text-foreground transition-colors">
                  {rule.active ? <ToggleRight size={28} className="text-purple-400" /> : <ToggleLeft size={28} />}
                </button>
              </div>
              <h3 className="font-heading font-semibold text-sm mb-1">{rule.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{rule.condition} → {rule.action}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Triggered {rule.triggered}x this week</span>
                <span className="text-amber-400 font-medium">{rule.saved}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="ghost" size="sm" className="text-xs flex-1"><Edit size={12} className="mr-1" /> Edit</Button>
                <Button variant="ghost" size="sm" className="text-xs text-red-400 hover:text-red-300"><Trash2 size={12} /></Button>
              </div>
            </div>
          ))}
        </div>

        {/* Activity Log */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-heading font-semibold mb-4">Recent Rule Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-4 bg-secondary/20 rounded-lg p-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  a.status === "success" ? "bg-green-400" : "bg-amber-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="font-medium">{a.rule}</span>
                    <span className="text-muted-foreground"> — {a.action}</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{a.ad}</div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
