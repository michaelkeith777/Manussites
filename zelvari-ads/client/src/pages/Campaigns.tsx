/*
 * Design: Liquid Amethyst — Campaign management with data table,
 * status badges, and quick actions.
 */
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Plus, Search, Filter, MoreHorizontal, Play, Pause, Copy, Trash2,
  TrendingUp, TrendingDown, ChevronDown, ArrowUpDown,
} from "lucide-react";

const campaigns = [
  { id: 1, name: "Summer Sale 2026 - Collection", platform: "Meta", status: "active", budget: "$500/day", spend: "$12,450", impressions: "2.4M", clicks: "45.2K", ctr: "1.88%", roas: "4.2x", trend: "up" },
  { id: 2, name: "TikTok Spark - Brand Awareness", platform: "TikTok", status: "active", budget: "$300/day", spend: "$8,200", impressions: "5.1M", clicks: "89.3K", ctr: "1.75%", roas: "3.8x", trend: "up" },
  { id: 3, name: "Retargeting - Cart Abandoners", platform: "Meta", status: "active", budget: "$200/day", spend: "$5,600", impressions: "890K", clicks: "23.1K", ctr: "2.60%", roas: "6.1x", trend: "up" },
  { id: 4, name: "Google Shopping - All Products", platform: "Google", status: "paused", budget: "$400/day", spend: "$15,800", impressions: "1.8M", clicks: "34.5K", ctr: "1.92%", roas: "3.2x", trend: "down" },
  { id: 5, name: "Pinterest - Holiday Collection", platform: "Pinterest", status: "active", budget: "$150/day", spend: "$3,200", impressions: "620K", clicks: "12.8K", ctr: "2.06%", roas: "4.5x", trend: "up" },
  { id: 6, name: "Snapchat - Gen Z Targeting", platform: "Snapchat", status: "draft", budget: "$250/day", spend: "$0", impressions: "0", clicks: "0", ctr: "0%", roas: "—", trend: "neutral" },
  { id: 7, name: "Lookalike - Top 1% Customers", platform: "Meta", status: "active", budget: "$350/day", spend: "$9,100", impressions: "1.5M", clicks: "28.9K", ctr: "1.93%", roas: "5.3x", trend: "up" },
  { id: 8, name: "DPA - Dynamic Products", platform: "Meta", status: "active", budget: "$600/day", spend: "$18,400", impressions: "3.2M", clicks: "56.7K", ctr: "1.77%", roas: "4.8x", trend: "up" },
];

export default function Campaigns() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl">Campaigns</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage all your campaigns across platforms.</p>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-600/30 w-fit">
            <Plus size={16} className="mr-2" /> New Campaign
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-secondary border-0 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            {["all", "active", "paused", "draft"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                  statusFilter === s
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30">
                  <th className="text-left text-xs text-muted-foreground font-medium p-4">Campaign</th>
                  <th className="text-left text-xs text-muted-foreground font-medium p-4 hidden lg:table-cell">Platform</th>
                  <th className="text-left text-xs text-muted-foreground font-medium p-4">Status</th>
                  <th className="text-left text-xs text-muted-foreground font-medium p-4 hidden md:table-cell">Spend</th>
                  <th className="text-left text-xs text-muted-foreground font-medium p-4 hidden lg:table-cell">Impressions</th>
                  <th className="text-left text-xs text-muted-foreground font-medium p-4 hidden md:table-cell">CTR</th>
                  <th className="text-left text-xs text-muted-foreground font-medium p-4">ROAS</th>
                  <th className="text-left text-xs text-muted-foreground font-medium p-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                    <td className="p-4">
                      <div className="text-sm font-medium truncate max-w-[200px] lg:max-w-[280px]">{c.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 lg:hidden">{c.platform} · {c.spend}</div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-foreground/70">{c.platform}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                        c.status === "active" ? "bg-green-500/10 text-green-400" :
                        c.status === "paused" ? "bg-amber-500/10 text-amber-400" :
                        "bg-secondary text-muted-foreground"
                      }`}>{c.status}</span>
                    </td>
                    <td className="p-4 text-sm hidden md:table-cell">{c.spend}</td>
                    <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">{c.impressions}</td>
                    <td className="p-4 text-sm hidden md:table-cell">{c.ctr}</td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-sm font-medium">
                        {c.roas}
                        {c.trend === "up" && <TrendingUp size={12} className="text-green-400" />}
                        {c.trend === "down" && <TrendingDown size={12} className="text-red-400" />}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="text-muted-foreground hover:text-foreground transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border/30 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Showing {filtered.length} of {campaigns.length} campaigns</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
