import React, { useState, useEffect } from 'react';
import { Eye, Download, Copy, FileText, Key, Wifi, Cloud, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { P2PReceiveDialog } from '@/components/P2PReceiveDialog';

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
  const [showP2PReceive, setShowP2PReceive] = useState(false);
  const [roomCodeFromUrl, setRoomCodeFromUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Check if there's a room code in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      setRoomCodeFromUrl(roomParam);
      setShowP2PReceive(true);
    }
    
    // Check for access code in URL
    const codeParam = urlParams.get('code');
    if (codeParam) {
      setAccessCode(codeParam);
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
        <div className="text-center space-y-4 sm:space-y-6 animate-fade-in">
          <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 mx-auto gradient-elegant rounded-2xl flex items-center justify-center shadow-elegant">
            <Zap className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground px-2">
            Receive Any Size File
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground px-4 font-light">
            Use access codes for cloud files or room codes for direct P2P transfers.
          </p>
        </div>

        {/* Access Form */}
        <Card className="p-6 sm:p-8 lg:p-10 shadow-elegant animate-scale-in glass-card border border-border/30">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Key className="w-6 h-6 sm:w-7 sm:h-7 text-elegant" />
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
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
                  className="transition-elegant font-mono text-center tracking-widest text-lg sm:text-xl py-4 sm:py-5 border-2 border-border/30 focus:border-accent shadow-elegant"
                  maxLength={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={() => setShowP2PReceive(true)}
                  variant="accent"
                  size="xl"
                  className="w-full transition-elegant hover-lift text-base md:text-lg py-4 md:py-6"
                >
                  <Wifi className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">P2P Receive</span>
                  <span className="sm:hidden">P2P</span>
                </Button>
                
                <Button
                  onClick={handleAccess}
                  variant="elegant"
                  size="xl"
                  disabled={isLoading}
                  className="w-full transition-elegant hover-lift py-4 sm:py-6 text-base sm:text-lg"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <Card className="p-6 sm:p-8 shadow-elegant animate-fade-in glass-card hover-lift transition-elegant" style={{ animationDelay: '0.2s' }}>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto gradient-primary rounded-xl flex items-center justify-center shadow-elegant">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Cloud Access (4-digit code)
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed font-light">
                Access small files (≤100MB) stored in secure cloud storage using 4-digit access codes. Files may have expiration dates.
              </p>
            </div>
          </Card>
          
          <Card className="p-6 sm:p-8 shadow-elegant animate-fade-in glass-card hover-lift transition-elegant" style={{ animationDelay: '0.3s' }}>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto gradient-accent rounded-xl flex items-center justify-center shadow-elegant">
                <Wifi className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                P2P Receive (4-digit room)
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed font-light">
                Receive large files directly from the sender using a 4-digit room code or QR scan. No size limits, encrypted transfer.
              </p>
            </div>
          </Card>
        </div>

        {/* P2P Receive Dialog */}
        <P2PReceiveDialog
          isOpen={showP2PReceive}
          onClose={() => {
            setShowP2PReceive(false);
            setRoomCodeFromUrl('');
          }}
          initialRoomCode={roomCodeFromUrl}
        />
      </div>
    </div>
  );
};

export default Get;