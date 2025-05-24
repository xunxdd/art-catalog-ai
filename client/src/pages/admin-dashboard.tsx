import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Users, Image, TrendingUp, DollarSign } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface AdminStats {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
  };
  artworkStats: {
    totalArtworks: number;
    artworksToday: number;
    avgPrice: number;
  };
  userAnalytics: Array<{
    userId: string;
    userName: string;
    artworkCount: number;
    totalValue: number;
  }>;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Failed to load admin statistics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="secondary">Admin View</Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.userStats.newUsersToday} new today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Artworks</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.artworkStats.totalArtworks}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.artworkStats.artworksToday} uploaded today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.artworkStats.avgPrice)}</div>
            <p className="text-xs text-muted-foreground">
              AI suggested pricing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Platform engagement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>User Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.userAnalytics.map((user) => (
              <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{user.userName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {user.artworkCount} artworks • Total value: {formatPrice(user.totalValue)}
                  </p>
                </div>
                <Badge variant="outline">
                  {user.artworkCount} pieces
                </Badge>
              </div>
            ))}
            {stats.userAnalytics.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No user data available yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}