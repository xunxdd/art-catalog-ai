import { Button } from "@/components/ui/button";
import { Camera, LogIn } from "lucide-react";
import { Link } from "wouter";

export function SimpleNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Camera className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl">ArtCatalogAI</span>
        </Link>
        
        <Link href="/auth">
          <Button size="sm">
            <LogIn className="mr-2 h-4 w-4" />
            Log In
          </Button>
        </Link>
      </div>
    </header>
  );
}