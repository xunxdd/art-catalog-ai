import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Camera, Upload } from "lucide-react";

export function SimpleUploadTest() {
  const [isUploading, setIsUploading] = useState(false);
  const [lastResult, setLastResult] = useState<string>("");
  const { toast } = useToast();

  const testCameraUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.setAttribute('capture', 'environment');
    
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        await uploadFile(target.files[0]);
      }
    };
    
    input.click();
  };

  const testFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        await uploadFile(target.files[0]);
      }
    };
    
    input.click();
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setLastResult("");
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Use the same API method that works for other requests
      const response = await apiRequest("POST", "/api/artworks/upload", formData);
      const data = await response.json();
      
      setLastResult(`✅ SUCCESS! Created: "${data.title}" (ID: ${data.id})`);
      toast({
        title: "Upload Works!",
        description: `Created artwork: ${data.title}`,
      });
    } catch (error: any) {
      setLastResult(`❌ Error: ${error.message}`);
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-4 max-w-md">
      <h3 className="font-semibold mb-4">Upload Test</h3>
      
      <div className="space-y-3">
        <Button 
          onClick={testCameraUpload}
          disabled={isUploading}
          className="w-full"
        >
          <Camera className="h-4 w-4 mr-2" />
          Test Camera Upload
        </Button>
        
        <Button 
          onClick={testFileUpload}
          disabled={isUploading}
          variant="outline"
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Test File Upload
        </Button>
        
        {isUploading && (
          <div className="text-center text-sm text-muted-foreground">
            Uploading...
          </div>
        )}
        
        {lastResult && (
          <div className="text-sm p-2 bg-muted rounded">
            {lastResult}
          </div>
        )}
      </div>
    </Card>
  );
}