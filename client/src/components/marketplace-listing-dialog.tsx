import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, ExternalLink, DollarSign, Tag } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, getImageUrl } from "@/lib/utils";
import type { Artwork } from "@shared/schema";

interface MarketplaceListingDialogProps {
  artwork: Artwork | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const marketplaces = [
  { 
    id: "etsy", 
    name: "Etsy", 
    description: "Handmade & vintage marketplace",
    color: "bg-orange-100 text-orange-700",
    fees: "6.5% transaction fee"
  },
  { 
    id: "saatchi", 
    name: "Saatchi Art", 
    description: "Contemporary art platform",
    color: "bg-blue-100 text-blue-700",
    fees: "35% commission"
  },
  { 
    id: "ebay", 
    name: "eBay", 
    description: "Global auction & sales",
    color: "bg-yellow-100 text-yellow-700",
    fees: "13% final value fee"
  }
];

export function MarketplaceListingDialog({ artwork, open, onOpenChange }: MarketplaceListingDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [listingData, setListingData] = useState({
    title: artwork?.title || "",
    description: artwork?.description || "",
    price: artwork?.suggestedPrice || 0,
    category: artwork?.medium || "",
    tags: artwork?.style?.join(", ") || ""
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/marketplace/listings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/artworks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/listings"] });
      toast({
        title: "Listing Created!",
        description: `Your artwork "${artwork?.title}" has been listed on ${marketplaces.find(m => m.id === selectedPlatform)?.name}`,
      });
      onOpenChange(false);
      setSelectedPlatform("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Listing",
        description: error.message || "There was an error creating your marketplace listing.",
        variant: "destructive",
      });
    },
  });

  const handleCreateListing = () => {
    if (!selectedPlatform || !artwork) return;

    const platform = marketplaces.find(m => m.id === selectedPlatform);
    
    createListingMutation.mutate({
      artworkId: artwork.id,
      platform: platform?.name,
      title: listingData.title,
      description: listingData.description,
      price: listingData.price,
      category: listingData.category,
      tags: listingData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      status: "active"
    });
  };

  if (!artwork) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Create Marketplace Listing
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Artwork Preview */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={getImageUrl(artwork.imageUrl)}
                alt={artwork.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">{artwork.title}</h3>
              {artwork.artist && <p className="text-sm text-muted-foreground">by {artwork.artist}</p>}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{artwork.medium}</Badge>
                {artwork.style?.map((style, idx) => (
                  <Badge key={idx} variant="outline">{style}</Badge>
                ))}
              </div>
              {artwork.suggestedPrice && (
                <p className="text-lg font-semibold text-green-600">
                  AI Suggested: {formatPrice(artwork.suggestedPrice)}
                </p>
              )}
            </div>
          </div>

          {/* Listing Form */}
          <div className="space-y-6">
            {/* Platform Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Choose Platform</Label>
              <div className="grid gap-3">
                {marketplaces.map((platform) => (
                  <Card 
                    key={platform.id}
                    className={`cursor-pointer transition-all ${
                      selectedPlatform === platform.id 
                        ? "ring-2 ring-primary border-primary" 
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedPlatform(platform.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${platform.color}`}>
                            <Store className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">{platform.name}</h4>
                            <p className="text-sm text-muted-foreground">{platform.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{platform.fees}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Listing Details */}
            {selectedPlatform && (
              <div className="space-y-4">
                <Label className="text-base font-semibold">Listing Details</Label>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={listingData.title}
                    onChange={(e) => setListingData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter listing title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={listingData.price}
                    onChange={(e) => setListingData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    placeholder="Enter price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={listingData.category}
                    onChange={(e) => setListingData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Art category"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={listingData.tags}
                    onChange={(e) => setListingData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="painting, abstract, modern"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={listingData.description}
                    onChange={(e) => setListingData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your artwork..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateListing}
                disabled={!selectedPlatform || createListingMutation.isPending}
                className="flex items-center gap-2"
              >
                {createListingMutation.isPending ? (
                  "Creating..."
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    Create Listing
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}