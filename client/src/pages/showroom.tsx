import { NavigationHeader } from "@/components/navigation-header";
import { SharedGallery } from "@/components/shared-gallery";

export default function Showroom() {
  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <SharedGallery
        title="Showroom"
        description="Discover beautiful artworks from our community"
        queryKey="/api/showroom/artworks"
        showBackButton={true}
      />
    </div>
  );
}