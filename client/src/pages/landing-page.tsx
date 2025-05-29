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
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-background overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_1px,transparent_1px)] [background-size:20px_20px] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_1px,transparent_1px)]"></div>
        
        <div className="relative container mx-auto px-4 py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Elegant badge */}
            <div className="inline-flex items-center gap-2 bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-black/10 dark:border-white/10">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 tracking-wide">AI-Powered Art Cataloging</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-8 text-gray-900 dark:text-white leading-[0.9]">
              Catalogue & Sell
              <span className="block font-extralight text-gray-600 dark:text-gray-400 text-4xl md:text-6xl lg:text-7xl mt-4">Your Artwork</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed max-w-2xl mx-auto font-light">
              Professional art cataloging with intelligent analysis, market pricing, and instant marketplace listings.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
              <Link href="/auth">
                <Button size="lg" className="text-base px-8 py-6 bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition-colors duration-200 rounded-full font-medium">
                  Start Cataloging
                  <Camera className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/showroom">
                <Button variant="outline" size="lg" className="text-base px-8 py-6 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 rounded-full font-medium">
                  View Gallery
                  <Images className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {/* Minimal Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl font-light text-gray-900 dark:text-white mb-1">95%</div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-gray-900 dark:text-white mb-1">30s</div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Analysis</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-gray-900 dark:text-white mb-1">∞</div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artworks */}
      {recentArtworks.length > 0 && (
        <section className="py-32 bg-white dark:bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-6 text-gray-900 dark:text-white">
                Recently Catalogued
              </h2>
              <div className="w-16 h-px bg-gray-300 dark:bg-gray-600 mx-auto mb-8"></div>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto font-light">
                Discover the latest artworks being analyzed by our intelligent cataloging system
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {recentArtworks.map((artwork, index) => (
                <div key={artwork.id} className="group cursor-pointer">
                  <div className="aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-800 mb-6 relative">
                    <img
                      src={getImageUrl(artwork.thumbnailUrl || artwork.imageUrl)}
                      alt={artwork.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ArtworkActions
                          artwork={artwork}
                          onExpand={handleExpand}
                          onToggleFavorite={handleFavorite}
                          className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-white/20"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-light text-gray-900 dark:text-white tracking-wide">
                      {artwork.title}
                    </h3>
                    {artwork.artist && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-light tracking-wide">
                        {artwork.artist}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-lg font-medium text-gray-900 dark:text-white">
                        {artwork.suggestedPrice ? formatPrice(artwork.suggestedPrice) : '—'}
                      </div>
                      {artwork.medium && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {artwork.medium}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-20">
              <Link href="/showroom">
                <Button variant="outline" size="lg" className="text-base px-8 py-4 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 rounded-full font-medium">
                  View Full Collection
                  <Images className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-32 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-6 text-gray-900 dark:text-white">
              How It Works
            </h2>
            <div className="w-16 h-px bg-gray-300 dark:bg-gray-600 mx-auto mb-8"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto font-light">
              From photograph to marketplace in three elegant steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-full group-hover:border-gray-400 dark:group-hover:border-gray-500 transition-colors duration-300">
                <Camera className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="mb-4">
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Step 1</span>
              </div>
              <h3 className="text-2xl font-light mb-6 text-gray-900 dark:text-white tracking-wide">Photograph</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-light">
                Capture your artwork using any camera or device. Our system analyzes images from multiple angles.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-full group-hover:border-gray-400 dark:group-hover:border-gray-500 transition-colors duration-300">
                <Zap className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="mb-4">
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Step 2</span>
              </div>
              <h3 className="text-2xl font-light mb-6 text-gray-900 dark:text-white tracking-wide">Analyze</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-light">
                AI identifies style, medium, condition, and suggests market-based pricing within seconds.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-full group-hover:border-gray-400 dark:group-hover:border-gray-500 transition-colors duration-300">
                <ShoppingCart className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="mb-4">
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Step 3</span>
              </div>
              <h3 className="text-2xl font-light mb-6 text-gray-900 dark:text-white tracking-wide">Catalogue</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-light">
                Generate professional descriptions and listings ready for any marketplace platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-6 text-gray-900 dark:text-white">
              Features
            </h2>
            <div className="w-16 h-px bg-gray-300 dark:bg-gray-600 mx-auto mb-8"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto font-light">
              Professional tools designed for artists and collectors
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-light mb-4 text-gray-900 dark:text-white tracking-wide">Smart Pricing</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-light text-sm">
                AI-powered price suggestions based on style, medium, size, and market data analysis
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center">
                <Users className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-light mb-4 text-gray-900 dark:text-white tracking-wide">Multi-Platform</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-light text-sm">
                Create optimized listings for Etsy, eBay, Facebook Marketplace, and more simultaneously
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center">
                <Clock className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-light mb-4 text-gray-900 dark:text-white tracking-wide">Instant Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-light text-sm">
                Detailed artwork analysis including style, period, and condition assessment in seconds
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center">
                <Award className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-light mb-4 text-gray-900 dark:text-white tracking-wide">Professional Descriptions</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-light text-sm">
                AI-generated descriptions that highlight key features and compelling selling points
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center">
                <Camera className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-light mb-4 text-gray-900 dark:text-white tracking-wide">Photo Management</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-light text-sm">
                Organize multiple angles, detail shots, and create professional galleries effortlessly
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-light mb-4 text-gray-900 dark:text-white tracking-wide">Marketplace Ready</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-light text-sm">
                Export optimized listings with proper formatting for any marketplace platform
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gray-900 dark:bg-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-6 text-white leading-tight">
            Ready to Begin?
          </h2>
          <div className="w-16 h-px bg-gray-600 mx-auto mb-8"></div>
          <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Join artists who are transforming their practice with intelligent cataloging and market insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="text-base px-8 py-6 bg-white text-gray-900 hover:bg-gray-100 transition-colors duration-200 rounded-full font-medium">
                Start Cataloging
                <Camera className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/showroom">
              <Button variant="outline" size="lg" className="text-base px-8 py-6 border border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-colors duration-200 rounded-full font-medium">
                Browse Collection
                <Images className="ml-2 h-4 w-4" />
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