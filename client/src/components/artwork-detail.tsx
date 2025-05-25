import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Expand, Heart, Store, Edit, Share, CheckCircle, RefreshCw } from "lucide-react";
import { formatPrice, getStatusColor, getImageUrl } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Artwork } from "@shared/schema";

interface ArtworkDetailProps {
  artwork: Artwork | null;
  onEdit?: (artwork: Artwork) => void;
  onShare?: (artwork: Artwork) => void;
  onCreateListing?: (artwork: Artwork) => void;
}

export function ArtworkDetail({ artwork, onEdit, onShare, onCreateListing }: ArtworkDetailProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      {/* Artwork Images */}
      <div className="relative">
        <img
          src={getImageUrl(artwork.imageUrl)}
          alt={artwork.title}
          className="w-full h-80 object-cover"
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

        {/* Additional Images from Different Angles */}
        {artwork.imageUrls && artwork.imageUrls.length > 0 && (
          <div className="absolute bottom-4 right-4">
            <Badge variant="secondary" className="bg-black/70 text-white">
              +{artwork.imageUrls.length} more photos
            </Badge>
          </div>
        )}
        
        {/* AI Analysis Status */}
        <div className="absolute bottom-4 left-4">
          <Badge className={artwork.aiAnalysisComplete ? "bg-green-600 hover:bg-green-700" : "bg-yellow-600 hover:bg-yellow-700"}>
            {artwork.aiAnalysisComplete ? (
              <>
                <CheckCircle className="mr-2 h-3 w-3" />
                AI Analysis Complete
              </>
            ) : (
              "Analyzing..."
            )}
          </Badge>
        </div>

        {/* Re-analyze Button for Failed Analysis */}
        {analysisFailedOrIncomplete && (
          <div className="absolute bottom-4 right-4">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => reAnalyzeMutation.mutate(artwork.id)}
              disabled={reAnalyzeMutation.isPending}
              className="bg-black/50 hover:bg-black/70 text-white"
            >
              <RefreshCw className={`mr-2 h-3 w-3 ${reAnalyzeMutation.isPending ? 'animate-spin' : ''}`} />
              {reAnalyzeMutation.isPending ? 'Re-analyzing...' : 'Re-analyze'}
            </Button>
          </div>
        )}
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
            <Store className="mr-2 h-4 w-4" />
            Create Marketplace Listing
          </Button>
          <Button variant="outline" onClick={() => onEdit?.(artwork)} className="flex items-center">
            <Edit className="mr-2 h-4 w-4" />
            Edit Details
          </Button>
          <Button variant="outline" onClick={() => onShare?.(artwork)} className="flex items-center">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
