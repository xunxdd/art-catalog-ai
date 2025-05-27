import { Button } from "@/components/ui/button";
import { Camera, LogIn, User, LogOut } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function SimpleNav() {
  const { isAuthenticated, user } = useAuth();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Camera className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl">ArtCatalogAI</span>
        </Link>
        
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Link href="/catalog">
              <Button variant="ghost" size="sm">
                My Catalog
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        ) : (
          <Link href="/auth">
            <Button size="sm">
              <LogIn className="mr-2 h-4 w-4" />
              Log In
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}