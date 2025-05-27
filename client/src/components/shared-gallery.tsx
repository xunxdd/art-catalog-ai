import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, Grid, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatPrice, getStatusColor, getImageUrl } from "@/lib/utils";
import { Link } from "wouter";
import type { Artwork } from "@shared/schema";

interface SharedGalleryProps {
  title: string;
  description: string;
  queryKey: string;
  showBackButton?: boolean;
  onSelectArtwork?: (artwork: Artwork) => void;
}

export function SharedGallery({ 
  title, 
  description, 
  queryKey, 
  showBackButton = false,
  onSelectArtwork
}: SharedGalleryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const { data: artworks, isLoading } = useQuery<Artwork[]>({
    queryKey: [queryKey],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const filteredArtworks = artworks?.filter(artwork =>
    artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artwork.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artwork.medium?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading artworks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {showBackButton && (
          <Link href="/">
            <Button variant="outline">
              Back to Home
            </Button>
          </Link>
        )}
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search artworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredArtworks.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <p className="text-xl font-semibold text-muted-foreground mb-2">No artworks found</p>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search criteria" : "Upload your first artwork to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          {filteredArtworks.map((artwork) => (
            <Link 
              key={artwork.id} 
              href={`/artwork/${artwork.id}`}
              onClick={(e) => {
                if (onSelectArtwork) {
                  e.preventDefault();
                  onSelectArtwork(artwork);
                }
              }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={getImageUrl(artwork.imageUrl)}
                    alt={artwork.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{artwork.title}</h3>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(artwork.visibility || 'public')}
                    >
                      {artwork.visibility || 'public'}
                    </Badge>
                  </div>
                  {artwork.artist && (
                    <p className="text-sm text-muted-foreground mb-1">by {artwork.artist}</p>
                  )}
                  {artwork.medium && (
                    <p className="text-sm text-muted-foreground mb-2">{artwork.medium}</p>
                  )}
                  {artwork.suggestedPrice && (
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(artwork.suggestedPrice)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}