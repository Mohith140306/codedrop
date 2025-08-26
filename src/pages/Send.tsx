import React, { useState } from 'react';
import { FileText, Upload, Shield } from 'lucide-react';
import { UploadZone } from '@/components/UploadZone';
import { CodeShareDialog } from '@/components/CodeShareDialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StoredContent {
  type: 'file' | 'code';
  content: string;
  filename?: string;
  language?: string;
  expiration: string;
  createdAt: string;
  code: string;
}

const Send = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [showCodeDialog, setShowCodeDialog] = useState(false);

  const generateUniqueCode = (): string => {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleUpload = async (data: {
    type: 'file' | 'code';
    content: string | File;
    expiration: string;
    filename?: string;
    language?: string;
  }) => {
    setIsUploading(true);
    const uniqueCode = generateUniqueCode();

    try {
      // Calculate expiration date
      const expiresAt = new Date();
      if (data.expiration === '1h') {
        expiresAt.setHours(expiresAt.getHours() + 1);
      } else if (data.expiration === '24h') {
        expiresAt.setHours(expiresAt.getHours() + 24);
      } else if (data.expiration === '7d') {
        expiresAt.setDate(expiresAt.getDate() + 7);
      } else if (data.expiration === '30d') {
        expiresAt.setDate(expiresAt.getDate() + 30);
      } else {
        // "never" - set to 100 years from now
        expiresAt.setFullYear(expiresAt.getFullYear() + 100);
      }

      if (data.type === 'file' && data.content instanceof File) {
        // Upload file to Supabase Storage
        const fileExt = data.content.name.split('.').pop();
        const fileName = `${uniqueCode}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('shared-files')
          .upload(fileName, data.content);

        if (uploadError) {
          throw uploadError;
        }

        // Store metadata in database
        const { error: dbError } = await supabase
          .from('shared_content')
          .insert({
            access_code: uniqueCode,
            content_type: 'file',
            file_path: fileName,
            filename: data.content.name,
            expires_at: expiresAt.toISOString(),
          });

        if (dbError) {
          throw dbError;
        }
      } else {
        // Store code content in database
        const { error: dbError } = await supabase
          .from('shared_content')
          .insert({
            access_code: uniqueCode,
            content_type: 'code',
            content_text: data.content as string,
            filename: data.filename,
            language: data.language,
            expires_at: expiresAt.toISOString(),
          });

        if (dbError) {
          throw dbError;
        }
      }

      setGeneratedCode(uniqueCode);
      setShowCodeDialog(true);
      toast({
        title: "Content Shared Successfully",
        description: `Your content has been secured with access code: ${uniqueCode}`,
      });
    } catch (error) {
      console.error('Error uploading content:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error sharing your content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 mx-auto gradient-primary rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Share Your Content
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload files or paste code snippets to share them securely with a unique access code.
          </p>
        </div>

        {/* Upload Section */}
        <Card className="p-8 shadow-medium animate-scale-in">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                Upload & Secure
              </h2>
            </div>
            
            <UploadZone onUpload={handleUpload} />
          </div>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-lg font-semibold text-foreground mb-3">
              🔒 Secure by Design
            </h3>
            <p className="text-muted-foreground">
              All content is secured with unique access codes and stored safely. Only those with the correct code can access your shared content.
            </p>
          </Card>
          
          <Card className="p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-semibold text-foreground mb-3">
              ⏰ Automatic Expiration
            </h3>
            <p className="text-muted-foreground">
              Set expiration times for your content. Files automatically delete after the specified time period for enhanced security.
            </p>
          </Card>
        </div>

        {/* Code Share Dialog */}
        {generatedCode && (
          <CodeShareDialog
            isOpen={showCodeDialog}
            onClose={() => {
              setShowCodeDialog(false);
              setGeneratedCode(null);
            }}
            code={generatedCode}
          />
        )}
      </div>
    </div>
  );
};

export default Send;