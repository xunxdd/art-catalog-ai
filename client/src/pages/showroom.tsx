import { SharedGallery } from "@/components/shared-gallery";
import { SimpleNav } from "@/components/simple-nav";
import { useAuth } from "@/hooks/useAuth";

export default function Showroom() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Use shared navigation component */}
      {!isAuthenticated && <SimpleNav />}

      <SharedGallery
        title="Showroom"
        description="Discover beautiful artworks from our community"
        queryKey="/api/showroom/artworks"
        showBackButton={false}
      />
    </div>
  );
}