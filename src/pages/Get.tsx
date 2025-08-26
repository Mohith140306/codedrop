import React, { useState } from 'react';
import { Eye, Download, Copy, FileText, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const { toast } = useToast();

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
      // Query the database for the content
      const { data, error } = await supabase
        .from('shared_content')
        .select('*')
        .eq('access_code', accessCode.toUpperCase())
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        toast({
          title: "Invalid Access Code",
          description: "No content found with that access code.",
          variant: "destructive",
        });
        return;
      }

      // Check if content has expired
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (now > expiresAt) {
        toast({
          title: "Content Expired",
          description: "This content has expired and is no longer available.",
          variant: "destructive",
        });
        return;
      }

      let content: string;
      
      if (data.content_type === 'file') {
        // Download file from Supabase Storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('shared-files')
          .download(data.file_path!);

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
        content = data.content_text!;
      }

      const accessedContent: AccessedContent = {
        type: data.content_type as 'file' | 'code',
        content,
        filename: data.filename || undefined,
        language: data.language || undefined,
        access_code: data.access_code,
        file_path: data.file_path || undefined,
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
      <div className="min-h-screen gradient-subtle py-8">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {/* Header */}
          <Card className="p-6 shadow-medium animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-accent rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    {accessedContent.type === 'file' ? accessedContent.filename : 'Code Snippet'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {accessedContent.language && `Language: ${accessedContent.language}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {accessedContent.type === 'code' && (
                  <Button onClick={handleCopyCode} variant="outline" size="sm" className="hover-scale">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                )}
                <Button onClick={handleDownload} variant="outline" size="sm" className="hover-scale">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={handleNewAccess} variant="default" size="sm" className="hover-scale">
                  Access New Content
                </Button>
              </div>
            </div>
          </Card>

          {/* Content */}
          <Card className="p-6 shadow-medium animate-scale-in">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Content</h2>
              </div>
              
              {accessedContent.type === 'file' && accessedContent.content.startsWith('data:image') ? (
                <img 
                  src={accessedContent.content} 
                  alt={accessedContent.filename}
                  className="max-w-full h-auto rounded-lg shadow-soft"
                />
              ) : (
                <div className="bg-muted rounded-lg p-4 shadow-soft">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-foreground overflow-x-auto">
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
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 mx-auto gradient-primary rounded-full flex items-center justify-center">
            <Eye className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Access Content
          </h1>
          <p className="text-lg text-muted-foreground">
            Enter the access code to view shared files or code.
          </p>
        </div>

        {/* Access Form */}
        <Card className="p-8 shadow-medium animate-scale-in">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Key className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
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
                  className="transition-smooth font-mono text-center tracking-widest"
                  maxLength={4}
                />
              </div>
              
              <Button
                onClick={handleAccess}
                variant="default"
                size="lg"
                disabled={isLoading}
                className="w-full gradient-primary hover:shadow-medium transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Accessing...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Access Content
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Info Section */}
        <Card className="p-6 shadow-soft animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              🔐 Secure Access
            </h3>
            <p className="text-sm text-muted-foreground">
              Content is secured with unique access codes and may have expiration dates. Make sure you have the correct code from the sender.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Get;