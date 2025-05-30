import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Expand, Heart, Store, Edit, Share, CheckCircle, RefreshCw, ShoppingCart, Trash2, Camera, Plus } from "lucide-react";
import { formatPrice, getStatusColor, getImageUrl } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArtworkSlideshow } from "@/components/artwork-slideshow";
import { ArtworkVisibilityControl } from "@/components/artwork-visibility-control";
import { useRef } from "react";
import type { Artwork } from "@shared/schema";

interface ArtworkDetailProps {
  artwork: Artwork | null;
  onEdit?: (artwork: Artwork) => void;
  onShare?: (artwork: Artwork) => void;
  onCreateListing?: (artwork: Artwork) => void;
  onDelete?: () => void; // Callback to clear selection after delete
}

export function ArtworkDetail({ artwork, onEdit, onShare, onCreateListing, onDelete }: ArtworkDetailProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reAnalyzeMutation = useMutation({
    mutationFn: async (artworkId: number) => {
      const response = await apiRequest('POST', `/api/artworks/${artworkId}/analyze`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Re-analysis started",
        description: "AI is analyzing your artwork again...",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/artworks'] });
    },
    onError: (error: any) => {
      toast({
        title: "Re-analysis failed",
        description: error.message || "Failed to restart analysis",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (artworkId: number) => {
      const response = await apiRequest('DELETE', `/api/artworks/${artworkId}`);
      // Handle empty response or check if response has content
      const text = await response.text();
      try {
        return text ? JSON.parse(text) : { success: true };
      } catch {
        return { success: true }; // If JSON parsing fails, assume success since we got 200
      }
    },
    onSuccess: () => {
      toast({
        title: "Artwork deleted",
        description: "The artwork has been removed from your catalog",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/artworks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/artworks/recent'] });
      onDelete?.(); // Clear the selected artwork
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete artwork",
        variant: "destructive",
      });
    },
  });

  const addPhotoMutation = useMutation({
    mutationFn: async ({ artworkId, file }: { artworkId: number; file: File }) => {
      console.log('Starting photo upload mutation for artwork:', artworkId);
      
      // Convert file to compressed base64 for upload (same method as main upload)
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          // Create a canvas to compress the image before upload
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          img.onload = () => {
            // Calculate dimensions to fit within 512x512
            const maxSize = 512;
            let { width, height } = img;
            
            if (width > height) {
              if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            ctx?.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5); // 50% quality
            resolve(compressedDataUrl.split(',')[1]); // Remove prefix
          };
          
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });
      };

      console.log('Converting file to base64...');
      const base64 = await fileToBase64(file);
      console.log('Base64 conversion complete, making API request...');
      
      const response = await apiRequest('POST', `/api/artworks/${artworkId}/add-photo`, {
        imageData: base64,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });
      
      console.log('API request complete:', response.status);
      
      // Handle response properly
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Photo upload result:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Photo upload successful:', data);
      toast({
        title: "Photo added",
        description: "Additional photo has been added to this artwork.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/artworks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/artworks/recent'] });
      queryClient.invalidateQueries({ queryKey: [`/api/artworks/${artwork?.id}`] });
    },
    onError: (error: any) => {
      console.error('Photo upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to add photo",
        variant: "destructive",
      });
    },
  });

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !artwork) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, HEIC)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting photo upload for artwork:', artwork.id, 'file:', file.name);
    addPhotoMutation.mutate({ artworkId: artwork.id, file });
    
    // Clear the input so the same file can be selected again
    event.target.value = '';
  };

  if (!artwork) {
    return (
      <Card className="lg:col-span-2">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Select an artwork to view details</p>
        </CardContent>
      </Card>
    );
  }

  const tags = artwork.tags || [];
  const styleThemeTags = tags.slice(0, 5); // Show first 5 tags
  const analysisFailedOrIncomplete = !artwork.aiAnalysisComplete || artwork.title.includes("Failed");

  return (
    <Card className="lg:col-span-2 overflow-hidden">
      {/* Artwork Images with Slideshow */}
      <div className="relative mb-4">
        <ArtworkSlideshow 
          images={[artwork.imageUrl, ...(artwork.imageUrls || [])]}
          title={artwork.title}
          className="h-80"
          showThumbnails={false}
        />
        
        <div className="absolute top-4 right-4 flex space-x-2">
          {artwork.artist === 'Vincent van Gogh' && (
            <div className="bg-black/70 text-white px-3 py-1 rounded-md text-sm font-medium backdrop-blur-sm mr-2">
              SAMPLE
            </div>
          )}
          <Button size="icon" variant="secondary" className="bg-black/50 hover:bg-black/70 text-white">
            <Expand className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" className="bg-black/50 hover:bg-black/70 text-white">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Show either Analysis Status or Re-analyze Button, not both */}
        <div className="absolute bottom-4 left-4">
          {artwork.aiAnalysisComplete ? (
            <Badge className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="mr-2 h-3 w-3" />
              AI Analysis Complete
            </Badge>
          ) : reAnalyzeMutation.isPending ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={true}
              className="bg-black/50 text-white"
            >
              <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
              Re-analyzing...
            </Button>
          ) : analysisFailedOrIncomplete ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => reAnalyzeMutation.mutate(artwork.id)}
              className="bg-black/50 hover:bg-black/70 text-white"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Re-analyze
            </Button>
          ) : (
            <Badge className="bg-yellow-600 hover:bg-yellow-700">
              Analyzing...
            </Badge>
          )}
        </div>
      </div>
      
      {/* Artwork Details */}
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{artwork.title}</h2>
            {artwork.artist && (
              <p className="text-muted-foreground">by {artwork.artist}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {artwork.suggestedPrice ? formatPrice(artwork.suggestedPrice) : 'Analyzing...'}
            </div>
            <div className="text-sm text-muted-foreground">AI Suggested Price</div>
          </div>
        </div>

        {/* Visibility Control */}
        <ArtworkVisibilityControl artwork={artwork} className="mb-6" />
        
        {/* Artwork Specifications */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-muted p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Medium</div>
            <div className="font-semibold">{artwork.medium || 'Unknown'}</div>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Dimensions</div>
            <div className="font-semibold">{artwork.dimensions || 'Unknown'}</div>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Year</div>
            <div className="font-semibold">{artwork.year || 'Unknown'}</div>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Condition</div>
            <div className={`font-semibold ${getStatusColor(artwork.condition || 'unknown')}`}>
              {artwork.condition || 'Unknown'}
            </div>
          </div>
        </div>


        
        {/* AI-Generated Tags */}
        {styleThemeTags.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
              AI-DETECTED STYLE & THEMES
            </h4>
            <div className="flex flex-wrap gap-2">
              {styleThemeTags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* AI-Generated Description */}
        {artwork.description && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
              AI-GENERATED DESCRIPTION
            </h4>
            <p className="text-foreground leading-relaxed">
              {artwork.description}
            </p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => onCreateListing?.(artwork)} className="flex items-center">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Create Marketplace Listing
          </Button>
          <Button variant="outline" onClick={() => onEdit?.(artwork)} className="flex items-center">
            <Edit className="mr-2 h-4 w-4" />
            Edit Details
          </Button>
          <Button 
            variant="outline" 
            onClick={handleAddPhoto} 
            disabled={addPhotoMutation.isPending}
            className="flex items-center"
          >
            <Camera className="mr-2 h-4 w-4" />
            {addPhotoMutation.isPending ? 'Adding...' : 'Add More Photos'}
          </Button>
          <Button variant="outline" onClick={() => onShare?.(artwork)} className="flex items-center">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => deleteMutation.mutate(artwork.id)} 
            disabled={deleteMutation.isPending}
            className="flex items-center"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Artwork'}
          </Button>
        </div>

        {/* Hidden file input for adding photos */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
