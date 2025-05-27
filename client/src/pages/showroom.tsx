import { SharedGallery } from "@/components/shared-gallery";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Showroom() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header like Landing Page */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Camera className="text-primary h-8 w-8" />
              <span className="text-xl font-bold">ArtCatalogAI</span>
            </Link>
            
            {!isAuthenticated && (
              <div className="flex items-center space-x-2">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    Back to Home
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm">
                    <span className="hidden sm:inline">Sign Up Free</span>
                    <span className="sm:hidden">Sign Up</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
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