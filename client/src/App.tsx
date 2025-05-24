import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center max-w-lg mx-auto p-8">
          <h1 className="text-4xl font-bold mb-4">Art Catalog AI</h1>
          <p className="text-muted-foreground mb-8">
            AI-powered artwork documentation and sales platform for artists and collectors
          </p>
          
          <div className="space-y-4">
            <a
              href="/api/login"
              className="w-full inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign In with Replit
            </a>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">New to Art Catalog?</span>
              </div>
            </div>
            
            <a
              href="/api/login"
              className="w-full inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Create Account with Replit
            </a>
          </div>
          
          <div className="mt-8 text-sm text-muted-foreground">
            <p className="mb-2">✨ AI-powered artwork analysis</p>
            <p className="mb-2">📸 Smart cataloging and pricing</p>
            <p className="mb-2">🎨 Professional gallery management</p>
            <p>🔒 Secure cloud storage for your collection</p>
          </div>
          
          <p className="mt-6 text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    );
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
