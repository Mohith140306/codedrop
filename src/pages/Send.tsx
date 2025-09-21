import React, { useState } from 'react';
import { FileText, Upload, Shield, Zap } from 'lucide-react';
import { HybridUploadZone } from '@/components/HybridUploadZone';
import { CodeShareDialog } from '@/components/CodeShareDialog';
import { MobileSendView } from '@/components/MobileSendView';
import { P2PShareDialog } from '@/components/P2PShareDialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { FileTransferManager } from '@/utils/fileTransfer';

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
  const [showP2PShare, setShowP2PShare] = useState(false);
  const [p2pShareFile, setP2pShareFile] = useState<File | null>(null);
  const fileManager = FileTransferManager.getInstance();

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

  const handleP2PShare = (file: File) => {
    setP2pShareFile(file);
    setShowP2PShare(true);
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
            <Zap className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground px-2">
            Share Any Size File
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Small files use cloud storage, large files use direct P2P transfer. No size limits!
          </p>
        </div>

        {/* Upload Section */}
        <Card className="p-4 sm:p-6 lg:p-8 shadow-medium animate-scale-in">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                Hybrid Transfer System
              </h2>
            </div>
            
            <HybridUploadZone onCloudUpload={handleUpload} onP2PShare={handleP2PShare} />
          </div>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">
              ☁️ Cloud Mode (≤100MB)
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Small files are uploaded to secure cloud storage with 4-digit access codes. Perfect for documents, images, and code snippets.
            </p>
          </Card>
          
          <Card className="p-4 sm:p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">
              🚀 P2P Mode (>100MB)
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Large files use direct peer-to-peer transfer with end-to-end encryption. No size limits - share movies, games, or any large content!
            </p>
          </Card>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">
              🔒 End-to-End Security
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              All transfers use AES encryption. P2P transfers are encrypted during transit, cloud files are secured with access codes.
            </p>
          </Card>
          
          <Card className="p-4 sm:p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">
              🔄 Smart Fallback
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              If P2P connection fails due to network restrictions, files automatically fallback to temporary cloud storage with 24h auto-delete.
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

        {/* P2P Share Dialog */}
        <P2PShareDialog
          isOpen={showP2PShare}
          onClose={() => {
            setShowP2PShare(false);
            setP2pShareFile(null);
          }}
          file={p2pShareFile}
          onFallbackToCloud={() => {
            setShowP2PShare(false);
            if (p2pShareFile) {
              handleUpload({
                type: 'file',
                content: p2pShareFile,
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