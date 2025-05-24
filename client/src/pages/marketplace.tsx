import { NavigationHeader } from "@/components/navigation-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Store, Globe, ShoppingCart, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Artwork } from "@shared/schema";

export default function Marketplace() {
  const { toast } = useToast();
  const { data: artworks } = useQuery<Artwork[]>({
    queryKey: ['/api/user/artworks'],
  });

  const handleConnectPlatform = (platformName: string) => {
    const platformUrls = {
      "Etsy": "https://www.etsy.com/sell",
      "Saatchi Art": "https://www.saatchiart.com/artists/apply",
      "eBay": "https://www.ebay.com/sl/sell",
      "Your Website": "/catalog" // Stay in app for direct sales
    };
    
    const url = platformUrls[platformName as keyof typeof platformUrls];
    
    if (platformName === "Your Website") {
      // Stay in our app for direct sales setup
      toast({
        title: "Direct Sales Platform",
        description: "Setting up your personal sales page...",
      });
      window.location.href = url;
    } else {
      // Open external marketplace in new tab
      toast({
        title: `Connecting to ${platformName}`,
        description: "Opening platform registration page in new tab...",
      });
      window.open(url, '_blank');
    }
  };

  const readyForListing = artworks?.filter(a => a.aiAnalysisComplete && !a.marketplaceListed) || [];
  const listedArtworks = artworks?.filter(a => a.marketplaceListed) || [];

  const handleCreateListing = (artwork: Artwork, platform: string) => {
    // For now, open the marketplace listing dialog from catalog
    // This creates actual listings with the platform information
    toast({
      title: "Redirecting to Listing Creator",
      description: `Opening listing interface for ${platform}...`,
    });
    
    // In a real implementation, this would redirect to catalog with pre-selected platform
    window.location.href = `/catalog?createListing=${artwork.id}&platform=${platform}`;
  };

  const marketplaces = [
    { name: "Etsy", icon: Store, color: "text-orange-600", description: "Handmade & vintage marketplace" },
    { name: "Saatchi Art", icon: TrendingUp, color: "text-blue-600", description: "Contemporary art platform" },
    { name: "eBay", icon: ShoppingCart, color: "text-yellow-600", description: "Global auction & sales" },
    { name: "Your Website", icon: Globe, color: "text-green-600", description: "Direct sales platform" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground mt-2">Manage your artwork listings across platforms</p>
        </div>

        {/* Marketplace Platforms */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {marketplaces.map((marketplace) => (
            <Card key={marketplace.name} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <marketplace.icon className={`h-12 w-12 mx-auto ${marketplace.color} mb-2`} />
                <CardTitle className="text-lg">{marketplace.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{marketplace.description}</p>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleConnectPlatform(marketplace.name)}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Connect Platform
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ready for Listing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="mr-2 h-5 w-5" />
                Ready for Listing ({readyForListing.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {readyForListing.length > 0 ? readyForListing.slice(0, 5).map((artwork) => (
                  <div key={artwork.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="w-16 h-16 bg-muted rounded overflow-hidden">
                      <img
                        src={getImageUrl(artwork.thumbnailUrl || artwork.imageUrl)}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{artwork.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {artwork.medium} {artwork.artist && `• ${artwork.artist}`}
                      </p>
                      <p className="text-sm font-semibold text-green-600">
                        {artwork.suggestedPrice ? formatPrice(artwork.suggestedPrice) : 'No price set'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleCreateListing(artwork, 'Etsy')}
                        className="text-xs"
                      >
                        List on Etsy
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleCreateListing(artwork, 'Saatchi Art')}
                        className="text-xs"
                      >
                        List on Saatchi
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No artworks ready for listing</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload and analyze artworks to start selling
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Currently Listed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Currently Listed ({listedArtworks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {listedArtworks.length > 0 ? listedArtworks.slice(0, 5).map((artwork) => (
                  <div key={artwork.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="w-16 h-16 bg-muted rounded overflow-hidden">
                      <img
                        src={getImageUrl(artwork.thumbnailUrl || artwork.imageUrl)}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{artwork.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {artwork.medium} {artwork.artist && `• ${artwork.artist}`}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">Etsy</Badge>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {artwork.suggestedPrice ? formatPrice(artwork.suggestedPrice) : 'No price'}
                      </p>
                      <Button variant="ghost" size="sm" className="text-xs">
                        <ExternalLink className="mr-1 h-3 w-3" />
                        View Listing
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active listings</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Create your first marketplace listing
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-4">
                  <Store className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Listings</p>
                  <p className="text-2xl font-bold">{listedArtworks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ready to List</p>
                  <p className="text-2xl font-bold">{readyForListing.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg mr-4">
                  <Globe className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Platforms Connected</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}