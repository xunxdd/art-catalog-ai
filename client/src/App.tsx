import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { AuthForms } from "@/components/auth-forms";
import Catalog from "@/pages/catalog";
import Gallery from "@/pages/gallery";
import Analytics from "@/pages/analytics";
import Marketplace from "@/pages/marketplace";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your art collection...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForms />;
  }

  return (
    <Switch>
      <Route path="/" component={Catalog} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/marketplace" component={Marketplace} />
      {isAdmin && <Route path="/admin" component={AdminDashboard} />}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
