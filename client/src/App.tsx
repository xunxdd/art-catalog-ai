import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Catalog from "@/pages/catalog";
import Gallery from "@/pages/gallery";
import Analytics from "@/pages/analytics";
import Marketplace from "@/pages/marketplace";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Catalog} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/marketplace" component={Marketplace} />
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
