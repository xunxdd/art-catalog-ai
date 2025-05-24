import { NavigationHeader } from "@/components/navigation-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Palette, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/utils";
import type { Artwork } from "@shared/schema";

export default function Analytics() {
  const { data: artworks } = useQuery<Artwork[]>({
    queryKey: ['/api/user/artworks'],
  });

  const totalArtworks = artworks?.length || 0;
  const analyzedArtworks = artworks?.filter(a => a.aiAnalysisComplete).length || 0;
  const totalValue = artworks?.reduce((sum, artwork) => sum + (artwork.suggestedPrice || 0), 0) || 0;
  const avgPrice = totalArtworks > 0 ? totalValue / totalArtworks : 0;

  const mediumStats = artworks?.reduce((acc, artwork) => {
    const medium = artwork.medium || 'Unknown';
    acc[medium] = (acc[medium] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const topMediums = Object.entries(mediumStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">Insights into your art collection</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Artworks</CardTitle>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalArtworks}</div>
              <p className="text-xs text-muted-foreground">
                {analyzedArtworks} analyzed by AI
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                AI estimated total value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(avgPrice)}</div>
              <p className="text-xs text-muted-foreground">
                Per artwork estimate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analysis Rate</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalArtworks > 0 ? Math.round((analyzedArtworks / totalArtworks) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                AI processing complete
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Medium Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Top Mediums</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topMediums.length > 0 ? topMediums.map(([medium, count]) => (
                  <div key={medium} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{medium}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(count / totalArtworks) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8">{count}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-center py-8">
                    No artworks to analyze yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Additions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {artworks?.slice(0, 5).map((artwork) => (
                  <div key={artwork.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                      <img
                        src={artwork.thumbnailUrl || artwork.imageUrl}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium truncate">{artwork.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {artwork.medium} {artwork.artist && `• ${artwork.artist}`}
                      </p>
                    </div>
                    <Badge className={artwork.aiAnalysisComplete ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {artwork.aiAnalysisComplete ? 'Complete' : 'Processing'}
                    </Badge>
                  </div>
                )) || (
                  <p className="text-muted-foreground text-center py-8">
                    No recent activity
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}