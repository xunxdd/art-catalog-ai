import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { Palette, Search, Bell, User, LogOut, Settings, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function NavigationHeader() {
  const [location] = useLocation();
  const { user, isAdmin } = useAuth();

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
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
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
                <DropdownMenuItem asChild>
                  <a href="/api/logout" className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
