import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Save, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl } from "@/lib/utils";
import type { Artwork } from "@shared/schema";

interface ArtworkEditDialogProps {
  artwork: Artwork | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mediumOptions = [
  "Oil Painting",
  "Acrylic Painting", 
  "Watercolor",
  "Digital Art",
  "Photography",
  "Sculpture",
  "Mixed Media",
  "Drawing",
  "Printmaking",
  "Other"
];

const conditionOptions = [
  "Excellent",
  "Very Good", 
  "Good",
  "Fair",
  "Poor"
];

export function ArtworkEditDialog({ artwork, open, onOpenChange }: ArtworkEditDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editData, setEditData] = useState({
    title: artwork?.title || "",
    artist: artwork?.artist || "",
    medium: artwork?.medium || "",
    dimensions: artwork?.dimensions || "",
    year: artwork?.year || "",
    condition: artwork?.condition || "",
    description: artwork?.description || "",
    suggestedPrice: artwork?.suggestedPrice || 0,
  });

  // Update form data when artwork changes
  useState(() => {
    if (artwork) {
      setEditData({
        title: artwork.title || "",
        artist: artwork.artist || "",
        medium: artwork.medium || "",
        dimensions: artwork.dimensions || "",
        year: artwork.year || "",
        condition: artwork.condition || "",
        description: artwork.description || "",
        suggestedPrice: artwork.suggestedPrice || 0,
      });
    }
  });

  const updateArtworkMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/artworks/${artwork?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/artworks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/artworks/recent"] });
      toast({
        title: "Artwork Updated!",
        description: `"${editData.title}" has been updated successfully.`,
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating your artwork.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!artwork) return;
    
    updateArtworkMutation.mutate({
      title: editData.title,
      artist: editData.artist,
      medium: editData.medium,
      dimensions: editData.dimensions,
      year: editData.year,
      condition: editData.condition,
      description: editData.description,
      suggestedPrice: editData.suggestedPrice,
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!artwork) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Artwork Details
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
              <h3 className="font-semibold text-sm text-muted-foreground">ORIGINAL AI ANALYSIS</h3>
              {artwork.aiAnalysisComplete && (
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Detected Style:</span> {artwork.medium}</p>
                  <p><span className="font-medium">Estimated Price:</span> ${artwork.suggestedPrice}</p>
                  <p><span className="font-medium">Condition:</span> {artwork.condition}</p>
                </div>
              )}
            </div>
          </div>

          {/* Edit Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={editData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter artwork title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="artist">Artist</Label>
                <Input
                  id="artist"
                  value={editData.artist}
                  onChange={(e) => handleInputChange("artist", e.target.value)}
                  placeholder="Artist name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medium">Medium</Label>
                <Select value={editData.medium} onValueChange={(value) => handleInputChange("medium", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select medium" />
                  </SelectTrigger>
                  <SelectContent>
                    {mediumOptions.map((medium) => (
                      <SelectItem key={medium} value={medium}>
                        {medium}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select value={editData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOptions.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  value={editData.dimensions}
                  onChange={(e) => handleInputChange("dimensions", e.target.value)}
                  placeholder="e.g. 24 x 36 inches"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  value={editData.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  placeholder="Year created"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={editData.suggestedPrice}
                onChange={(e) => handleInputChange("suggestedPrice", Number(e.target.value))}
                placeholder="Suggested price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your artwork..."
                rows={4}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={updateArtworkMutation.isPending || !editData.title}
                className="flex items-center gap-2"
              >
                {updateArtworkMutation.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
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