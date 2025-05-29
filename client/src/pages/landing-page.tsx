import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Zap, ShoppingCart, TrendingUp, Users, Clock, Award, Menu, Images } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { Link } from "wouter";
import { SimpleNav } from "@/components/simple-nav";
import { ArtworkActions } from "@/components/artwork-actions";
import { ArtworkViewer } from "@/components/artwork-viewer";
import type { Artwork } from "@shared/schema";

export default function LandingPage() {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const { data: featuredArtworks } = useQuery<Artwork[]>({
    queryKey: ['/api/artworks/recent'],
  });

  const recentArtworks = featuredArtworks?.slice(0, 6) || [];

  const handleExpand = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setViewerOpen(true);
  };

  const handleFavorite = (artwork: Artwork) => {
    // TODO: Implement favorites functionality
    console.log('Toggle favorite for:', artwork.title);
  };

  const handleNavigateViewer = (direction: 'prev' | 'next') => {
    if (!selectedArtwork) return;
    
    const currentIndex = recentArtworks.findIndex(a => a.id === selectedArtwork.id);
    let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < recentArtworks.length) {
      setSelectedArtwork(recentArtworks[newIndex]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Use shared navigation component */}
      <SimpleNav />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-violet-950/20 dark:via-background dark:to-cyan-950/20">
        {/* Abstract background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-pink-400/10 to-orange-600/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-violet-200 dark:border-violet-800 rounded-full px-6 py-3 mb-8 shadow-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">AI-Powered Art Analysis</span>
              <Zap className="ml-2 h-4 w-4 text-violet-600" />
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight mb-8 bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent leading-none">
              Snap & Sell
              <span className="block text-gray-900 dark:text-white text-5xl md:text-7xl lg:text-8xl mt-2">Your Art</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
              Transform your artwork into professional catalog entries with intelligent analysis, 
              smart pricing, and instant marketplace listings.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link href="/auth">
                <Button size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200">
                  <Camera className="mr-3 h-5 w-5" />
                  Start Creating
                </Button>
              </Link>
              <Link href="/showroom">
                <Button variant="outline" size="lg" className="text-lg px-10 py-7 border-2 border-gray-300 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-400 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <Images className="mr-3 h-5 w-5" />
                  Explore Gallery
                </Button>
              </Link>
            </div>
            
            {/* Modern Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-800/20 shadow-lg">
                <div className="text-4xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">95%</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">AI Accuracy</div>
              </div>
              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-800/20 shadow-lg">
                <div className="text-4xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">30s</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">Analysis Time</div>
              </div>
              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-800/20 shadow-lg">
                <div className="text-4xl font-black bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent mb-2">24/7</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artworks */}
      {recentArtworks.length > 0 && (
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Recently Cataloged
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Discover the latest artworks being analyzed and cataloged by our AI-powered platform
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {recentArtworks.map((artwork, index) => (
                <Card key={artwork.id} className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:scale-105">
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={getImageUrl(artwork.thumbnailUrl || artwork.imageUrl)}
                      alt={artwork.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Floating badge */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-lg">
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-2 line-clamp-1 text-gray-900 dark:text-white">{artwork.title}</h3>
                    {artwork.artist && (
                      <p className="text-base text-gray-600 dark:text-gray-400 mb-3">by {artwork.artist}</p>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {artwork.suggestedPrice ? formatPrice(artwork.suggestedPrice) : 'Analyzing...'}
                      </div>
                      {artwork.medium && (
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                          {artwork.medium}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  {/* Modern action buttons */}
                  <div className="px-6 pb-6">
                    <div className="flex justify-end">
                      <ArtworkActions
                        artwork={artwork}
                        onExpand={handleExpand}
                        onToggleFavorite={handleFavorite}
                        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-16">
              <Link href="/showroom">
                <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-2 border-gray-300 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-400 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <Images className="mr-3 h-5 w-5" />
                  Explore Full Gallery
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-white to-cyan-50/50 dark:from-violet-950/10 dark:via-background dark:to-cyan-950/10"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From photo to marketplace in three seamless steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="relative group">
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 dark:border-gray-800/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Camera className="h-10 w-10 text-white" />
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center bg-violet-100 dark:bg-violet-900/30 rounded-full px-4 py-2 mb-4">
                    <span className="text-sm font-black text-violet-700 dark:text-violet-300">STEP 1</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Snap Your Art</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Capture your artwork from multiple angles using your phone or camera. Our system works with any device.
                  </p>
                </div>
              </div>
              {/* Connection line */}
              <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-violet-400 to-cyan-400 transform -translate-y-1/2"></div>
            </div>
            
            <div className="relative group">
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 dark:border-gray-800/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center bg-cyan-100 dark:bg-cyan-900/30 rounded-full px-4 py-2 mb-4">
                    <span className="text-sm font-black text-cyan-700 dark:text-cyan-300">STEP 2</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">AI Analysis</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Advanced AI identifies style, medium, condition, and suggests optimal pricing in just 30 seconds.
                  </p>
                </div>
              </div>
              {/* Connection line */}
              <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-cyan-400 to-emerald-400 transform -translate-y-1/2"></div>
            </div>
            
            <div className="relative group">
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 dark:border-gray-800/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <ShoppingCart className="h-10 w-10 text-white" />
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center bg-emerald-100 dark:bg-emerald-900/30 rounded-full px-4 py-2 mb-4">
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">STEP 3</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">List & Sell</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Generate professional listings optimized for multiple marketplaces and start selling instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-background dark:to-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to catalog and sell your artwork professionally
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <Card className="group relative overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 p-8 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 dark:from-orange-500/10 dark:to-red-500/10"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Smart Pricing</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  AI-powered price suggestions based on style, medium, size, and real market data analysis
                </p>
              </div>
            </Card>
            
            <Card className="group relative overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 p-8 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Multi-Platform</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Create optimized listings for Etsy, eBay, Facebook Marketplace, and more simultaneously
                </p>
              </div>
            </Card>
            
            <Card className="group relative overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 p-8 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Instant Analysis</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Get detailed artwork analysis including style, period, and condition assessment in seconds
                </p>
              </div>
            </Card>
            
            <Card className="group relative overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 p-8 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 dark:from-pink-500/10 dark:to-rose-500/10"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Professional Descriptions</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  AI-generated descriptions that highlight key features and compelling selling points
                </p>
              </div>
            </Card>
            
            <Card className="group relative overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 p-8 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 dark:from-indigo-500/10 dark:to-violet-500/10"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Photo Management</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Organize multiple angles, detail shots, and create professional galleries effortlessly
                </p>
              </div>
            </Card>
            
            <Card className="group relative overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 p-8 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-teal-500/5 dark:from-cyan-500/10 dark:to-teal-500/10"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <ShoppingCart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Marketplace Ready</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Export optimized listings with proper formatting for any online marketplace platform
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-600">
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-white leading-tight">
            Ready to Transform Your Art Business?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of artists who are already using AI to catalog, price, and sell their artwork more effectively than ever before.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/auth">
              <Button size="lg" className="text-lg px-10 py-7 bg-white text-gray-900 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200">
                <Camera className="mr-3 h-5 w-5" />
                Start Your Free Catalog
              </Button>
            </Link>
            <Link href="/showroom">
              <Button variant="outline" size="lg" className="text-lg px-10 py-7 border-2 border-white/30 text-white hover:bg-white/10 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <Images className="mr-3 h-5 w-5" />
                View Examples
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Fullscreen artwork viewer */}
      <ArtworkViewer
        artwork={selectedArtwork}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        artworks={recentArtworks}
        onNavigate={handleNavigateViewer}
      />
    </div>
  );
}