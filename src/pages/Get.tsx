import React, { useState, useEffect } from 'react';
import { Eye, Download, Copy, FileText, Key, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LocalReceiveDialog } from '@/components/LocalReceiveDialog';

interface AccessedContent {
  type: 'file' | 'code';
  content: string;
  filename?: string;
  language?: string;
  access_code: string;
  file_path?: string;
}

const Get = () => {
  const [accessCode, setAccessCode] = useState('');
  const [accessedContent, setAccessedContent] = useState<AccessedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLocalReceive, setShowLocalReceive] = useState(false);
  const [roomCodeFromUrl, setRoomCodeFromUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Check if there's a room code in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      setRoomCodeFromUrl(roomParam);
      setShowLocalReceive(true);
    }
  }, []);

  const handleAccess = async () => {
    if (!accessCode || accessCode.length !== 4) {
      toast({
        title: "Invalid Access Code",
        description: "Please enter a valid 4-character access code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Use secure function to access content by access code
      const { data, error } = await supabase
        .rpc('get_shared_content_by_access_code', {
          p_access_code: accessCode.toUpperCase()
        });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        toast({
          title: "Invalid Access Code",
          description: "No content found with that access code or content has expired.",
          variant: "destructive",
        });
        return;
      }

      // Get the first (and only) result from the RPC function
      const contentRecord = data[0];

      // Check if content has expired (already handled by the function, but keeping for safety)
      const now = new Date();
      const expiresAt = new Date(contentRecord.expires_at);
      
      if (now > expiresAt) {
        toast({
          title: "Content Expired",
          description: "This content has expired and is no longer available.",
          variant: "destructive",
        });
        return;
      }

      let content: string;
      
      if (contentRecord.content_type === 'file') {
        // Download file from Supabase Storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('shared-files')
          .download(contentRecord.file_path!);

        if (downloadError) {
          throw downloadError;
        }

        // Convert blob to data URL for display
        const reader = new FileReader();
        content = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(fileData);
        });
      } else {
        content = contentRecord.content_text!;
      }

      const accessedContent: AccessedContent = {
        type: contentRecord.content_type as 'file' | 'code',
        content,
        filename: contentRecord.filename || undefined,
        language: contentRecord.language || undefined,
        access_code: contentRecord.access_code,
        file_path: contentRecord.file_path || undefined,
      };

      setAccessedContent(accessedContent);
      toast({
        title: "Content Accessed!",
        description: "You now have access to the secured content.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error accessing content:', error);
      toast({
        title: "Access Failed",
        description: "Something went wrong while accessing the content.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!accessedContent) return;

    try {
      if (accessedContent.type === 'file') {
        if (accessedContent.content.startsWith('data:')) {
          // Handle data URL download
          const element = document.createElement('a');
          element.href = accessedContent.content;
          element.download = accessedContent.filename || 'downloaded-file';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        } else if (accessedContent.file_path) {
          // Download directly from Supabase Storage
          const { data, error } = await supabase.storage
            .from('shared-files')
            .download(accessedContent.file_path);

          if (error) {
            throw error;
          }

          const url = URL.createObjectURL(data);
          const element = document.createElement('a');
          element.href = url;
          element.download = accessedContent.filename || 'downloaded-file';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
          URL.revokeObjectURL(url);
        }
      } else {
        // Handle code download
        const element = document.createElement('a');
        const file = new Blob([accessedContent.content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `code.${accessedContent.language || 'txt'}`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        URL.revokeObjectURL(element.href);
      }

      toast({
        title: "Download Started",
        description: "Your file is being downloaded.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the file.",
        variant: "destructive",
      });
    }
  };

  const handleCopyCode = async () => {
    if (!accessedContent || accessedContent.type !== 'code') return;

    try {
      await navigator.clipboard.writeText(accessedContent.content);
      toast({
        title: "Code Copied!",
        description: "The code has been copied to your clipboard.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy the code to your clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleNewAccess = () => {
    setAccessedContent(null);
    setAccessCode('');
  };

  if (accessedContent) {
    return (
      <div className="min-h-screen gradient-subtle py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 space-y-4 sm:space-y-6">
          {/* Header */}
          <Card className="p-4 sm:p-6 shadow-medium animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 gradient-accent rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                    {accessedContent.type === 'file' ? accessedContent.filename : 'Code Snippet'}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {accessedContent.language && `Language: ${accessedContent.language}`}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {accessedContent.type === 'code' && (
                  <Button onClick={handleCopyCode} variant="outline" size="sm" className="hover-scale text-xs sm:text-sm">
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Copy
                  </Button>
                )}
                <Button onClick={handleDownload} variant="outline" size="sm" className="hover-scale text-xs sm:text-sm">
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Download
                </Button>
                <Button onClick={handleNewAccess} variant="default" size="sm" className="hover-scale text-xs sm:text-sm">
                  <span className="hidden sm:inline">Access New Content</span>
                  <span className="sm:hidden">New Access</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Content */}
          <Card className="p-4 sm:p-6 shadow-medium animate-scale-in">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Content</h2>
              </div>
              
              {accessedContent.type === 'file' && accessedContent.content.startsWith('data:image') ? (
                <img 
                  src={accessedContent.content} 
                  alt={accessedContent.filename}
                  className="max-w-full h-auto rounded-lg shadow-soft"
                />
              ) : (
                <div className="bg-muted rounded-lg p-3 sm:p-4 shadow-soft">
                  <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-foreground overflow-x-auto">
                    {accessedContent.content}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 animate-fade-in">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto gradient-primary rounded-full flex items-center justify-center">
            <Eye className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground px-2">
            Access Content
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground px-4">
            Enter the access code to view shared files or code.
          </p>
        </div>

        {/* Access Form */}
        <Card className="p-4 sm:p-6 lg:p-8 shadow-medium animate-scale-in">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Key className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                Enter Access Code
              </h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessCode" className="text-sm font-medium">
                  Access Code
                </Label>
                <Input
                  id="accessCode"
                  type="text"
                  placeholder="Enter 4-character access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleAccess()}
                  className="transition-smooth font-mono text-center tracking-widest text-base sm:text-lg py-3 sm:py-4"
                  maxLength={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={() => setShowLocalReceive(true)}
                  variant="outline"
                  size="lg"
                  className="w-full transition-all duration-200 hover:scale-105 hover:shadow-lg text-sm md:text-base py-3 md:py-6"
                >
                  <Wifi className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Local Receive</span>
                  <span className="sm:hidden">Local</span>
                </Button>
                
                <Button
                  onClick={handleAccess}
                  variant="default"
                  size="lg"
                  disabled={isLoading}
                  className="w-full gradient-primary hover:shadow-medium transition-all duration-300 py-3 sm:py-4 text-sm sm:text-base"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Accessing...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Cloud Access</span>
                      <span className="sm:hidden">Cloud</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 sm:p-6 shadow-soft animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="text-center space-y-2">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                🔐 Cloud Access
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Access files uploaded to the cloud using secure access codes. Content may have expiration dates.
              </p>
            </div>
          </Card>
          
          <Card className="p-4 sm:p-6 shadow-soft animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="text-center space-y-2">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                📡 Local Receive
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Receive files directly from someone on the same WiFi network using a room code or QR scan.
              </p>
            </div>
          </Card>
        </div>

        {/* Local Receive Dialog */}
        <LocalReceiveDialog
          isOpen={showLocalReceive}
          onClose={() => {
            setShowLocalReceive(false);
            setRoomCodeFromUrl('');
          }}
          initialRoomCode={roomCodeFromUrl}
        />
      </div>
    </div>
  );
};

export default Get;