import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import type { Artwork } from "@shared/schema";

interface ArtworkVisibilityControlProps {
  artwork: Artwork;
  className?: string;
}

export function ArtworkVisibilityControl({ artwork, className = "" }: ArtworkVisibilityControlProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const visibilityMutation = useMutation({
    mutationFn: async ({ artworkId, visibility }: { artworkId: number; visibility: string }) => {
      const response = await apiRequest('PATCH', `/api/artworks/${artworkId}`, { visibility });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Visibility updated",
        description: "Artwork visibility has been changed",
      });
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/artworks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/artworks'] });
      queryClient.invalidateQueries({ queryKey: [`/api/artworks/${artwork.id}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update visibility",
        variant: "destructive",
      });
    },
  });

  return (
    <div className={`p-4 border border-gray-300 rounded-lg bg-gray-50 ${className}`}>
      <div className="text-sm font-medium mb-3">Visibility Settings</div>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => visibilityMutation.mutate({ artworkId: artwork.id, visibility: 'public' })}
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
            artwork.visibility === 'public' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          disabled={visibilityMutation.isPending}
        >
          <Eye className="h-4 w-4" />
          Public
        </button>
        <button 
          onClick={() => visibilityMutation.mutate({ artworkId: artwork.id, visibility: 'private' })}
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
            artwork.visibility === 'private' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          disabled={visibilityMutation.isPending}
        >
          <EyeOff className="h-4 w-4" />
          Private
        </button>
      </div>
      <div className="text-xs text-gray-600 mt-2">
        Current: {artwork.visibility || 'public'} - {artwork.visibility === 'public' ? 'Visible in gallery' : 'Only visible to you'}
      </div>
    </div>
  );
}