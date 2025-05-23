import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Palette, Search, Bell, User } from "lucide-react";

export function NavigationHeader() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Palette className="text-primary h-8 w-8" />
              <h1 className="text-xl font-bold text-foreground">ArtCatalog AI</h1>
            </Link>
            <nav className="hidden md:flex space-x-8 ml-8">
              <Link href="/" className={`font-medium transition-colors ${
                isActive('/') 
                  ? 'text-primary border-b-2 border-primary pb-1' 
                  : 'text-muted-foreground hover:text-primary'
              }`}>
                Catalog
              </Link>
              <Link href="/gallery" className={`font-medium transition-colors ${
                isActive('/gallery') 
                  ? 'text-primary border-b-2 border-primary pb-1' 
                  : 'text-muted-foreground hover:text-primary'
              }`}>
                Gallery
              </Link>
              <Link href="/analytics" className={`font-medium transition-colors ${
                isActive('/analytics') 
                  ? 'text-primary border-b-2 border-primary pb-1' 
                  : 'text-muted-foreground hover:text-primary'
              }`}>
                Analytics
              </Link>
              <Link href="/marketplace" className={`font-medium transition-colors ${
                isActive('/marketplace') 
                  ? 'text-primary border-b-2 border-primary pb-1' 
                  : 'text-muted-foreground hover:text-primary'
              }`}>
                Marketplace
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
