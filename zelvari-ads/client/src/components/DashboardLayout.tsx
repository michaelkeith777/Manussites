/*
 * Design: Liquid Amethyst — Sidebar navigation with purple accent highlights,
 * glassmorphic panels, and warm gold active states.
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  LayoutDashboard,
  Rocket,
  BarChart3,
  Megaphone,
  Zap,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  TableProperties,
  Sparkles,
  Image as ImageIcon,
  CreditCard,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/creative-studio", label: "AI Studio", icon: Sparkles },
  { path: "/gallery", label: "Gallery", icon: ImageIcon },
  { path: "/launch", label: "Ad Launcher", icon: Rocket },
  { path: "/campaigns", label: "Campaigns", icon: Megaphone },
  { path: "/ads-manager", label: "Ads Manager", icon: TableProperties },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/rules", label: "Auto Rules", icon: Zap },
  { path: "/team", label: "Team", icon: Users },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, loading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const displayName = user?.name || user?.email || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 transition-all duration-300 flex flex-col
          ${collapsed ? "w-[72px]" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          bg-sidebar border-r border-sidebar-border`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
              Z
            </div>
            {!collapsed && (
              <span className="font-heading font-bold text-lg text-sidebar-foreground">
                Zelvari Ads
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto hidden lg:flex items-center justify-center w-6 h-6 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/60"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto lg:hidden text-sidebar-foreground/60"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                  ${isActive
                    ? "bg-sidebar-primary/15 text-sidebar-primary"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
              >
                <item.icon size={20} className={isActive ? "text-sidebar-primary" : ""} />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
                )}
              </Link>
            );
          })}

          {/* Admin link */}
          {user?.role === "admin" && (
            <>
              <div className={`px-3 pt-4 pb-1 ${collapsed ? "hidden" : ""}`}>
                <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/30 font-semibold">Admin</p>
              </div>
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  ${location === "/admin"
                    ? "bg-sidebar-primary/15 text-sidebar-primary"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
              >
                <Shield size={20} />
                {!collapsed && <span className="text-sm font-medium">Admin Panel</span>}
              </Link>
            </>
          )}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-sidebar-border">
          {isAuthenticated && user ? (
            <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</p>
                  <p className="text-xs text-sidebar-foreground/50 truncate capitalize">{user.plan || "free"} plan</p>
                </div>
              )}
              {!collapsed && (
                <button
                  onClick={handleLogout}
                  className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          ) : (
            <a href={getLoginUrl()}>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm">
                {collapsed ? "→" : "Sign In"}
              </Button>
            </a>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center px-4 lg:px-6 gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-foreground/60 hover:text-foreground"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search campaigns, ads..."
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-secondary border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative text-foreground/60">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" />
            </Button>
            {isAuthenticated && user && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold lg:hidden">
                {initials}
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
