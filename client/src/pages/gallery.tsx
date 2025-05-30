import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, Grid, List, Camera, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatPrice, getStatusColor, getImageUrl } from "@/lib/utils";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { NavigationHeader } from "@/components/navigation-header";
import type { Artwork } from "@shared/schema";

export default function Gallery() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { user } = useAuth();
  
  // Showroom - shows user's public works if logged in, all public works if not
  const { data: artworks, isLoading } = useQuery<Artwork[]>({
    queryKey: ['/api/showroom/artworks'],
    retry: false,
  });

  const filteredArtworks = artworks?.filter(artwork =>
    artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artwork.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artwork.medium?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gallery</h1>
            <p className="text-muted-foreground">
              {user ? "Your personal artwork collection" : "Discover beautiful artworks from our community"}
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search artworks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredArtworks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground text-lg">No artworks found</p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchTerm ? "Try adjusting your search terms" : "Upload your first artwork to get started"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {filteredArtworks.map((artwork) => (
              <Link key={artwork.id} href={`/artwork/${artwork.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                {viewMode === "grid" ? (
                  <>
                    <div className="aspect-square">
                      <img
                        src={getImageUrl(artwork.thumbnailUrl || artwork.imageUrl)}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1 truncate">{artwork.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {artwork.artist && `by ${artwork.artist}`}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        {artwork.medium} {artwork.year && `• ${artwork.year}`}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-green-600 font-semibold">
                          {artwork.suggestedPrice ? formatPrice(artwork.suggestedPrice) : 'Analyzing...'}
                        </span>
                        <Badge className={getStatusColor(artwork.aiAnalysisComplete === true ? 'complete' : 'analyzing')}>
                          {artwork.aiAnalysisComplete === true ? 'Ready' : 'Processing'}
                        </Badge>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={getImageUrl(artwork.thumbnailUrl || artwork.imageUrl)}
                          alt={artwork.title}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{artwork.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {artwork.artist && `by ${artwork.artist} • `}
                          {artwork.medium} {artwork.year && `• ${artwork.year}`}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {artwork.dimensions}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-semibold">
                          {artwork.suggestedPrice ? formatPrice(artwork.suggestedPrice) : 'Analyzing...'}
                        </div>
                        <Badge className={getStatusColor(artwork.aiAnalysisComplete === true ? 'complete' : 'analyzing')}>
                          {artwork.aiAnalysisComplete === true ? 'Ready' : 'Processing'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}