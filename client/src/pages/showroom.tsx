import { SharedGallery } from "@/components/shared-gallery";
import { SimpleNav } from "@/components/simple-nav";
import { NavigationHeader } from "@/components/navigation-header";
import { useAuth } from "@/hooks/useAuth";

export default function Showroom() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Show appropriate navigation for user state */}
      {isAuthenticated ? <NavigationHeader /> : <SimpleNav />}

      <SharedGallery
        title="Showroom"
        description="Discover beautiful artworks from our community"
        queryKey="/api/showroom/artworks"
        showBackButton={false}
      />
    </div>
  );
}