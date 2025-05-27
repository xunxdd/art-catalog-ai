import { SharedGallery } from "@/components/shared-gallery";
import { Button } from "@/components/ui/button";
import { Camera, LogIn, UserPlus } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Showroom() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header - Exactly like Landing Page */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Camera className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">ArtCatalogAI</span>
          </Link>
          
          {!isAuthenticated && (
            <div className="flex items-center space-x-2">
              <Link href="/auth">
                <Button variant="ghost" size="sm">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <SharedGallery
        title="Showroom"
        description="Discover beautiful artworks from our community"
        queryKey="/api/showroom/artworks"
        showBackButton={false}
      />
    </div>
  );
}