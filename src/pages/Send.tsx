import React, { useState } from 'react';
import { FileText, Upload, Shield } from 'lucide-react';
import { UploadZone } from '@/components/UploadZone';
import { CodeShareDialog } from '@/components/CodeShareDialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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

  const handleUpload = (data: {
    type: 'file' | 'code';
    content: string | File;
    expiration: string;
    filename?: string;
    language?: string;
  }) => {
    setIsUploading(true);
    const uniqueCode = generateUniqueCode();
    
    // Convert file to base64 string for storage
    if (data.type === 'file' && data.content instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        const storedContent: StoredContent = {
          type: data.type,
          content: reader.result as string,
          filename: data.filename,
          language: data.language,
          expiration: data.expiration,
          createdAt: new Date().toISOString(),
          code: uniqueCode,
        };
        
        // Store in localStorage (in real app, this would be server-side)
        localStorage.setItem(`secure_content_${uniqueCode}`, JSON.stringify(storedContent));
        
        setGeneratedCode(uniqueCode);
        setShowCodeDialog(true);
        setIsUploading(false);
      };
      reader.readAsDataURL(data.content);
    } else {
      const storedContent: StoredContent = {
        type: data.type,
        content: data.content as string,
        filename: data.filename,
        language: data.language,
        expiration: data.expiration,
        createdAt: new Date().toISOString(),
        code: uniqueCode,
      };
      
      localStorage.setItem(`secure_content_${uniqueCode}`, JSON.stringify(storedContent));
      
      setGeneratedCode(uniqueCode);
      setShowCodeDialog(true);
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