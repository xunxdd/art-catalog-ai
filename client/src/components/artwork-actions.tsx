import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Expand, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LoginDialog } from "@/components/login-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Artwork } from "@shared/schema";

interface ArtworkActionsProps {
  artwork: Artwork;
  onExpand?: (artwork: Artwork) => void;
  onToggleFavorite?: (artwork: Artwork) => void;
  className?: string;
}

export function ArtworkActions({ artwork, onExpand, onToggleFavorite, className = "" }: ArtworkActionsProps) {
  const { isAuthenticated } = useAuth();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 15) + 3); // Simulated likes
  const [animateHeart, setAnimateHeart] = useState(false);

  // Check if user has liked this artwork (from localStorage for now)
  useEffect(() => {
    if (isAuthenticated) {
      const favorites = JSON.parse(localStorage.getItem('user_favorites') || '[]');
      setIsLiked(favorites.includes(artwork.id));
    }
  }, [artwork.id, isAuthenticated]);

  const handleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onExpand) {
      onExpand(artwork);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }
    
    // Toggle favorite state
    const favorites = JSON.parse(localStorage.getItem('user_favorites') || '[]');
    const newIsLiked = !isLiked;
    
    if (newIsLiked) {
      favorites.push(artwork.id);
      setLikeCount(prev => prev + 1);
    } else {
      const index = favorites.indexOf(artwork.id);
      if (index > -1) favorites.splice(index, 1);
      setLikeCount(prev => Math.max(0, prev - 1));
    }
    
    localStorage.setItem('user_favorites', JSON.stringify(favorites));
    setIsLiked(newIsLiked);
    
    // Trigger heart animation
    setAnimateHeart(true);
    setTimeout(() => setAnimateHeart(false), 300);
    
    if (onToggleFavorite) {
      onToggleFavorite(artwork);
    }
  };

  const handleLoginSuccess = () => {
    // After successful login, execute the favorite action
    handleFavorite({ preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent);
  };

  return (
    <>
      <div className={`flex items-center gap-1 ${className}`}>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleExpand}
          className="h-8 w-8 hover:bg-secondary/50 text-foreground hover:text-foreground"
        >
          <Expand className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFavorite}
          className={`flex items-center gap-1 h-8 px-2 hover:bg-secondary/50 transition-all duration-200 ${
            animateHeart ? 'scale-110' : 'scale-100'
          } ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-red-400 hover:text-red-500'}`}
        >
          <Heart 
            className={`h-4 w-4 transition-all duration-200 ${
              isLiked ? 'fill-current' : ''
            } ${animateHeart ? 'animate-pulse' : ''}`} 
          />
          <span className="text-xs font-medium">{likeCount}</span>
        </Button>
      </div>

      <LoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onSuccess={handleLoginSuccess}
        title="Add to Favorites"
        description={`Please log in to add "${artwork.title}" to your favorites.`}
      />
    </>
  );
}