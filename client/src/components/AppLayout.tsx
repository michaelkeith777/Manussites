import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Images,
  Heart,
  Home,
  Moon,
  Sun,
  LogOut,
  LogIn,
  Menu,
  X,
  ChevronRight,
  Settings,
  Printer,
  Scissors,
  Palette,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: imageCount } = trpc.images.count.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/create", icon: Sparkles, label: "Create" },
    { href: "/gallery", icon: Images, label: "Gallery", count: imageCount },
    { href: "/print", icon: Printer, label: "Print Cards" },
    { href: "/stickers", icon: Scissors, label: "Create/Print Stickers" },
    { href: "/non-sports", icon: Palette, label: "Non-Sports Creations" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 72 }}
        className="hidden lg:flex flex-col border-r border-border bg-sidebar fixed h-screen z-40"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden glow-purple-sm logo-hover">
              <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663079185454/NRqQyxtYjKwAQctQ.png" alt="CardKing1971 Customs" className="w-full h-full object-cover" />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-lg text-sidebar-foreground"
                >
                  CardKing1971 Customs
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                      />
                    )}
                    <item.icon className="w-5 h-5 shrink-0" />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex-1 font-medium"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {sidebarOpen && item.count !== undefined && item.count > 0 && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className={cn(
              "w-full justify-start gap-3",
              !sidebarOpen && "justify-center px-0"
            )}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            {sidebarOpen && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </Button>

          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className={cn(
                "w-full justify-start gap-3 text-destructive hover:text-destructive",
                !sidebarOpen && "justify-center px-0"
              )}
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span>Sign Out</span>}
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              asChild
              className={cn("w-full justify-start gap-3", !sidebarOpen && "justify-center px-0")}
            >
              <a href={getLoginUrl()}>
                <LogIn className="w-5 h-5" />
                {sidebarOpen && <span>Sign In</span>}
              </a>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full"
          >
            <ChevronRight
              className={cn(
                "w-5 h-5 transition-transform",
                sidebarOpen && "rotate-180"
              )}
            />
          </Button>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-b border-border z-50 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg overflow-hidden logo-hover">
            <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663079185454/NRqQyxtYjKwAQctQ.png" alt="CardKing1971 Customs" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-sidebar-foreground">CardKing1971 Customs</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed top-16 left-0 right-0 bg-background border-b border-border z-40 p-4"
          >
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground/70"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {item.count !== undefined && item.count > 0 && (
                        <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          {item.count}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
            <Separator className="my-3" />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 mr-2" />
                ) : (
                  <Moon className="w-4 h-4 mr-2" />
                )}
                {theme === "dark" ? "Light" : "Dark"}
              </Button>
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Button variant="default" size="sm" asChild>
                  <a href={getLoginUrl()}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </a>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 min-h-screen transition-all duration-300",
          "lg:ml-[280px]",
          !sidebarOpen && "lg:ml-[72px]",
          "pt-16 lg:pt-0"
        )}
      >
        {children}
      </main>
    </div>
  );
}
