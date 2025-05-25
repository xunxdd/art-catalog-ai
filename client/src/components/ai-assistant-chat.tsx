import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Camera, Upload, Send, Mic, MicOff, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIAssistantChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'outline';
  }>;
}

export function AIAssistantChat({ open, onOpenChange }: AIAssistantChatProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [currentStep, setCurrentStep] = useState<'greeting' | 'photo_tips' | 'uploading' | 'analyzing' | 'complete'>('greeting');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open && messages.length === 0) {
      // Initialize conversation
      addAssistantMessage(
        "👋 Hi! I'm your AI Art Assistant. I'll guide you through photographing and cataloging your artwork. Ready to get started?",
        [
          { label: "Yes, let's start!", action: () => startPhotoGuidance(), variant: 'default' },
          { label: "Tell me about best practices first", action: () => showPhotoTips(), variant: 'outline' }
        ]
      );
    }
  }, [open, messages.length]);

  const addAssistantMessage = (content: string, actions?: Array<{label: string; action: () => void; variant?: 'default' | 'outline'}>) => {
    const message: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      actions
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const startPhotoGuidance = () => {
    setCurrentStep('photo_tips');
    addUserMessage("Yes, let's start!");
    addAssistantMessage(
      "Perfect! Let's create amazing photos of your artwork. Here's what you'll need:\n\n📸 **Equipment**: Phone camera or DSLR\n💡 **Lighting**: Natural daylight or soft, even lighting\n📐 **Setup**: Flat surface, artwork laid flat or hung straight\n🎯 **Angles**: I'll guide you through multiple shots",
      [
        { label: "I'm ready to take photos", action: () => startPhotoSession(), variant: 'default' },
        { label: "Tell me more about lighting", action: () => explainLighting(), variant: 'outline' }
      ]
    );
  };

  const showPhotoTips = () => {
    addUserMessage("Tell me about best practices first");
    addAssistantMessage(
      "Great question! Here are professional artwork photography tips:\n\n🎨 **Professional Approach**:\n• Take 5-7 shots: full artwork, close-ups of texture, signature, and corners\n• Use consistent lighting to avoid color shifts\n• Shoot straight-on to prevent distortion\n• Include a color reference card if possible\n\n📱 **Phone Photography**:\n• Clean your lens first\n• Use HDR mode for better dynamic range\n• Avoid flash - use window light instead\n• Take multiple angles for AI analysis",
      [
        { label: "Got it, let's start shooting", action: () => startPhotoSession(), variant: 'default' }
      ]
    );
  };

  const explainLighting = () => {
    addUserMessage("Tell me more about lighting");
    addAssistantMessage(
      "💡 **Lighting Setup Tips**:\n\n✅ **Best Options**:\n• North-facing window (soft, consistent light)\n• Overcast day outdoors (natural diffusion)\n• Two desk lamps at 45° angles\n\n❌ **Avoid**:\n• Direct sunlight (creates harsh shadows)\n• Mixed light sources (color temperature issues)\n• Flash (creates glare and uneven lighting)\n\n🎯 **Pro Tip**: Take a test shot first - colors should look natural and details should be clearly visible in shadows.",
      [
        { label: "Perfect, I'm ready now", action: () => startPhotoSession(), variant: 'default' }
      ]
    );
  };

  const startPhotoSession = () => {
    setCurrentStep('uploading');
    addUserMessage("I'm ready to take photos");
    addAssistantMessage(
      "Excellent! Let's capture your artwork. I recommend taking these shots:\n\n1️⃣ **Full artwork** - entire piece, straight-on\n2️⃣ **Detail shots** - interesting textures or techniques\n3️⃣ **Signature** - artist signature if visible\n4️⃣ **Corner/edge** - to show condition\n\nStart with the full artwork shot. When ready, click 'Upload Photos' below:",
      [
        { label: "Upload Photos", action: () => triggerFileUpload(), variant: 'default' },
        { label: "Use Camera", action: () => triggerCameraCapture(), variant: 'outline' }
      ]
    );
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraCapture = () => {
    // For mobile devices, this will open the camera
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = handleFileSelect;
    input.click();
  };

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files));
    }
  };

  const processFiles = (files: File[]) => {
    setCurrentStep('analyzing');
    addUserMessage(`Uploaded ${files.length} photo${files.length > 1 ? 's' : ''}`);
    
    addAssistantMessage(
      `🎉 Great! I received ${files.length} photo${files.length > 1 ? 's' : ''}. Now I'll analyze your artwork using AI to:\n\n🔍 **Identify**: Style, medium, and technique\n💰 **Estimate**: Market value and pricing\n📝 **Generate**: Professional description\n🏷️ **Suggest**: Categories and tags\n\nThis usually takes 10-30 seconds...`,
      []
    );

    // Simulate AI analysis (in real implementation, this would call your upload API)
    setTimeout(() => {
      completeAnalysis();
    }, 3000);
  };

  const completeAnalysis = () => {
    setCurrentStep('complete');
    addAssistantMessage(
      "✨ **Analysis Complete!** Here's what I found:\n\n🎨 **Style**: Contemporary Digital Art\n🖌️ **Medium**: Digital painting\n💵 **Suggested Price**: $150-200\n⭐ **Condition**: Excellent\n\nI've created your catalog entry with professional descriptions. What would you like to do next?",
      [
        { label: "Create Marketplace Listing", action: () => handleCreateListing(), variant: 'default' },
        { label: "Edit Details", action: () => handleEditDetails(), variant: 'outline' },
        { label: "Upload Another Artwork", action: () => resetConversation(), variant: 'outline' }
      ]
    );
  };

  const handleCreateListing = () => {
    addUserMessage("Create Marketplace Listing");
    addAssistantMessage(
      "🚀 **Ready to sell!** I'll help you create listings on:\n\n• **Etsy** - Handmade marketplace\n• **Saatchi Art** - Contemporary art platform\n• **Your Website** - Direct sales\n\nWhich platform interests you most?",
      [
        { label: "Show me all options", action: () => openMarketplaceDialog(), variant: 'default' }
      ]
    );
  };

  const handleEditDetails = () => {
    addUserMessage("Edit Details");
    addAssistantMessage(
      "📝 **Edit Mode**: You can adjust:\n\n• Title and description\n• Pricing and dimensions\n• Medium and style tags\n• Artist information\n\nI'll open the editing interface for you.",
      [
        { label: "Open Editor", action: () => openEditDialog(), variant: 'default' }
      ]
    );
  };

  const resetConversation = () => {
    setCurrentStep('greeting');
    setMessages([]);
    addAssistantMessage(
      "🎨 **Ready for another artwork!** Let's catalog your next piece. Same process - I'll guide you through the photography and analysis.",
      [
        { label: "Start Photo Session", action: () => startPhotoSession(), variant: 'default' }
      ]
    );
  };

  const openMarketplaceDialog = () => {
    toast({
      title: "Opening Marketplace Options",
      description: "Marketplace listing dialog will open...",
    });
    // This would trigger the marketplace listing dialog
  };

  const openEditDialog = () => {
    toast({
      title: "Opening Editor",
      description: "Artwork edit dialog will open...",
    });
    // This would trigger the edit dialog
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    addUserMessage(input);
    
    // Simple AI responses based on input
    setTimeout(() => {
      if (input.toLowerCase().includes('help') || input.toLowerCase().includes('how')) {
        addAssistantMessage(
          "I'm here to help! I can guide you through:\n\n📸 **Photography**: Best practices and lighting\n🤖 **AI Analysis**: Automatic artwork identification\n💰 **Pricing**: Market value estimation\n🛒 **Selling**: Marketplace listing creation\n\nWhat specifically would you like help with?",
          [
            { label: "Start Photo Session", action: () => startPhotoSession(), variant: 'default' }
          ]
        );
      } else if (input.toLowerCase().includes('price') || input.toLowerCase().includes('value')) {
        addAssistantMessage(
          "💰 **Pricing Insights**: I analyze your artwork using:\n\n• Similar works sold recently\n• Artist recognition and style\n• Medium and technique complexity\n• Current market trends\n\nTo get an accurate price estimate, I'll need to see your artwork first. Ready to upload?",
          [
            { label: "Upload for Analysis", action: () => startPhotoSession(), variant: 'default' }
          ]
        );
      } else {
        addAssistantMessage(
          "I understand you're interested in artwork cataloging! I can help you photograph, analyze, and list your art for sale. Would you like to start with a photo session?",
          [
            { label: "Yes, let's start", action: () => startPhotoSession(), variant: 'default' }
          ]
        );
      }
    }, 1000);
    
    setInput("");
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Start voice recognition
      toast({
        title: "Voice Input",
        description: "Voice recognition would start here...",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              AI Art Assistant
              <Badge variant="outline" className="ml-auto">
                {currentStep === 'greeting' && 'Ready'}
                {currentStep === 'photo_tips' && 'Guiding'}
                {currentStep === 'uploading' && 'Ready to Upload'}
                {currentStep === 'analyzing' && 'Analyzing...'}
                {currentStep === 'complete' && 'Complete'}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <Card className={message.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'}>
                    <CardContent className="p-3">
                      <div className="whitespace-pre-line text-sm">
                        {message.content}
                      </div>
                      
                      {message.actions && message.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {message.actions.map((action, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant={action.variant || 'default'}
                              onClick={action.action}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <div className="text-xs text-muted-foreground mt-1 px-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message or question..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={toggleVoiceInput}
                className={isListening ? 'bg-red-50 text-red-600' : ''}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button onClick={handleSendMessage} disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </>
  );
}