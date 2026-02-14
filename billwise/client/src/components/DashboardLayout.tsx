import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  CalendarDays,
  BarChart3,
  MessageSquareText,
  Tag,
  LogOut,
  PanelLeft,
  Sparkles,
  Wallet,
  DollarSign,
  Brain,
  PiggyBank,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, Bell } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Brain, label: "AI Assistant", path: "/assistant", highlight: true },
  { icon: Receipt, label: "Bills", path: "/bills" },
  { icon: DollarSign, label: "Income", path: "/income" },
  { icon: CreditCard, label: "Payments", path: "/payments" },
  { icon: CalendarDays, label: "Calendar", path: "/calendar" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: PiggyBank, label: "Budgets", path: "/budgets" },
  { icon: Tag, label: "Categories", path: "/categories" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
];

function ThemeToggle({ isCollapsed }: { isCollapsed: boolean }) {
  const { theme, toggleTheme, switchable } = useTheme();
  if (!switchable || !toggleTheme) return null;
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent/50 transition-all w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center shrink-0 transition-all">
        {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-primary" />}
      </div>
      {!isCollapsed && (
        <span className="text-sm text-muted-foreground">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-chart-2/10 blur-[100px]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-8 p-8 max-w-md w-full relative z-10"
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div
              className="flex items-center gap-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center neon-purple">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-3xl font-display font-bold gradient-text">
                ZelvariWise
              </span>
            </motion.div>
            <p className="text-sm text-muted-foreground text-center max-w-sm leading-relaxed">
              Your AI-powered financial vault. Smart billing, intelligent budgets, and a personal finance assistant.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-chart-2 hover:opacity-90 transition-all shadow-lg neon-purple text-white border-0"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Enter the Vault
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find((item) => item.path === location);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft =
        sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="font-display font-bold tracking-tight truncate text-base gradient-text">
                    ZelvariWise
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {menuItems.map((item) => {
                const isActive = location === item.path;
                const isHighlight = (item as any).highlight;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal ${
                        isHighlight && !isActive
                          ? "text-primary hover:text-primary"
                          : ""
                      } ${isActive ? "bg-primary/10" : ""}`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${
                          isActive
                            ? "text-primary"
                            : isHighlight
                            ? "text-primary"
                            : ""
                        }`}
                      />
                      <span className={isHighlight && !isActive ? "font-medium" : ""}>
                        {item.label}
                      </span>
                      {isHighlight && !isCollapsed && (
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                          AI
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <ThemeToggle isCollapsed={isCollapsed} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border border-primary/20 shrink-0">
                    <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-primary/20 to-chart-2/20 text-primary">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground font-medium">
                    {activeMenuItem?.label ?? "Menu"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </>
  );
}
