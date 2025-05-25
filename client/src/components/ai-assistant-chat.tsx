import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Camera, Upload, Send, Mic, MicOff, Image, X, Trash2, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [currentStep, setCurrentStep] = useState<'greeting' | 'photo_tips' | 'uploading' | 'analyzing' | 'complete'>('greeting');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const queryClient = useQueryClient();

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

  const speakText = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    // Clean text for speech (remove markdown and emojis)
    const cleanText = text
      .replace(/[#*`]/g, '') // Remove markdown
      .replace(/[🎨🖌️💵⭐🎉🔍💰📸✨❌🚀📝🏷️👋💡✅❌📐🎯]/g, '') // Remove emojis
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\n\n/g, '. ') // Replace double newlines with periods
      .replace(/\n•/g, '. ') // Replace bullet points
      .replace(/\n/g, ' ') // Replace single newlines with spaces
      .replace(/:/g, '.') // Replace colons with periods for natural breaks
      .substring(0, 150); // Shorter for quicker responses
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Wait for voices to load and select a more natural one
    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Natural') || 
        voice.name.includes('Enhanced') ||
        voice.name.includes('Premium') ||
        (voice.lang.startsWith('en') && voice.localService === false)
      ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.rate = 1.1; // Slightly faster for more natural feel
      utterance.pitch = 1.1; // Slightly higher pitch
      utterance.volume = 0.9;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    };

    // Check if voices are loaded
    if (window.speechSynthesis.getVoices().length > 0) {
      setVoiceAndSpeak();
    } else {
      // Wait for voices to load
      window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
    }
  };

  const addAssistantMessage = (content: string, actions?: Array<{label: string; action: () => void; variant?: 'default' | 'outline'}>) => {
    const message: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      actions
    };
    setMessages(prev => [...prev, message]);
    
    // Speak the message after a short delay
    setTimeout(() => speakText(content), 500);
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
    // For mobile devices, this will open the camera directly
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,image/heic,image/heif'; // Support iPhone HEIC format
    input.setAttribute('capture', 'environment'); // Use back camera
    input.multiple = true; // Allow multiple photos
    input.style.display = 'none';
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        addUserMessage(`Took ${target.files.length} photo${target.files.length > 1 ? 's' : ''} with camera`);
        processFiles(Array.from(target.files));
      }
      // Clean up
      document.body.removeChild(input);
    };
    
    // Add to DOM temporarily for mobile compatibility
    document.body.appendChild(input);
    input.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files));
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      // Use fetch directly for better error handling
      const response = await fetch("/api/artworks/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/artworks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/artworks/recent"] });
      
      addAssistantMessage(
        `Analysis Complete! Here's what I found: ${data.title || 'New Artwork'}, ${data.medium || 'Mixed Medium'}, Suggested Price: $${data.suggestedPrice || '150'}. Your catalog entry is ready!`,
        [
          { label: "Create Marketplace Listing", action: () => handleCreateListing(), variant: 'default' },
          { label: "Edit Details", action: () => handleEditDetails(), variant: 'outline' },
          { label: "Upload Another Artwork", action: () => resetConversation(), variant: 'outline' }
        ]
      );
      setCurrentStep('complete');
      setUploadedFiles([]); // Clear uploaded files after successful upload
    },
    onError: (error: any) => {
      addAssistantMessage(
        `Upload Failed: ${error.message}. Please try again with a different image or check your connection.`,
        [
          { label: "Try Again", action: () => setCurrentStep('uploading'), variant: 'default' }
        ]
      );
    }
  });

  const processFiles = (files: File[]) => {
    setUploadedFiles(files);
    setCurrentStep('analyzing');
    addUserMessage(`Selected ${files.length} photo${files.length > 1 ? 's' : ''}`);
    
    addAssistantMessage(
      `🎉 Perfect! I can see your ${files.length} photo${files.length > 1 ? 's' : ''}. Ready to upload and analyze?`,
      [
        { label: "Upload & Analyze", action: () => startUpload(), variant: 'default' },
        { label: "Remove Photos", action: () => clearFiles(), variant: 'outline' }
      ]
    );
  };

  const startUpload = () => {
    if (uploadedFiles.length > 0) {
      addAssistantMessage(
        `🚀 **Uploading and analyzing** your artwork...\n\n🔍 **AI Analysis includes**:\n• Style and medium identification\n• Market value estimation\n• Professional description generation\n• Category and tag suggestions\n\nThis usually takes 10-30 seconds...`,
        []
      );
      
      // Upload the first file (main artwork photo)
      uploadMutation.mutate(uploadedFiles[0]);
    }
  };

  const clearFiles = () => {
    setUploadedFiles([]);
    setCurrentStep('uploading');
    addAssistantMessage(
      "📸 **Photos cleared!** Ready to take new photos of your artwork.",
      [
        { label: "Upload Photos", action: () => triggerFileUpload(), variant: 'default' },
        { label: "Use Camera", action: () => triggerCameraCapture(), variant: 'outline' }
      ]
    );
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
    
    // Stop current speech when user sends message
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    
    addUserMessage(input);
    
    // Process user input immediately
    const userInput = input.toLowerCase();
    
    if (userInput.includes('start') || userInput.includes('yes') || userInput.includes('go') || userInput.includes('begin') || userInput.includes('photo') || userInput.includes('camera') || userInput.includes('upload')) {
      startPhotoSession();
    } else if (userInput.includes('stop') || userInput.includes('quiet') || userInput.includes('mute')) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      addAssistantMessage("Voice disabled. Use the speaker button to turn me back on.");
      setVoiceEnabled(false);
    } else if (userInput.includes('help') || userInput.includes('how')) {
      addAssistantMessage(
        "I can guide you through photography and artwork analysis. Say 'start' to begin!",
        [
          { label: "Start Photo Session", action: () => startPhotoSession(), variant: 'default' }
        ]
      );
    } else {
      addAssistantMessage(
        "Ready to catalog your artwork! Say 'start' or click the button below.",
        [
          { label: "Start Photo Session", action: () => startPhotoSession(), variant: 'default' }
        ]
      );
    }
    
    setInput("");
  };

  const initSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice input. Please type your message.",
        variant: "destructive",
      });
      return false;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Speak now, I'm listening!",
      });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      
      // Auto-submit the voice input immediately
      setTimeout(() => {
        if (transcript.trim()) {
          // Stop current speech when user speaks
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
          
          addUserMessage(transcript);
          
          // Process the voice command
          const userInput = transcript.toLowerCase();
          
          if (userInput.includes('help') || userInput.includes('how')) {
            addAssistantMessage(
              "I'm here to help! I can guide you through photography, AI analysis, pricing, and selling. What specifically would you like help with?",
              [
                { label: "Start Photo Session", action: () => startPhotoSession(), variant: 'default' }
              ]
            );
          } else if (userInput.includes('price') || userInput.includes('value')) {
            addAssistantMessage(
              "I analyze your artwork using similar sales, artist recognition, and market trends. To get an accurate price estimate, I'll need to see your artwork first. Ready to upload?",
              [
                { label: "Upload for Analysis", action: () => startPhotoSession(), variant: 'default' }
              ]
            );
          } else if (userInput.includes('photo') || userInput.includes('camera') || userInput.includes('upload')) {
            startPhotoSession();
          } else if (userInput.includes('start') || userInput.includes('yes') || userInput.includes('go') || userInput.includes('begin')) {
            startPhotoSession();
          } else if (userInput.includes('stop') || userInput.includes('quiet') || userInput.includes('mute')) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            addAssistantMessage("Got it, I'll be quiet now! You can still use the voice toggle button to turn me back on.", []);
            setVoiceEnabled(false);
          } else {
            addAssistantMessage(
              "I understand you're interested in artwork cataloging! I can help you photograph, analyze, and list your art for sale. Would you like to start with a photo session?",
              [
                { label: "Yes, let's start", action: () => startPhotoSession(), variant: 'default' }
              ]
            );
          }
          
          setInput(""); // Clear the input
        }
      }, 500);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      toast({
        title: "Voice Error",
        description: "Couldn't understand. Please try again or type your message.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    return true;
  };

  const toggleVoiceInput = () => {
    if (!isListening) {
      if (initSpeechRecognition()) {
        recognitionRef.current?.start();
      }
    } else {
      recognitionRef.current?.stop();
      setIsListening(false);
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
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                    setVoiceEnabled(!voiceEnabled);
                    if (!voiceEnabled) {
                      toast({
                        title: "Voice Output Enabled",
                        description: "I'll speak my responses now!",
                      });
                    }
                  }}
                  className="h-8 w-8 p-0"
                  title={voiceEnabled ? "Click to mute voice" : "Click to enable voice"}
                >
                  {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                <Badge variant="outline" className={isSpeaking ? "bg-green-50 text-green-700" : ""}>
                  {isSpeaking && 'Speaking...'}
                  {!isSpeaking && currentStep === 'greeting' && 'Ready'}
                  {!isSpeaking && currentStep === 'photo_tips' && 'Guiding'}
                  {!isSpeaking && currentStep === 'uploading' && 'Ready to Upload'}
                  {!isSpeaking && currentStep === 'analyzing' && 'Analyzing...'}
                  {!isSpeaking && currentStep === 'complete' && 'Complete'}
                </Badge>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 p-4">
            {/* Show uploaded files preview */}
            {uploadedFiles.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Selected Photos ({uploadedFiles.length})</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearFiles}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative aspect-square bg-gray-100 rounded">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 rounded-full"
                        onClick={() => {
                          const newFiles = uploadedFiles.filter((_, i) => i !== index);
                          setUploadedFiles(newFiles);
                          if (newFiles.length === 0) {
                            setCurrentStep('uploading');
                          }
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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