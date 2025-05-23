import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2, Download, FolderSync } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function QuickActions() {
  const { toast } = useToast();

  const handleBulkAnalysis = () => {
    toast({
      title: "Bulk Analysis",
      description: "Starting bulk AI analysis for all unprocessed artworks...",
    });
  };

  const handleExportCatalog = () => {
    toast({
      title: "Export Started",
      description: "Your catalog is being prepared for download...",
    });
  };

  const handleMarketplaceSync = () => {
    toast({
      title: "FolderSync Started",
      description: "Syncing catalog with marketplace platforms...",
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleBulkAnalysis}
          >
            <Wand2 className="mr-3 h-4 w-4 text-primary" />
            Bulk AI Analysis
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleExportCatalog}
          >
            <Download className="mr-3 h-4 w-4 text-green-600" />
            Export Catalog
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleMarketplaceSync}
          >
            <FolderSync className="mr-3 h-4 w-4 text-yellow-600" />
            FolderSync to Marketplace
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
