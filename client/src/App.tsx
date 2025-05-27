import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { AuthForms } from "@/components/auth-forms";
import LandingPage from "@/pages/landing-page";
import Catalog from "@/pages/catalog";
import Gallery from "@/pages/gallery";
import Showroom from "@/pages/showroom";
import Analytics from "@/pages/analytics";
import Marketplace from "@/pages/marketplace";
import AdminDashboard from "@/pages/admin-dashboard";
import AccountSettings from "@/pages/account-settings";
import ArtworkDetailPage from "@/pages/artwork-detail-page";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth">
        <AuthForms />
      </Route>
      <Route path="/showroom" component={Showroom} />
      {isAuthenticated ? (
        <>
          <Route path="/gallery" component={Gallery} />
          <Route path="/catalog" component={Catalog} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/artwork/:id" component={ArtworkDetailPage} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/settings" component={AccountSettings} />
        </>
      ) : (
        <Route path="/gallery">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl font-semibold mb-4">Please log in to view your gallery</p>
              <a href="/auth" className="text-primary hover:underline">Go to Login</a>
            </div>
          </div>
        </Route>
      )}
      <Route component={LandingPage} />
    </Switch>
  );

  return (
    <Switch>
      <Route path="/" component={Catalog} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/artwork/:id" component={ArtworkDetailPage} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/account" component={AccountSettings} />
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
