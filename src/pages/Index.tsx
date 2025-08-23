import React, { useState } from 'react';
import { Shield, Lock, FileText, Code, Zap } from 'lucide-react';
import { UploadZone } from '@/components/UploadZone';
import { ShareResult } from '@/components/ShareResult';
import heroImage from '@/assets/hero-security.jpg';

const Index = () => {
  const [shareResult, setShareResult] = useState<{
    shareId: string;
    type: 'file' | 'code';
    filename?: string;
    language?: string;
    expiration: string;
  } | null>(null);

  const handleUpload = (data: {
    type: 'file' | 'code';
    content: string | File;
    password: string;
    expiration: string;
    filename?: string;
    language?: string;
  }) => {
    // In a real app, this would upload to server and return actual share ID
    const shareId = Math.random().toString(36).substring(7);
    
    setShareResult({
      shareId,
      type: data.type,
      filename: data.filename,
      language: data.language,
      expiration: data.expiration,
    });
  };

  const handleNewShare = () => {
    setShareResult(null);
  };

  if (shareResult) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
        <ShareResult
          shareId={shareResult.shareId}
          type={shareResult.type}
          filename={shareResult.filename}
          language={shareResult.language}
          expiration={shareResult.expiration}
          onNewShare={handleNewShare}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-subtle">
        <div className="absolute inset-0 opacity-10">
          <img
            src={heroImage}
            alt="Secure sharing platform"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4" />
              End-to-End Security
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Share Files & Code
              <br />
              <span className="gradient-primary bg-clip-text text-transparent">
                Securely
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Password-protected sharing for your sensitive files and code snippets. 
              No accounts required, just secure sharing in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto gradient-primary rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Password Protected</h3>
              <p className="text-muted-foreground">
                Every share requires a password. Your content stays private and secure.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto gradient-accent rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Files & Code</h3>
              <p className="text-muted-foreground">
                Share any file type or code snippets with syntax highlighting support.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-success rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No Registration</h3>
              <p className="text-muted-foreground">
                Start sharing immediately. No accounts, no hassle, just secure sharing.
              </p>
            </div>
          </div>
          
          {/* Upload Zone */}
          <UploadZone onUpload={handleUpload} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Built with security in mind. Your privacy is our priority.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
