import { useState } from "react";
import { NavigationHeader } from "@/components/navigation-header";
import { ArtworkUpload } from "@/components/artwork-upload";
import { QuickActions } from "@/components/quick-actions";
import { ArtworkDetail } from "@/components/artwork-detail";
import { RecentCatalog } from "@/components/recent-catalog";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Artwork } from "@shared/schema";

export default function Catalog() {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const { toast } = useToast();

  const handleSelectArtwork = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
  };

  const handleEditArtwork = (artwork: Artwork) => {
    toast({
      title: "Edit Artwork",
      description: "Opening artwork editor...",
    });
  };

  const handleShareArtwork = (artwork: Artwork) => {
    toast({
      title: "Share Artwork",
      description: "Sharing options will be displayed here.",
    });
  };

  const handleCreateListing = (artwork: Artwork) => {
    toast({
      title: "Create Listing",
      description: "Creating marketplace listing for " + artwork.title,
    });
  };

  const handleViewAllCatalog = () => {
    toast({
      title: "View All",
      description: "Full catalog view coming soon...",
    });
  };

  const handleOpenAssistant = () => {
    toast({
      title: "AI Assistant",
      description: "AI chat assistant coming soon...",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Upload and Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <ArtworkUpload />
            <QuickActions />
          </div>
          
          {/* Center Column: Artwork Detail View */}
          <ArtworkDetail
            artwork={selectedArtwork}
            onEdit={handleEditArtwork}
            onShare={handleShareArtwork}
            onCreateListing={handleCreateListing}
          />
        </div>

        {/* Recent Catalog Items */}
        <div className="mt-8">
          <RecentCatalog
            onSelectArtwork={handleSelectArtwork}
            onViewAll={handleViewAllCatalog}
          />
        </div>

        {/* Floating AI Assistant */}
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg"
            onClick={handleOpenAssistant}
          >
            <Bot className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
