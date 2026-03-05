import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AdLauncher from "./pages/AdLauncher";
import Analytics from "./pages/Analytics";
import Campaigns from "./pages/Campaigns";
import RulesEngine from "./pages/RulesEngine";
import TeamManagement from "./pages/TeamManagement";
import AdsManager from "./pages/AdsManager";
import Settings from "./pages/Settings";
import CreativeStudio from "./pages/CreativeStudio";
import Gallery from "./pages/Gallery";
import AdminPanel from "./pages/AdminPanel";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/creative-studio" component={CreativeStudio} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/launch" component={AdLauncher} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/rules" component={RulesEngine} />
      <Route path="/team" component={TeamManagement} />
      <Route path="/ads-manager" component={AdsManager} />
      <Route path="/settings" component={Settings} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
