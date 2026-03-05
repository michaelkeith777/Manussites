/*
 * Design: Liquid Amethyst — Team management with member cards,
 * workspace management, and permission controls.
 */
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Plus, Users, Shield, Eye, Edit, Trash2, Mail, MoreHorizontal,
  Building2, UserPlus, Crown, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

const teamMembers = [
  { id: 1, name: "John Doe", email: "john@agency.com", role: "Owner", avatar: "JD", status: "online", adsLaunched: 1204, lastActive: "Now" },
  { id: 2, name: "Sarah Chen", email: "sarah@agency.com", role: "Full Access", avatar: "SC", status: "online", adsLaunched: 892, lastActive: "5 min ago" },
  { id: 3, name: "Mike Johnson", email: "mike@agency.com", role: "Launch Only", avatar: "MJ", status: "offline", adsLaunched: 456, lastActive: "2 hrs ago" },
  { id: 4, name: "Emma Wilson", email: "emma@agency.com", role: "Analytics View", avatar: "EW", status: "online", adsLaunched: 0, lastActive: "30 min ago" },
  { id: 5, name: "James Lee", email: "james@agency.com", role: "Edit Only", avatar: "JL", status: "offline", adsLaunched: 234, lastActive: "1 day ago" },
  { id: 6, name: "Lisa Park", email: "lisa@agency.com", role: "Full Access", avatar: "LP", status: "online", adsLaunched: 678, lastActive: "12 min ago" },
];

const workspaces = [
  { name: "FashionCo Campaigns", members: 4, accounts: 2, adsThisMonth: 450 },
  { name: "TechStart Growth", members: 3, accounts: 1, adsThisMonth: 280 },
  { name: "FoodBrand DTC", members: 2, accounts: 3, adsThisMonth: 620 },
  { name: "Internal Testing", members: 6, accounts: 1, adsThisMonth: 45 },
];

export default function TeamManagement() {
  const [activeTab, setActiveTab] = useState<"members" | "workspaces">("members");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl">Team</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage team members and workspaces.</p>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-600/30 w-fit">
            <UserPlus size={16} className="mr-2" /> Invite Member
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Team Members", value: "6", icon: Users },
            { label: "Workspaces", value: "4", icon: Building2 },
            { label: "Online Now", value: "4", icon: Eye },
            { label: "Permission Levels", value: "5", icon: Shield },
          ].map((s, i) => (
            <div key={i} className="glass-card rounded-xl p-5 text-center">
              <s.icon size={20} className="mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-heading font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab("members")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "members" ? "bg-purple-600 text-white" : "text-muted-foreground"
            }`}
          >
            <Users size={14} className="inline mr-2" /> Members
          </button>
          <button
            onClick={() => setActiveTab("workspaces")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "workspaces" ? "bg-purple-600 text-white" : "text-muted-foreground"
            }`}
          >
            <Building2 size={14} className="inline mr-2" /> Workspaces
          </button>
        </div>

        {activeTab === "members" ? (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/30">
                    <th className="text-left text-xs text-muted-foreground font-medium p-4">Member</th>
                    <th className="text-left text-xs text-muted-foreground font-medium p-4 hidden md:table-cell">Role</th>
                    <th className="text-left text-xs text-muted-foreground font-medium p-4 hidden lg:table-cell">Ads Launched</th>
                    <th className="text-left text-xs text-muted-foreground font-medium p-4">Status</th>
                    <th className="text-left text-xs text-muted-foreground font-medium p-4 hidden md:table-cell">Last Active</th>
                    <th className="text-left text-xs text-muted-foreground font-medium p-4 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((m) => (
                    <tr key={m.id} className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold">
                              {m.avatar}
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                              m.status === "online" ? "bg-green-400" : "bg-gray-500"
                            }`} />
                          </div>
                          <div>
                            <div className="text-sm font-medium flex items-center gap-1.5">
                              {m.name}
                              {m.role === "Owner" && <Crown size={12} className="text-amber-400" />}
                            </div>
                            <div className="text-xs text-muted-foreground">{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className={`text-xs px-2.5 py-1 rounded-full ${
                          m.role === "Owner" ? "bg-amber-500/10 text-amber-400" :
                          m.role === "Full Access" ? "bg-purple-500/10 text-purple-400" :
                          "bg-secondary text-muted-foreground"
                        }`}>{m.role}</span>
                      </td>
                      <td className="p-4 text-sm hidden lg:table-cell">{m.adsLaunched.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`text-xs capitalize ${m.status === "online" ? "text-green-400" : "text-muted-foreground"}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground hidden md:table-cell">{m.lastActive}</td>
                      <td className="p-4">
                        <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {workspaces.map((w, i) => (
              <div key={i} className="glass-card rounded-xl p-6 hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-500/10 flex items-center justify-center">
                    <Building2 size={18} className="text-purple-400" />
                  </div>
                  <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal size={16} /></button>
                </div>
                <h3 className="font-heading font-semibold mb-3">{w.name}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-lg font-heading font-bold">{w.members}</div>
                    <div className="text-xs text-muted-foreground">Members</div>
                  </div>
                  <div>
                    <div className="text-lg font-heading font-bold">{w.accounts}</div>
                    <div className="text-xs text-muted-foreground">Accounts</div>
                  </div>
                  <div>
                    <div className="text-lg font-heading font-bold">{w.adsThisMonth}</div>
                    <div className="text-xs text-muted-foreground">Ads/mo</div>
                  </div>
                </div>
              </div>
            ))}
            <div className="glass-card rounded-xl p-6 border-2 border-dashed border-border/50 flex items-center justify-center hover:border-purple-500/50 transition-colors cursor-pointer">
              <div className="text-center">
                <Plus size={24} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Create Workspace</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
