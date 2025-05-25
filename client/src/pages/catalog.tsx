import { useState, useEffect } from "react";
import { NavigationHeader } from "@/components/navigation-header";
import { ArtworkUpload } from "@/components/artwork-upload";
import { QuickActions } from "@/components/quick-actions";
import { ArtworkDetail } from "@/components/artwork-detail";
import { RecentCatalog } from "@/components/recent-catalog";
import { MarketplaceListingDialog } from "@/components/marketplace-listing-dialog";
import { ArtworkEditDialog } from "@/components/artwork-edit-dialog";
import { ArtworkShareDialog } from "@/components/artwork-share-dialog";
import { AIAssistantChat } from "@/components/ai-assistant-chat";
import { SimpleUploadTest } from "@/components/simple-upload-test";
import { Button } from "@/components/ui/button";
import { Bot, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Artwork } from "@shared/schema";

export default function Catalog() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [showMarketplaceListing, setShowMarketplaceListing] = useState(false);
  const [artworkToList, setArtworkToList] = useState<Artwork | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [artworkToEdit, setArtworkToEdit] = useState<Artwork | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [artworkToShare, setArtworkToShare] = useState<Artwork | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showUploadTest, setShowUploadTest] = useState(false);
  const { data: artworks } = useQuery<Artwork[]>({
    queryKey: ['/api/artworks/recent'],
  });

  // Auto-select artwork when data loads or changes
  useEffect(() => {
    if (artworks && artworks.length > 0) {
      // Clear selection if the selected artwork no longer exists
      if (selectedArtwork) {
        const stillExists = artworks.find(art => art.id === selectedArtwork.id);
        if (!stillExists) {
          setSelectedArtwork(null);
        }
      }
      
      // Auto-select newest artwork if none selected
      if (!selectedArtwork) {
        // Prioritize user uploads over sample artwork, and get the newest
        const userArtworks = artworks.filter(art => art.artist !== 'Vincent van Gogh');
        const newestArtwork = userArtworks.length > 0 ? userArtworks[0] : artworks[0];
        setSelectedArtwork(newestArtwork);
      }
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
    setLocation('/gallery');
  };

  const handleOpenAssistant = () => {
    setShowAIAssistant(true);
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
              onDelete={() => setSelectedArtwork(null)}
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

        {/* Floating Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full h-14 w-14 shadow-lg"
            onClick={() => setShowUploadTest(true)}
          >
            <TestTube className="h-6 w-6" />
          </Button>
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

        {/* AI Assistant Chat */}
        <AIAssistantChat
          open={showAIAssistant}
          onOpenChange={setShowAIAssistant}
        />

        {/* Upload Test Dialog */}
        {showUploadTest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Upload Test</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadTest(false)}
                >
                  ✕
                </Button>
              </div>
              <SimpleUploadTest />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}