import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Bills from "./pages/Bills";
import Payments from "./pages/Payments";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Categories from "./pages/Categories";
import Assistant from "./pages/Assistant";
import Income from "./pages/Income";
import Budgets from "./pages/Budgets";
import Vault from "./pages/Vault";
import { useAuth } from "./_core/hooks/useAuth";
import { useState, useEffect } from "react";

function AppRoutes() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/bills" component={Bills} />
        <Route path="/payments" component={Payments} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/categories" component={Categories} />
        <Route path="/assistant" component={Assistant} />
        <Route path="/income" component={Income} />
        <Route path="/budgets" component={Budgets} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function VaultGate() {
  const { user, loading } = useAuth();
  const [vaultUnlocked, setVaultUnlocked] = useState(false);

  useEffect(() => {
    // Check session storage for vault state
    const unlocked = sessionStorage.getItem("zelvariwise-vault-unlocked");
    if (unlocked === "true") {
      setVaultUnlocked(true);
    }
  }, []);

  const handleUnlock = () => {
    sessionStorage.setItem("zelvariwise-vault-unlocked", "true");
    setVaultUnlocked(true);
  };

  if (loading) return null;
  if (!user) return <AppRoutes />;

  if (!vaultUnlocked) {
    return <Vault onUnlock={handleUnlock} />;
  }

  return <AppRoutes />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "oklch(0.17 0.025 280)",
                border: "1px solid oklch(0.25 0.03 280)",
                color: "oklch(0.93 0.01 280)",
              },
            }}
          />
          <VaultGate />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
