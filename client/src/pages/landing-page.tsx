import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Zap, ShoppingCart, TrendingUp, Users, Clock, Award, Menu, LogIn, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { Link } from "wouter";
import type { Artwork } from "@shared/schema";

export default function LandingPage() {
  const { data: featuredArtworks } = useQuery<Artwork[]>({
    queryKey: ['/api/artworks/recent'],
  });

  const recentArtworks = featuredArtworks?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">ArtCatalog</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/gallery">
              <Button variant="ghost">Browse Gallery</Button>
            </Link>
            <Button variant="ghost">Features</Button>
            <Button variant="ghost">Pricing</Button>
          </nav>
          
          <div className="flex items-center space-x-2">
            <Link href="/auth">
              <Button variant="ghost" size="sm">
                <LogIn className="mr-2 h-4 w-4" />
                Log In
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 text-sm px-4 py-2">
              <Zap className="mr-2 h-4 w-4" />
              AI-Powered Art Analysis
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Snap & Sell
              <span className="text-primary block">Your Art</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Transform your artwork photography into professional catalog entries with AI-powered analysis, 
              pricing, and marketplace listings in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth">
                <Button size="lg" className="text-lg px-8 py-6">
                  <Camera className="mr-2 h-5 w-5" />
                  Start Cataloging Free
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                View Demo Gallery
              </Button>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">95%</div>
                <div className="text-sm text-muted-foreground">AI Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">30s</div>
                <div className="text-sm text-muted-foreground">Analysis Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artworks */}
      {recentArtworks.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Recently Cataloged</h2>
              <p className="text-lg text-muted-foreground">
                See what artists are discovering with AI-powered analysis
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {recentArtworks.map((artwork) => (
                <Card key={artwork.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={getImageUrl(artwork.thumbnailUrl || artwork.imageUrl)}
                      alt={artwork.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-1">{artwork.title}</h3>
                    {artwork.artist && (
                      <p className="text-sm text-muted-foreground mb-2">by {artwork.artist}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-green-600">
                        {artwork.suggestedPrice ? formatPrice(artwork.suggestedPrice) : 'Analyzing...'}
                      </div>
                      <Badge variant={artwork.aiAnalysisComplete ? "default" : "secondary"} className="text-xs">
                        {artwork.aiAnalysisComplete ? 'Analyzed' : 'Processing'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link href="/gallery">
                <Button variant="outline" size="lg">
                  View All Artworks
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              From photo to marketplace in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Snap Your Art</h3>
              <p className="text-muted-foreground">
                Take photos of your artwork from multiple angles using your phone or camera
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. AI Analysis</h3>
              <p className="text-muted-foreground">
                Our AI identifies style, medium, condition, and suggests pricing in seconds
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. List & Sell</h3>
              <p className="text-muted-foreground">
                Generate professional listings for multiple marketplaces instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to catalog and sell your artwork
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="p-6">
              <TrendingUp className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Smart Pricing</h3>
              <p className="text-muted-foreground">
                AI-powered price suggestions based on style, medium, size, and market data
              </p>
            </Card>
            
            <Card className="p-6">
              <Users className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Multi-Platform</h3>
              <p className="text-muted-foreground">
                Create listings for Etsy, eBay, Facebook Marketplace, and more simultaneously
              </p>
            </Card>
            
            <Card className="p-6">
              <Clock className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Instant Analysis</h3>
              <p className="text-muted-foreground">
                Get detailed artwork analysis including style, period, and condition in seconds
              </p>
            </Card>
            
            <Card className="p-6">
              <Award className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Professional Descriptions</h3>
              <p className="text-muted-foreground">
                AI-generated descriptions that highlight key features and selling points
              </p>
            </Card>
            
            <Card className="p-6">
              <Camera className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Photo Management</h3>
              <p className="text-muted-foreground">
                Organize multiple angles, detail shots, and create professional galleries
              </p>
            </Card>
            
            <Card className="p-6">
              <ShoppingCart className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Marketplace Ready</h3>
              <p className="text-muted-foreground">
                Export optimized listings with proper formatting for any platform
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Art Business?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join artists who are already using AI to catalog, price, and sell their artwork more effectively.
          </p>
          
          <Link href="/auth">
            <Button size="lg" className="text-lg px-8 py-6">
              <Camera className="mr-2 h-5 w-5" />
              Start Your Free Catalog
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}