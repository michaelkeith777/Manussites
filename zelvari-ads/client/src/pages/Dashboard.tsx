/*
 * Design: Liquid Amethyst — Dashboard with glassmorphic metric cards,
 * purple gradient accents, and warm gold highlights for key metrics.
 */
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Rocket, TrendingUp, TrendingDown, DollarSign, Eye, MousePointerClick,
  BarChart3, ArrowUpRight, Plus, Clock, CheckCircle2, AlertCircle,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const chartData = [
  { name: "Jan", ads: 420, spend: 12400 },
  { name: "Feb", ads: 580, spend: 15200 },
  { name: "Mar", ads: 750, spend: 18900 },
  { name: "Apr", ads: 890, spend: 22100 },
  { name: "May", ads: 1020, spend: 25800 },
  { name: "Jun", ads: 1340, spend: 31200 },
  { name: "Jul", ads: 1180, spend: 28400 },
  { name: "Aug", ads: 1560, spend: 35600 },
  { name: "Sep", ads: 1420, spend: 33100 },
  { name: "Oct", ads: 1780, spend: 41200 },
  { name: "Nov", ads: 2100, spend: 48500 },
  { name: "Dec", ads: 2340, spend: 52800 },
];

const recentBatches = [
  { name: "Summer_Sale_Collection_V3", ads: 24, sets: 3, user: "Sarah C.", status: "success", time: "2 min ago" },
  { name: "BF_Retargeting_Carousel", ads: 48, sets: 6, user: "Mike J.", status: "success", time: "15 min ago" },
  { name: "Q1_Brand_Awareness_Multi", ads: 12, sets: 2, user: "Emma W.", status: "processing", time: "22 min ago" },
  { name: "Holiday_DPA_AllProducts", ads: 156, sets: 12, user: "John D.", status: "success", time: "1 hr ago" },
  { name: "TikTok_Spark_TestBatch", ads: 8, sets: 1, user: "James L.", status: "failed", time: "2 hrs ago" },
];

export default function Dashboard() {
  const metrics = [
    { label: "Ads Launched", value: "2,847", change: "+24%", up: true, icon: Rocket, color: "from-purple-500 to-purple-700" },
    { label: "Total Spend", value: "$52.8K", change: "+18%", up: true, icon: DollarSign, color: "from-amber-500 to-orange-600" },
    { label: "Impressions", value: "4.2M", change: "+31%", up: true, icon: Eye, color: "from-blue-500 to-cyan-600" },
    { label: "Avg. ROAS", value: "4.4x", change: "-0.2x", up: false, icon: BarChart3, color: "from-green-500 to-emerald-600" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Welcome back, John. Here's your ad performance overview.</p>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-600/30 w-fit">
            <Plus size={16} className="mr-2" /> Launch New Ads
          </Button>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <div key={i} className="glass-card rounded-xl p-5 hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center shadow-lg`}>
                  <m.icon size={18} className="text-white" />
                </div>
                <span className={`text-xs font-medium flex items-center gap-1 ${m.up ? "text-green-400" : "text-red-400"}`}>
                  {m.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {m.change}
                </span>
              </div>
              <div className="text-2xl font-heading font-bold">{m.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Ads launched chart */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading font-semibold">Ads Launched</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Monthly ad launch volume</p>
              </div>
              <select className="text-xs bg-secondary rounded-lg px-3 py-1.5 border-0 text-foreground">
                <option>Last 12 months</option>
                <option>Last 6 months</option>
                <option>Last 30 days</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "rgba(20,10,40,0.9)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "8px", fontSize: "12px" }}
                  labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                />
                <Area type="monotone" dataKey="ads" stroke="#8B5CF6" fill="url(#purpleGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Spend chart */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading font-semibold">Ad Spend</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Monthly spend across all platforms</p>
              </div>
              <select className="text-xs bg-secondary rounded-lg px-3 py-1.5 border-0 text-foreground">
                <option>Last 12 months</option>
                <option>Last 6 months</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "rgba(20,10,40,0.9)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value: number) => [`$${(value / 1000).toFixed(1)}K`, "Spend"]}
                />
                <Bar dataKey="spend" fill="#F59E0B" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent batches */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading font-semibold">Recent Ad Batches</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Latest ad launches across all accounts</p>
            </div>
            <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
              View All <ArrowUpRight size={14} className="ml-1" />
            </Button>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left text-xs text-muted-foreground font-medium pb-3">Batch Name</th>
                  <th className="text-left text-xs text-muted-foreground font-medium pb-3">Ads</th>
                  <th className="text-left text-xs text-muted-foreground font-medium pb-3">Ad Sets</th>
                  <th className="text-left text-xs text-muted-foreground font-medium pb-3">User</th>
                  <th className="text-left text-xs text-muted-foreground font-medium pb-3">Status</th>
                  <th className="text-left text-xs text-muted-foreground font-medium pb-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentBatches.map((b, i) => (
                  <tr key={i} className="border-b border-border/20 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 text-sm font-medium truncate max-w-[200px]">{b.name}</td>
                    <td className="py-3 text-sm text-muted-foreground">{b.ads}</td>
                    <td className="py-3 text-sm text-muted-foreground">{b.sets}</td>
                    <td className="py-3 text-sm text-muted-foreground">{b.user}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                        b.status === "success" ? "bg-green-500/10 text-green-400" :
                        b.status === "processing" ? "bg-amber-500/10 text-amber-400" :
                        "bg-red-500/10 text-red-400"
                      }`}>
                        {b.status === "success" ? <CheckCircle2 size={12} /> :
                         b.status === "processing" ? <Clock size={12} /> :
                         <AlertCircle size={12} />}
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">{b.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {recentBatches.map((b, i) => (
              <div key={i} className="bg-secondary/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate max-w-[180px]">{b.name}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    b.status === "success" ? "bg-green-500/10 text-green-400" :
                    b.status === "processing" ? "bg-amber-500/10 text-amber-400" :
                    "bg-red-500/10 text-red-400"
                  }`}>{b.status}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{b.ads} ads</span>
                  <span>{b.sets} sets</span>
                  <span>{b.user}</span>
                  <span className="ml-auto">{b.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
