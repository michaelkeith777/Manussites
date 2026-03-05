/*
 * Design: Liquid Amethyst — Settings page with tabbed sections,
 * form inputs, and account management.
 */
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  User, Bell, Shield, CreditCard, Globe, Palette, Link2, Key,
  Save, ChevronRight, Check, AlertCircle, ExternalLink, Trash2,
  Moon, Sun, Monitor,
} from "lucide-react";
import { toast } from "sonner";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "integrations", label: "Integrations", icon: Link2 },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
];

const integrations = [
  { name: "Meta Ads", status: "connected", accounts: 3, icon: "M" },
  { name: "TikTok Ads", status: "connected", accounts: 1, icon: "T" },
  { name: "Google Ads", status: "connected", accounts: 2, icon: "G" },
  { name: "Snapchat Ads", status: "not_connected", accounts: 0, icon: "S" },
  { name: "Pinterest Ads", status: "not_connected", accounts: 0, icon: "P" },
  { name: "Google Drive", status: "connected", accounts: 1, icon: "D" },
  { name: "Dropbox", status: "not_connected", accounts: 0, icon: "B" },
  { name: "Slack", status: "connected", accounts: 1, icon: "K" },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading font-bold text-2xl lg:text-3xl">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences.</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar tabs */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                    activeTab === tab.id
                      ? "bg-purple-600/15 text-purple-300"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight size={14} className="ml-auto" />}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="glass-card rounded-xl p-6 space-y-6">
                <h2 className="font-heading font-semibold text-lg">Profile Settings</h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xl font-bold">
                    JD
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Change Avatar</Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 2MB.</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">First Name</label>
                    <input defaultValue="John" className="w-full h-10 px-4 rounded-lg bg-secondary border-0 text-sm text-foreground focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Last Name</label>
                    <input defaultValue="Doe" className="w-full h-10 px-4 rounded-lg bg-secondary border-0 text-sm text-foreground focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
                    <input defaultValue="john@agency.com" className="w-full h-10 px-4 rounded-lg bg-secondary border-0 text-sm text-foreground focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Company</label>
                    <input defaultValue="Growth Agency Inc." className="w-full h-10 px-4 rounded-lg bg-secondary border-0 text-sm text-foreground focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Timezone</label>
                  <select className="w-full h-10 px-4 rounded-lg bg-secondary border-0 text-sm text-foreground appearance-none">
                    <option>America/New_York (EST)</option>
                    <option>America/Los_Angeles (PST)</option>
                    <option>Europe/London (GMT)</option>
                    <option>Asia/Tokyo (JST)</option>
                  </select>
                </div>
                <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-purple-500 text-white">
                  <Save size={14} className="mr-2" /> Save Changes
                </Button>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="glass-card rounded-xl p-6 space-y-6">
                <h2 className="font-heading font-semibold text-lg">Notification Preferences</h2>
                {[
                  { label: "Ad Launch Confirmations", desc: "Get notified when ads are successfully launched", enabled: true },
                  { label: "Rule Triggers", desc: "Alerts when automated rules are triggered", enabled: true },
                  { label: "CPA Alerts", desc: "Notifications when CPA exceeds threshold", enabled: true },
                  { label: "Budget Alerts", desc: "Warnings when campaigns approach budget limits", enabled: true },
                  { label: "Weekly Reports", desc: "Summary of ad performance every Monday", enabled: false },
                  { label: "Team Activity", desc: "Updates when team members launch or edit ads", enabled: false },
                  { label: "Platform Status", desc: "Alerts when ad platforms experience issues", enabled: true },
                ].map((n, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border/20 last:border-0">
                    <div>
                      <div className="text-sm font-medium">{n.label}</div>
                      <div className="text-xs text-muted-foreground">{n.desc}</div>
                    </div>
                    <button className="text-foreground/60">
                      {n.enabled ? (
                        <div className="w-10 h-6 rounded-full bg-purple-600 flex items-center justify-end px-0.5">
                          <div className="w-5 h-5 rounded-full bg-white" />
                        </div>
                      ) : (
                        <div className="w-10 h-6 rounded-full bg-secondary flex items-center px-0.5">
                          <div className="w-5 h-5 rounded-full bg-muted-foreground/30" />
                        </div>
                      )}
                    </button>
                  </div>
                ))}
                <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-purple-500 text-white">
                  <Save size={14} className="mr-2" /> Save Preferences
                </Button>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="space-y-6">
                <div className="glass-card rounded-xl p-6">
                  <h2 className="font-heading font-semibold text-lg mb-4">Current Plan</h2>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-600/20 to-purple-500/10 border border-purple-500/30">
                    <div>
                      <div className="text-lg font-heading font-bold">Agency Plan</div>
                      <div className="text-sm text-muted-foreground">$699/month · Billed annually</div>
                    </div>
                    <Button variant="outline" size="sm">Upgrade</Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 bg-secondary/30 rounded-lg">
                      <div className="text-lg font-heading font-bold">Unlimited</div>
                      <div className="text-xs text-muted-foreground">Ad Accounts</div>
                    </div>
                    <div className="text-center p-3 bg-secondary/30 rounded-lg">
                      <div className="text-lg font-heading font-bold">Unlimited</div>
                      <div className="text-xs text-muted-foreground">Ad Launches</div>
                    </div>
                    <div className="text-center p-3 bg-secondary/30 rounded-lg">
                      <div className="text-lg font-heading font-bold">Unlimited</div>
                      <div className="text-xs text-muted-foreground">Workspaces</div>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-heading font-semibold mb-4">Payment Method</h3>
                  <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg">
                    <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold">VISA</div>
                    <div>
                      <div className="text-sm font-medium">Visa ending in 4242</div>
                      <div className="text-xs text-muted-foreground">Expires 12/2028</div>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto">Update</Button>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-heading font-semibold mb-4">Billing History</h3>
                  <div className="space-y-2">
                    {[
                      { date: "Mar 1, 2026", amount: "$699.00", status: "Paid" },
                      { date: "Feb 1, 2026", amount: "$699.00", status: "Paid" },
                      { date: "Jan 1, 2026", amount: "$699.00", status: "Paid" },
                    ].map((b, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-border/20 last:border-0">
                        <div className="text-sm">{b.date}</div>
                        <div className="text-sm font-medium">{b.amount}</div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400">{b.status}</span>
                        <Button variant="ghost" size="sm" className="text-xs">Download</Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "integrations" && (
              <div className="glass-card rounded-xl p-6">
                <h2 className="font-heading font-semibold text-lg mb-6">Connected Platforms</h2>
                <div className="space-y-3">
                  {integrations.map((int, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-secondary/20 rounded-xl hover:bg-secondary/30 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-sm">
                        {int.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{int.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {int.status === "connected" ? `${int.accounts} account${int.accounts > 1 ? "s" : ""} connected` : "Not connected"}
                        </div>
                      </div>
                      {int.status === "connected" ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-400 flex items-center gap-1"><Check size={12} /> Connected</span>
                          <Button variant="ghost" size="sm" className="text-xs">Manage</Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline">Connect</Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="glass-card rounded-xl p-6 space-y-4">
                  <h2 className="font-heading font-semibold text-lg">Security Settings</h2>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Current Password</label>
                    <input type="password" className="w-full h-10 px-4 rounded-lg bg-secondary border-0 text-sm text-foreground focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">New Password</label>
                      <input type="password" className="w-full h-10 px-4 rounded-lg bg-secondary border-0 text-sm text-foreground focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Confirm Password</label>
                      <input type="password" className="w-full h-10 px-4 rounded-lg bg-secondary border-0 text-sm text-foreground focus:ring-2 focus:ring-primary/50" />
                    </div>
                  </div>
                  <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-purple-500 text-white">
                    <Key size={14} className="mr-2" /> Update Password
                  </Button>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-heading font-semibold mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <div>
                      <div className="text-sm font-medium">2FA is currently disabled</div>
                      <div className="text-xs text-muted-foreground">Add an extra layer of security to your account</div>
                    </div>
                    <Button size="sm" variant="outline">Enable 2FA</Button>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-heading font-semibold mb-4">API Keys</h3>
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg mb-3">
                    <div>
                      <div className="text-sm font-medium font-mono">zv_live_****...****8f2a</div>
                      <div className="text-xs text-muted-foreground">Created Jan 15, 2026</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-xs">Copy</Button>
                      <Button variant="ghost" size="sm" className="text-xs text-red-400">Revoke</Button>
                    </div>
                  </div>
                  <Button variant="outline" size="sm"><Key size={14} className="mr-2" /> Generate New Key</Button>
                </div>

                <div className="glass-card rounded-xl p-6 border border-red-500/20">
                  <h3 className="font-heading font-semibold text-red-400 mb-2">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back.</p>
                  <Button variant="outline" size="sm" className="text-red-400 border-red-500/30 hover:bg-red-500/10">
                    <Trash2 size={14} className="mr-2" /> Delete Account
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="glass-card rounded-xl p-6 space-y-6">
                <h2 className="font-heading font-semibold text-lg">Appearance</h2>
                <div>
                  <label className="text-sm font-medium mb-3 block">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "dark", label: "Dark", icon: Moon },
                      { id: "light", label: "Light", icon: Sun },
                      { id: "system", label: "System", icon: Monitor },
                    ].map((t) => (
                      <button
                        key={t.id}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                          t.id === "dark"
                            ? "bg-purple-600/20 border-2 border-purple-500/50 text-purple-300"
                            : "bg-secondary/50 border-2 border-transparent text-muted-foreground hover:border-border"
                        }`}
                      >
                        <t.icon size={20} />
                        <span className="text-xs font-medium">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-3 block">Accent Color</label>
                  <div className="flex gap-3">
                    {["#8B5CF6", "#F59E0B", "#06B6D4", "#EC4899", "#10B981", "#EF4444"].map((c) => (
                      <button
                        key={c}
                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${c === "#8B5CF6" ? "ring-2 ring-white ring-offset-2 ring-offset-background" : ""}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-3 block">Sidebar Position</label>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-lg bg-purple-600/20 border border-purple-500/50 text-purple-300 text-sm">Left</button>
                    <button className="px-4 py-2 rounded-lg bg-secondary text-muted-foreground text-sm">Right</button>
                  </div>
                </div>
                <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-purple-500 text-white">
                  <Save size={14} className="mr-2" /> Save Appearance
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
