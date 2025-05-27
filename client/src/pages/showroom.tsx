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
            <div className="flex items-center gap-1">
              <Link href="/auth">
                <Button variant="ghost" className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm">
                  <LogIn className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline ml-1">Log In</span>
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm">
                  <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline ml-1">Sign Up</span>
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