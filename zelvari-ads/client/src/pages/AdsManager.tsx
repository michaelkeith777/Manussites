/*
 * Design: Liquid Amethyst — Native Ads Manager with bulk edit,
 * status toggles, and advanced filtering.
 */
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Search, Filter, MoreHorizontal, Play, Pause, Copy, Trash2,
  Edit, Download, RefreshCw, ChevronDown, Check, X, Eye,
  ToggleLeft, ToggleRight, Columns, SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

type Ad = {
  id: number;
  name: string;
  campaign: string;
  adSet: string;
  status: "active" | "paused" | "rejected" | "pending";
  spend: string;
  impressions: string;
  clicks: string;
  ctr: string;
  cpc: string;
  roas: string;
  selected: boolean;
};

const initialAds: Ad[] = [
  { id: 1, name: "Summer_Sale_V3_9x16", campaign: "Summer Sale 2026", adSet: "Lookalike 1%", status: "active", spend: "$1,245", impressions: "342K", clicks: "8.2K", ctr: "2.40%", cpc: "$0.15", roas: "5.2x", selected: false },
  { id: 2, name: "Summer_Sale_V3_4x5", campaign: "Summer Sale 2026", adSet: "Lookalike 1%", status: "active", spend: "$980", impressions: "267K", clicks: "6.1K", ctr: "2.28%", cpc: "$0.16", roas: "4.8x", selected: false },
  { id: 3, name: "Flash_Sale_Static_01", campaign: "Flash Sale Q1", adSet: "Interest Targeting", status: "active", spend: "$756", impressions: "198K", clicks: "4.8K", ctr: "2.42%", cpc: "$0.16", roas: "4.5x", selected: false },
  { id: 4, name: "UGC_Testimonial_Reel", campaign: "Brand Awareness", adSet: "Broad Targeting", status: "paused", spend: "$2,100", impressions: "1.5M", clicks: "15.3K", ctr: "1.02%", cpc: "$0.14", roas: "2.1x", selected: false },
  { id: 5, name: "Product_Carousel_Holiday", campaign: "Holiday Collection", adSet: "Retargeting 30d", status: "active", spend: "$1,890", impressions: "456K", clicks: "12.1K", ctr: "2.65%", cpc: "$0.16", roas: "6.1x", selected: false },
  { id: 6, name: "DPA_AllProducts_Dynamic", campaign: "DPA Campaigns", adSet: "All Products", status: "active", spend: "$3,200", impressions: "890K", clicks: "18.9K", ctr: "2.12%", cpc: "$0.17", roas: "4.2x", selected: false },
  { id: 7, name: "Brand_Story_Collection_V2", campaign: "Brand Awareness", adSet: "Interest + LLA", status: "rejected", spend: "$0", impressions: "0", clicks: "0", ctr: "0%", cpc: "$0", roas: "—", selected: false },
  { id: 8, name: "TikTok_Spark_UGC_01", campaign: "TikTok Growth", adSet: "Smart+ Auto", status: "active", spend: "$890", impressions: "2.1M", clicks: "42.3K", ctr: "2.01%", cpc: "$0.02", roas: "3.8x", selected: false },
  { id: 9, name: "Retargeting_Cart_V5", campaign: "Retargeting", adSet: "Cart 7d", status: "active", spend: "$567", impressions: "123K", clicks: "5.6K", ctr: "4.55%", cpc: "$0.10", roas: "7.2x", selected: false },
  { id: 10, name: "Snap_Story_GenZ_01", campaign: "Snapchat Reach", adSet: "18-24 Interest", status: "pending", spend: "$0", impressions: "0", clicks: "0", ctr: "0%", cpc: "$0", roas: "—", selected: false },
];

export default function AdsManager() {
  const [ads, setAds] = useState<Ad[]>(initialAds);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const selectedCount = ads.filter(a => a.selected).length;

  const toggleSelect = (id: number) => {
    setAds(prev => prev.map(a => a.id === id ? { ...a, selected: !a.selected } : a));
  };

  const toggleAll = () => {
    const allSelected = ads.every(a => a.selected);
    setAds(prev => prev.map(a => ({ ...a, selected: !allSelected })));
  };

  const bulkAction = (action: string) => {
    toast.success(`${action} applied to ${selectedCount} ads`);
    setAds(prev => prev.map(a => ({ ...a, selected: false })));
  };

  const filtered = ads.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.campaign.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl">Ads Manager</h1>
            <p className="text-muted-foreground text-sm mt-1">Native ads manager with bulk edit capabilities.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><RefreshCw size={14} className="mr-2" /> Sync</Button>
            <Button variant="outline" size="sm"><Download size={14} className="mr-2" /> Export</Button>
          </div>
        </div>

        {/* Bulk actions bar */}
        {selectedCount > 0 && (
          <div className="glass-card rounded-xl p-4 flex flex-wrap items-center gap-3 border border-purple-500/30">
            <span className="text-sm font-medium">{selectedCount} ads selected</span>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => bulkAction("Turn On")}><Play size={12} className="mr-1" /> Turn On</Button>
              <Button size="sm" variant="outline" onClick={() => bulkAction("Pause")}><Pause size={12} className="mr-1" /> Pause</Button>
              <Button size="sm" variant="outline" onClick={() => bulkAction("Duplicate")}><Copy size={12} className="mr-1" /> Duplicate</Button>
              <Button size="sm" variant="outline" className="text-red-400" onClick={() => bulkAction("Delete")}><Trash2 size={12} className="mr-1" /> Delete</Button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ads by name or campaign..."
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-secondary border-0 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "active", "paused", "rejected", "pending"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
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
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={ads.every(a => a.selected)}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-border bg-secondary"
                    />
                  </th>
                  <th className="text-left text-xs text-muted-foreground font-medium p-4">Ad Name</th>
                  <th className="text-left text-xs text-muted-foreground font-medium p-4 hidden lg:table-cell">Campaign</th>
                  <th className="text-left text-xs text-muted-foreground font-medium p-4">Status</th>
                  <th className="text-left text-xs text-muted-foreground font-medium p-4 hidden md:table-cell">Spend</th>
                  <th className="text-left text-xs text-muted-foreground font-medium p-4 hidden lg:table-cell">Impressions</th>
                  <th className="text-left text-xs text-muted-foreground font-medium p-4 hidden md:table-cell">CTR</th>
                  <th className="text-left text-xs text-muted-foreground font-medium p-4">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ad) => (
                  <tr key={ad.id} className={`border-b border-border/20 hover:bg-secondary/20 transition-colors ${ad.selected ? "bg-purple-600/5" : ""}`}>
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={ad.selected}
                        onChange={() => toggleSelect(ad.id)}
                        className="w-4 h-4 rounded border-border bg-secondary"
                      />
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium truncate max-w-[160px] lg:max-w-[220px]">{ad.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 lg:hidden">{ad.campaign}</div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell truncate max-w-[160px]">{ad.campaign}</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                        ad.status === "active" ? "bg-green-500/10 text-green-400" :
                        ad.status === "paused" ? "bg-amber-500/10 text-amber-400" :
                        ad.status === "rejected" ? "bg-red-500/10 text-red-400" :
                        "bg-blue-500/10 text-blue-400"
                      }`}>{ad.status}</span>
                    </td>
                    <td className="p-4 text-sm hidden md:table-cell">{ad.spend}</td>
                    <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">{ad.impressions}</td>
                    <td className="p-4 text-sm hidden md:table-cell">{ad.ctr}</td>
                    <td className="p-4 text-sm font-medium">{ad.roas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border/30 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Showing {filtered.length} of {ads.length} ads</p>
            <p className="text-xs text-muted-foreground">10x faster than native · 100% data accuracy</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
