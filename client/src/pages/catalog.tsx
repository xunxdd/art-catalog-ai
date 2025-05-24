import { useState, useEffect } from "react";
import { NavigationHeader } from "@/components/navigation-header";
import { ArtworkUpload } from "@/components/artwork-upload";
import { QuickActions } from "@/components/quick-actions";
import { ArtworkDetail } from "@/components/artwork-detail";
import { RecentCatalog } from "@/components/recent-catalog";
import { MarketplaceListingDialog } from "@/components/marketplace-listing-dialog";
import { ArtworkEditDialog } from "@/components/artwork-edit-dialog";
import { ArtworkShareDialog } from "@/components/artwork-share-dialog";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { Artwork } from "@shared/schema";

export default function Catalog() {
  const { toast } = useToast();
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [showMarketplaceListing, setShowMarketplaceListing] = useState(false);
  const [artworkToList, setArtworkToList] = useState<Artwork | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [artworkToEdit, setArtworkToEdit] = useState<Artwork | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [artworkToShare, setArtworkToShare] = useState<Artwork | null>(null);
  const { data: artworks } = useQuery<Artwork[]>({
    queryKey: ['/api/artworks/recent'],
  });

  // Auto-select first artwork when data loads
  useEffect(() => {
    if (artworks && artworks.length > 0 && !selectedArtwork) {
      // Prioritize user uploads over sample artwork
      const userArtwork = artworks.find(art => art.artist !== 'Vincent van Gogh');
      const firstArtwork = userArtwork || artworks[0];
      setSelectedArtwork(firstArtwork);
    }
  }, [artworks, selectedArtwork]);

  const handleSelectArtwork = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
  };

  const handleEditArtwork = (artwork: Artwork) => {
    setArtworkToEdit(artwork);
    setShowEditDialog(true);
  };

  const handleShareArtwork = (artwork: Artwork) => {
    setArtworkToShare(artwork);
    setShowShareDialog(true);
  };

  const handleCreateListing = (artwork: Artwork) => {
    setArtworkToList(artwork);
    setShowMarketplaceListing(true);
  };

  const handleViewAllCatalog = () => {
    toast({
      title: "View All",
      description: "Expanding to show full catalog view.",
    });
  };

  const handleOpenAssistant = () => {
    toast({
      title: "AI Assistant",
      description: "AI cataloging assistant will be available here.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Section - Upload, Actions & Selected Artwork */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Upload & Actions */}
          <div className="space-y-6">
            <ArtworkUpload />
            <QuickActions />
          </div>

          {/* Right Column - Selected Artwork Detail */}
          <div>
            <ArtworkDetail
              artwork={selectedArtwork}
              onEdit={handleEditArtwork}
              onShare={handleShareArtwork}
              onCreateListing={handleCreateListing}
            />
          </div>
        </div>

        {/* Bottom Section - Recent Catalog (Full Width) */}
        <div className="w-full">
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

        {/* Marketplace Listing Dialog */}
        <MarketplaceListingDialog
          artwork={artworkToList}
          open={showMarketplaceListing}
          onOpenChange={(open) => {
            setShowMarketplaceListing(open);
            if (!open) setArtworkToList(null);
          }}
        />

        {/* Artwork Edit Dialog */}
        <ArtworkEditDialog
          artwork={artworkToEdit}
          open={showEditDialog}
          onOpenChange={(open) => {
            setShowEditDialog(open);
            if (!open) setArtworkToEdit(null);
          }}
        />

        {/* Artwork Share Dialog */}
        <ArtworkShareDialog
          artwork={artworkToShare}
          open={showShareDialog}
          onOpenChange={(open) => {
            setShowShareDialog(open);
            if (!open) setArtworkToShare(null);
          }}
        />
      </div>
    </div>
  );
}