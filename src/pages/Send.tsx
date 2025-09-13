import React, { useState } from 'react';
import { FileText, Upload, Shield } from 'lucide-react';
import { UploadZone } from '@/components/UploadZone';
import { CodeShareDialog } from '@/components/CodeShareDialog';
import { MobileSendView } from '@/components/MobileSendView';
import { LocalShareDialog } from '@/components/LocalShareDialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [showLocalShare, setShowLocalShare] = useState(false);
  const [localShareFile, setLocalShareFile] = useState<File | null>(null);

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
    setUploadProgress(0);
    const uniqueCode = generateUniqueCode();

    // Simulate upload progress for demo
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 20;
      });
    }, 100);

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

      // Complete progress and show success
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setGeneratedCode(uniqueCode);
        setShowCodeDialog(true);
        
        toast({
          title: "Content Shared Successfully",
          description: `Your content has been secured with access code: ${uniqueCode}`,
        });
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Error uploading content:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error sharing your content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleLocalShare = (file: File) => {
    setLocalShareFile(file);
    setShowLocalShare(true);
  };

  // Mobile view
  if (isMobile) {
    return (
      <>
        <MobileSendView
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onUpload={handleUpload}
        />
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
      </>
    );
  }

  // Desktop view (unchanged)
  return (
    <div className="min-h-screen bg-background py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 animate-fade-in">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto gradient-primary rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground px-2">
            Share Your Content
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Upload files or paste code snippets to share them securely with a unique access code.
          </p>
        </div>

        {/* Upload Section */}
        <Card className="p-4 sm:p-6 lg:p-8 shadow-medium animate-scale-in">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                Upload & Secure
              </h2>
            </div>
            
            <UploadZone onUpload={handleUpload} onLocalShare={handleLocalShare} />
          </div>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">
              🔒 Secure by Design
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              All content is secured with unique access codes and stored safely. Only those with the correct code can access your shared content.
            </p>
          </Card>
          
          <Card className="p-4 sm:p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">
              ⏰ Automatic Expiration
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
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

        {/* Local Share Dialog */}
        <LocalShareDialog
          isOpen={showLocalShare}
          onClose={() => {
            setShowLocalShare(false);
            setLocalShareFile(null);
          }}
          file={localShareFile}
          onFallbackToCloud={() => {
            setShowLocalShare(false);
            if (localShareFile) {
              handleUpload({
                type: 'file',
                content: localShareFile,
                expiration: '24h'
              });
            }
          }}
        />
      </div>
    </div>
  );
};

export default Send;