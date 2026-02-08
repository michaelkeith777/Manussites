import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Onboarding } from "./components/Onboarding";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Gallery from "./pages/Gallery";
import Settings from "./pages/Settings";
import PrintLayout from "./pages/PrintLayout";
import StickerCreator from "./pages/StickerCreator";
import NonSportsCreate from "./pages/NonSportsCreate";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import { useState, useEffect, useCallback } from "react";
import { SplashScreen } from "./components/SplashScreen";
import { VaultLock } from "./components/VaultLock";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={Create} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/print" component={PrintLayout} />
      <Route path="/stickers" component={StickerCreator} />
      <Route path="/non-sports" component={NonSportsCreate} />
      <Route path="/settings" component={Settings} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [vaultUnlocked, setVaultUnlocked] = useState(() => {
    return sessionStorage.getItem("vault_unlocked") === "true";
  });
  
  const { data: onboardingStatus, isLoading: onboardingLoading } = trpc.settings.getOnboardingStatus.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (isAuthenticated && onboardingStatus && !onboardingStatus.isComplete) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated, onboardingStatus]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleVaultUnlock = useCallback(() => {
    sessionStorage.setItem("vault_unlocked", "true");
    setVaultUnlocked(true);
  }, []);

  // Show vault lock first — blocks everything until unlocked
  if (!vaultUnlocked) {
    return <VaultLock onUnlock={handleVaultUnlock} />;
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} minDuration={1800} />}
      <Router />
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
