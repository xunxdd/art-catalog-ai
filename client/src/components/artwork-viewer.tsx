import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import type { Artwork } from "@shared/schema";

interface ArtworkViewerProps {
  artwork: Artwork | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artworks?: Artwork[];
  onNavigate?: (direction: 'prev' | 'next') => void;
}

export function ArtworkViewer({ 
  artwork, 
  open, 
  onOpenChange, 
  artworks = [], 
  onNavigate 
}: ArtworkViewerProps) {
  if (!artwork) return null;

  const currentIndex = artworks.findIndex(a => a.id === artwork.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < artworks.length - 1;

  const handlePrev = () => {
    if (hasPrev && onNavigate) {
      onNavigate('prev');
    }
  };

  const handleNext = () => {
    if (hasNext && onNavigate) {
      onNavigate('next');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95">
        <div className="relative h-[95vh] flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation buttons */}
          {artworks.length > 1 && (
            <>
              {hasPrev && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
              )}
              {hasNext && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              )}
            </>
          )}

          {/* Main image */}
          <img
            src={getImageUrl(artwork.imageUrl)}
            alt={artwork.title}
            className="max-w-full max-h-full object-contain"
          />

          {/* Artwork info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{artwork.title}</h2>
            {artwork.artist && (
              <p className="text-lg opacity-90 mb-1">by {artwork.artist}</p>
            )}
            <div className="flex gap-4 text-sm opacity-75">
              {artwork.medium && <span>{artwork.medium}</span>}
              {artwork.year && <span>{artwork.year}</span>}
              {artwork.dimensions && <span>{artwork.dimensions}</span>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}