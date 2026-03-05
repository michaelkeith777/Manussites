/*
 * Design: Liquid Amethyst — Analytics dashboard with rich charts,
 * creative performance cards, and metric breakdowns.
 */
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Eye, MousePointerClick,
  Download, Calendar, ArrowUpRight, Image, Video, Star,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

const performanceData = [
  { date: "Mon", roas: 3.8, ctr: 1.6, cpc: 0.45 },
  { date: "Tue", roas: 4.2, ctr: 1.8, cpc: 0.42 },
  { date: "Wed", roas: 3.5, ctr: 1.5, cpc: 0.48 },
  { date: "Thu", roas: 4.8, ctr: 2.1, cpc: 0.38 },
  { date: "Fri", roas: 5.2, ctr: 2.3, cpc: 0.35 },
  { date: "Sat", roas: 4.6, ctr: 2.0, cpc: 0.40 },
  { date: "Sun", roas: 4.1, ctr: 1.7, cpc: 0.43 },
];

const platformData = [
  { name: "Meta", value: 45, color: "#8B5CF6" },
  { name: "TikTok", value: 25, color: "#F59E0B" },
  { name: "Google", value: 15, color: "#06B6D4" },
  { name: "Snapchat", value: 10, color: "#EC4899" },
  { name: "Pinterest", value: 5, color: "#10B981" },
];

const topCreatives = [
  { name: "Summer_Collection_V3_9x16", type: "video", spend: "$4,250", impressions: "1.2M", clicks: "28.5K", ctr: "2.38%", roas: "5.8x", trend: "up" },
  { name: "Flash_Sale_Static_4x5", type: "image", spend: "$3,100", impressions: "890K", clicks: "21.2K", ctr: "2.38%", roas: "5.2x", trend: "up" },
  { name: "Product_Showcase_Carousel", type: "carousel", spend: "$2,800", impressions: "750K", clicks: "18.9K", ctr: "2.52%", roas: "4.9x", trend: "up" },
  { name: "UGC_Testimonial_Reel", type: "video", spend: "$2,200", impressions: "1.5M", clicks: "15.3K", ctr: "1.02%", roas: "4.4x", trend: "down" },
  { name: "Brand_Story_Collection", type: "collection", spend: "$1,900", impressions: "420K", clicks: "12.1K", ctr: "2.88%", roas: "4.1x", trend: "up" },
];

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  impressions: Math.floor(Math.random() * 50000 + 10000),
  clicks: Math.floor(Math.random() * 2000 + 200),
}));

export default function Analytics() {
  const [dateRange, setDateRange] = useState("7d");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl">Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">Creative performance insights and reporting.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-secondary rounded-lg p-0.5">
              {["24h", "7d", "30d", "90d"].map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    dateRange === r ? "bg-purple-600 text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm">
              <Download size={14} className="mr-2" /> Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Spend", value: "$52,800", change: "+18%", up: true, icon: DollarSign },
            { label: "Impressions", value: "14.2M", change: "+31%", up: true, icon: Eye },
            { label: "Clicks", value: "245K", change: "+24%", up: true, icon: MousePointerClick },
            { label: "Top ROAS", value: "5.8x", change: "+0.6x", up: true, icon: Star },
          ].map((m, i) => (
            <div key={i} className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <m.icon size={18} className="text-purple-400" />
                <span className={`text-xs font-medium flex items-center gap-1 ${m.up ? "text-green-400" : "text-red-400"}`}>
                  {m.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {m.change}
                </span>
              </div>
              <div className="text-2xl font-heading font-bold">{m.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* ROAS Trend */}
          <div className="lg:col-span-2 glass-card rounded-xl p-6">
            <h3 className="font-heading font-semibold mb-1">ROAS Trend</h3>
            <p className="text-xs text-muted-foreground mb-6">Return on ad spend over time</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "rgba(20,10,40,0.9)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "8px", fontSize: "12px" }} />
                <Line type="monotone" dataKey="roas" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: "#8B5CF6", r: 4 }} />
                <Line type="monotone" dataKey="ctr" stroke="#F59E0B" strokeWidth={2} dot={{ fill: "#F59E0B", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Split */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-heading font-semibold mb-1">Spend by Platform</h3>
            <p className="text-xs text-muted-foreground mb-4">Distribution across ad platforms</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={platformData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {platformData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "rgba(20,10,40,0.9)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {platformData.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-foreground/70">{p.name}</span>
                  </div>
                  <span className="font-medium">{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Creatives */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading font-semibold">Top Performing Creatives</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Ranked by ROAS</p>
            </div>
            <Button variant="ghost" size="sm" className="text-purple-400">
              View All <ArrowUpRight size={14} className="ml-1" />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left text-xs text-muted-foreground font-medium pb-3">#</th>
                  <th className="text-left text-xs text-muted-foreground font-medium pb-3">Creative</th>
                  <th className="text-left text-xs text-muted-foreground font-medium pb-3 hidden md:table-cell">Spend</th>
                  <th className="text-left text-xs text-muted-foreground font-medium pb-3 hidden lg:table-cell">Impressions</th>
                  <th className="text-left text-xs text-muted-foreground font-medium pb-3 hidden md:table-cell">CTR</th>
                  <th className="text-left text-xs text-muted-foreground font-medium pb-3">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {topCreatives.map((c, i) => (
                  <tr key={i} className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                    <td className="py-3 text-sm text-muted-foreground">{i + 1}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                          {c.type === "video" ? <Video size={16} className="text-purple-400" /> : <Image size={16} className="text-purple-400" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium truncate max-w-[160px] lg:max-w-[240px]">{c.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{c.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-sm hidden md:table-cell">{c.spend}</td>
                    <td className="py-3 text-sm text-muted-foreground hidden lg:table-cell">{c.impressions}</td>
                    <td className="py-3 text-sm hidden md:table-cell">{c.ctr}</td>
                    <td className="py-3">
                      <span className="flex items-center gap-1 text-sm font-semibold text-amber-400">
                        {c.roas}
                        {c.trend === "up" ? <TrendingUp size={12} className="text-green-400" /> : <TrendingDown size={12} className="text-red-400" />}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
