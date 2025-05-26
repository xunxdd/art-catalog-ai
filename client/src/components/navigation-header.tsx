import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { Camera, Search, Bell, User, LogOut, Settings, Shield, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export function NavigationHeader() {
  const [location] = useLocation();
  const { user, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2 text-left">
                    <Camera className="text-primary h-6 w-6" />
                    <span>ArtCatalogAI</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-6">
                  <Link 
                    href="/" 
                    className={`text-left py-2 px-3 rounded-md transition-colors ${
                      isActive('/') 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Catalog
                  </Link>
                  <Link 
                    href="/gallery" 
                    className={`text-left py-2 px-3 rounded-md transition-colors ${
                      isActive('/gallery') 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Gallery
                  </Link>
                  <Link 
                    href="/analytics" 
                    className={`text-left py-2 px-3 rounded-md transition-colors ${
                      isActive('/analytics') 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Analytics
                  </Link>
                  <Link 
                    href="/marketplace" 
                    className={`text-left py-2 px-3 rounded-md transition-colors ${
                      isActive('/marketplace') 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Marketplace
                  </Link>
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className={`text-left py-2 px-3 rounded-md transition-colors ${
                        isActive('/admin') 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center">
              <Camera className="text-primary h-8 w-8" />
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
              {isAdmin && (
                <Link href="/admin" className={`font-medium transition-colors ${
                  isActive('/admin') 
                    ? 'text-primary border-b-2 border-primary pb-1' 
                    : 'text-muted-foreground hover:text-primary'
                }`}>
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            
            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || ''} alt={user?.firstName || 'User'} />
                    <AvatarFallback>
                      {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user?.email || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    {isAdmin && (
                      <Badge variant="secondary" className="w-fit text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => {
                    fetch('/api/auth/logout', { 
                      method: 'POST', 
                      credentials: 'include' 
                    })
                    .then(() => window.location.href = '/')
                    .catch(() => window.location.href = '/');
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
