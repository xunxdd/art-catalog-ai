import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Share, Copy, Mail, MessageSquare, ExternalLink, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, getImageUrl } from "@/lib/utils";
import type { Artwork } from "@shared/schema";

interface ArtworkShareDialogProps {
  artwork: Artwork | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArtworkShareDialog({ artwork, open, onOpenChange }: ArtworkShareDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!artwork) return null;

  const shareUrl = `${window.location.origin}/artwork/${artwork.id}`;
  const shareText = `Check out this artwork: "${artwork.title}"${artwork.artist ? ` by ${artwork.artist}` : ''}${artwork.suggestedPrice ? ` - ${formatPrice(artwork.suggestedPrice)}` : ''}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Artwork link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Artwork: ${artwork.title}`);
    const body = encodeURIComponent(`${shareText}\n\nView it here: ${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleSocialShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
    };

    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  const socialPlatforms = [
    { name: 'Twitter', color: 'bg-blue-500 hover:bg-blue-600', icon: '𝕏' },
    { name: 'Facebook', color: 'bg-blue-600 hover:bg-blue-700', icon: '📘' },
    { name: 'LinkedIn', color: 'bg-blue-700 hover:bg-blue-800', icon: '💼' },
    { name: 'WhatsApp', color: 'bg-green-500 hover:bg-green-600', icon: '💬' },
    { name: 'Telegram', color: 'bg-blue-400 hover:bg-blue-500', icon: '✈️' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share Artwork
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Artwork Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={getImageUrl(artwork.imageUrl)}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{artwork.title}</h3>
                  {artwork.artist && <p className="text-sm text-muted-foreground">by {artwork.artist}</p>}
                  <p className="text-sm text-muted-foreground">{artwork.medium}</p>
                  {artwork.suggestedPrice && (
                    <p className="text-sm font-semibold text-green-600 mt-1">
                      {formatPrice(artwork.suggestedPrice)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Share Link */}
          <div className="space-y-2">
            <Label>Share Link</Label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="flex items-center gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Share Message */}
          <div className="space-y-2">
            <Label>Share Message</Label>
            <Textarea
              value={shareText}
              readOnly
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleEmailShare}
                className="flex items-center gap-2 flex-1"
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialShare('whatsapp')}
                className="flex items-center gap-2 flex-1"
              >
                <MessageSquare className="h-4 w-4" />
                WhatsApp
              </Button>
            </div>

            {/* Social Media Grid */}
            <div className="grid grid-cols-5 gap-2">
              {socialPlatforms.map((platform) => (
                <Button
                  key={platform.name}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSocialShare(platform.name.toLowerCase())}
                  className={`h-12 text-white ${platform.color} border-0`}
                  title={`Share on ${platform.name}`}
                >
                  <span className="text-lg">{platform.icon}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}