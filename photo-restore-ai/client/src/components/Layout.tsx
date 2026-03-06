/*
 * DESIGN: Temporal Alchemy — Dark Cinematic Restoration Studio
 * Layout: Glass-morphism nav bar with amber accents, film grain overlay
 * Typography: Playfair Display for brand, DM Sans for nav links
 */
import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X, Sparkles } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/restore", label: "Restore" },
    { href: "/gallery", label: "Gallery" },
    { href: "/how-it-works", label: "How It Works" },
  ];

  return (
    <div className="min-h-screen flex flex-col relative film-grain">
      {/* Navigation */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass-card py-3 shadow-lg"
            : "py-5 bg-gradient-to-b from-background/80 to-transparent"
        }`}
      >
        <div className="container flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <motion.div
              className="flex items-center gap-2.5 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <Sparkles className="w-7 h-7 text-amber" />
                <div className="absolute inset-0 blur-lg bg-amber/30 rounded-full" />
              </div>
              <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight">
                <span className="text-gradient-amber">Photo</span>
                <span className="text-foreground">Restore</span>
                <span className="text-amber ml-1 text-sm font-medium">AI</span>
              </span>
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <motion.span
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location === link.href
                      ? "text-amber"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {link.label}
                  {location === link.href && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.span>
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            <Link href="/restore">
              <motion.span
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-amber text-primary-foreground rounded-lg font-medium text-sm hover:bg-amber-light transition-colors amber-glow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-4 h-4" />
                Start Restoring
              </motion.span>
            </Link>

            {/* Mobile menu button */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden glass-card mt-2 mx-4 rounded-xl overflow-hidden"
            >
              <nav className="flex flex-col p-4 gap-1">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <span
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        location === link.href
                          ? "bg-amber/10 text-amber"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      {link.label}
                    </span>
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-auto">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <Sparkles className="w-5 h-5 text-amber" />
                <span className="font-[family-name:var(--font-display)] text-lg font-bold">
                  <span className="text-gradient-amber">Photo</span>
                  <span className="text-foreground">Restore</span>
                  <span className="text-amber ml-1 text-xs font-medium">AI</span>
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                Breathe new life into your cherished memories with the power of artificial intelligence. Repair, colorize, and enhance your photos to stunning 4K quality.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Features</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="hover:text-amber transition-colors cursor-default">Photo Repair</li>
                <li className="hover:text-amber transition-colors cursor-default">Colorization</li>
                <li className="hover:text-amber transition-colors cursor-default">4K Upscaling</li>
                <li className="hover:text-amber transition-colors cursor-default">Batch Processing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Navigation</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <span className="hover:text-amber transition-colors">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} PhotoRestore AI. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Powered by advanced AI restoration technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
