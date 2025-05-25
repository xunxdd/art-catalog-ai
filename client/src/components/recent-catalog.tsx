import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, getStatusColor, getImageUrl } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Artwork } from "@shared/schema";

interface RecentCatalogProps {
  onSelectArtwork?: (artwork: Artwork) => void;
  onViewAll?: () => void;
}

export function RecentCatalog({ onSelectArtwork, onViewAll }: RecentCatalogProps) {
  const { data: userArtworks, isLoading: userLoading } = useQuery<Artwork[]>({
    queryKey: ['/api/user/artworks'],
  });

  const { data: sampleArtworks, isLoading: sampleLoading } = useQuery<Artwork[]>({
    queryKey: ['/api/artworks/recent'],
    enabled: !userArtworks || userArtworks.length === 0,
  });

  const artworks = userArtworks && userArtworks.length > 0 ? userArtworks : sampleArtworks;
  const isLoading = userLoading || sampleLoading;
  const showingSamples = !userArtworks || userArtworks.length === 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">
                {showingSamples ? "Sample Artwork Collection" : "Your Recent Artworks"}
              </h3>
              {showingSamples && (
                <p className="text-sm text-muted-foreground mt-1">
                  Upload your first artwork to start building your personal catalog
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-lg mb-3"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-2 w-3/4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!artworks || artworks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Recent Catalog Items</h3>
          </div>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No artworks in catalog yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Upload your first artwork to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">
              {showingSamples ? "Sample Artwork Collection" : "Your Recent Artworks"}
            </h3>
            {showingSamples && (
              <p className="text-sm text-muted-foreground mt-1">
                Upload your first artwork to start building your personal catalog
              </p>
            )}
          </div>
          <Button variant="ghost" onClick={onViewAll} className="text-primary hover:text-primary/80">
            View All →
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {artworks.map((artwork) => (
            <Link
              key={artwork.id}
              href={`/artwork/${artwork.id}`}
              className="group cursor-pointer block"
            >
              <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-muted relative">
                <img
                  src={getImageUrl(artwork.thumbnailUrl || artwork.imageUrl)}
                  alt={artwork.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                {artwork.artist === 'Vincent van Gogh' && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                    SAMPLE
                  </div>
                )}
                <div className="hidden w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  {artwork.title}
                </div>
              </div>
              <h4 className="font-semibold mb-1 truncate">{artwork.title}</h4>
              <p className="text-sm text-muted-foreground mb-2">
                {artwork.medium} {artwork.dimensions && `• ${artwork.dimensions}`}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-semibold">
                  {artwork.suggestedPrice ? formatPrice(artwork.suggestedPrice) : 'Analyzing...'}
                </span>
                <Badge className={getStatusColor(artwork.aiAnalysisComplete ? 'listed' : 'analyzing')}>
                  {artwork.aiAnalysisComplete ? 'Analyzed' : 'Processing'}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
