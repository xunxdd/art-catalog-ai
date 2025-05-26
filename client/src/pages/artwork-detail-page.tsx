import { useEffect, useState, useRef } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/navigation-header";
import { ArtworkSlideshow } from "@/components/artwork-slideshow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Edit, Share, ShoppingCart, Trash2, Camera } from "lucide-react";
import { formatPrice, getStatusColor } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Artwork } from "@shared/schema";

export default function ArtworkDetailPage() {
  const [match, params] = useRoute("/artwork/:id");
  const artworkId = params?.id ? parseInt(params.id) : null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: artwork, isLoading } = useQuery<Artwork>({
    queryKey: [`/api/artworks/${artworkId}`],
    enabled: !!artworkId,
  });

  const addPhotoMutation = useMutation({
    mutationFn: async ({ artworkId, file }: { artworkId: number; file: File }) => {
      // Convert file to compressed base64 for upload
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          img.onload = () => {
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
            ctx?.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5);
            resolve(compressedDataUrl.split(',')[1]);
          };
          
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });
      };

      const base64 = await fileToBase64(file);
      const response = await apiRequest('POST', `/api/artworks/${artworkId}/add-photo`, {
        imageData: base64,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Photo added",
        description: "Additional photo has been added to this artwork.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/artworks/${artworkId}`] });
    },
    onError: (error: any) => {
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

    addPhotoMutation.mutate({ artworkId: artwork.id, file });
    event.target.value = '';
  };

  if (!match || !artworkId) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Artwork not found</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="aspect-square bg-muted rounded-lg mb-6"></div>
            <div className="h-8 bg-muted rounded mb-4"></div>
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Artwork not found</p>
        </div>
      </div>
    );
  }

  const allImages = [artwork.imageUrl, ...(artwork.imageUrls || [])];
  const tags = artwork.tags || [];

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Catalog
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Slideshow */}
          <div>
            <ArtworkSlideshow 
              images={allImages}
              title={artwork.title}
              className="aspect-square"
            />
            
            {/* Image Count */}
            <div className="mt-4 text-center">
              <Badge variant="secondary">
                {allImages.length} photo{allImages.length > 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {/* Artwork Information */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{artwork.title}</h1>
              {artwork.artist && (
                <p className="text-lg text-muted-foreground mb-4">by {artwork.artist}</p>
              )}
              <div className="text-2xl font-bold text-green-600">
                {artwork.suggestedPrice ? formatPrice(artwork.suggestedPrice) : 'Analyzing...'}
              </div>
              <div className="text-sm text-muted-foreground">AI Suggested Price</div>
            </div>

            {/* Specifications */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Specifications</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Medium</div>
                    <div className="font-medium">{artwork.medium || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Dimensions</div>
                    <div className="font-medium">{artwork.dimensions || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Year</div>
                    <div className="font-medium">{artwork.year || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Condition</div>
                    <div className="font-medium">{artwork.condition || 'Unknown'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {artwork.description && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">AI-Generated Description</h3>
                  <p className="text-sm leading-relaxed">{artwork.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Style & Themes</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 10).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button className="flex items-center">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Create Listing
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={handleAddPhoto}
                disabled={addPhotoMutation.isPending}
              >
                <Camera className="mr-2 h-4 w-4" />
                {addPhotoMutation.isPending ? 'Adding...' : 'Add More Photos'}
              </Button>
              <Button variant="outline" className="flex items-center">
                <Edit className="mr-2 h-4 w-4" />
                Edit Details
              </Button>
              <Button variant="outline" className="flex items-center">
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
            
            {/* Hidden file input for photo upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}