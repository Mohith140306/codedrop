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
        <div className="text-center space-y-4 sm:space-y-6 animate-fade-in">
          <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 mx-auto gradient-elegant rounded-2xl flex items-center justify-center shadow-elegant">
            <Zap className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground px-2">
            Share Any Size File
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4 font-light">
            Small files use cloud storage, large files use direct P2P transfer. No size limits!
          </p>
        </div>

        {/* Upload Section */}
        <Card className="p-6 sm:p-8 lg:p-10 shadow-elegant animate-scale-in glass-card border border-border/30">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-elegant" />
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                Hybrid Transfer System
              </h2>
            </div>
            
            <HybridUploadZone onCloudUpload={handleUpload} onP2PShare={handleP2PShare} />
          </div>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <Card className="p-6 sm:p-8 shadow-elegant hover:shadow-strong transition-elegant hover-lift animate-fade-in glass-card" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
              ☁️ Cloud Mode (≤100MB)
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-light">
              Small files are uploaded to secure cloud storage with 4-digit access codes. Perfect for documents, images, and code snippets.
            </p>
          </Card>
          
          <Card className="p-6 sm:p-8 shadow-elegant hover:shadow-strong transition-elegant hover-lift animate-fade-in glass-card" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
              🚀 P2P Mode ({'>'} 100MB)
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-light">
              Large files use direct peer-to-peer transfer with end-to-end encryption. No size limits - share movies, games, or any large content!
            </p>
          </Card>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <Card className="p-6 sm:p-8 shadow-elegant hover:shadow-strong transition-elegant hover-lift animate-fade-in glass-card" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
              🔒 End-to-End Security
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-light">
              All transfers use AES encryption. P2P transfers are encrypted during transit, cloud files are secured with access codes.
            </p>
          </Card>
          
          <Card className="p-6 sm:p-8 shadow-elegant hover:shadow-strong transition-elegant hover-lift animate-fade-in glass-card" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
              🔄 Smart Fallback
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-light">
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