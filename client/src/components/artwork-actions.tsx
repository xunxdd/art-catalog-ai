import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Expand, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LoginDialog } from "@/components/login-dialog";
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

  const handleExpand = () => {
    if (onExpand) {
      onExpand(artwork);
    }
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }
    
    if (onToggleFavorite) {
      onToggleFavorite(artwork);
    }
  };

  const handleLoginSuccess = () => {
    // After successful login, execute the favorite action
    if (onToggleFavorite) {
      onToggleFavorite(artwork);
    }
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
          size="icon"
          onClick={handleFavorite}
          className="h-8 w-8 hover:bg-secondary/50 text-red-500 hover:text-red-600"
        >
          <Heart className="h-4 w-4" />
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