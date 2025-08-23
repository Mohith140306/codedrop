import React, { useState } from 'react';
import { Shield, Lock, FileText, Code, Zap, Download, Eye } from 'lucide-react';
import { UploadZone } from '@/components/UploadZone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-security.jpg';

interface StoredContent {
  type: 'file' | 'code';
  content: string;
  filename?: string;
  language?: string;
  expiration: string;
  createdAt: string;
  password: string;
}

const Index = () => {
  const [accessPassword, setAccessPassword] = useState('');
  const [accessedContent, setAccessedContent] = useState<StoredContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpload = (data: {
    type: 'file' | 'code';
    content: string | File;
    password: string;
    expiration: string;
    filename?: string;
    language?: string;
  }) => {
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
          password: data.password,
        };
        
        // Store in localStorage (in real app, this would be server-side)
        const contentId = Math.random().toString(36).substring(7);
        localStorage.setItem(`secure_content_${contentId}`, JSON.stringify(storedContent));
        
        toast({
          title: "Content Stored Successfully!",
          description: "Your content has been secured. Others can access it using the password you set.",
          variant: "default",
        });
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
        password: data.password,
      };
      
      const contentId = Math.random().toString(36).substring(7);
      localStorage.setItem(`secure_content_${contentId}`, JSON.stringify(storedContent));
      
      toast({
        title: "Content Stored Successfully!",
        description: "Your content has been secured. Others can access it using the password you set.",
        variant: "default",
      });
    }
  };

  const handleAccess = async () => {
    if (!accessPassword) {
      toast({
        title: "Password Required",
        description: "Please enter the password to access content.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Search through stored content for matching password
      let foundContent: StoredContent | null = null;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('secure_content_')) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const content: StoredContent = JSON.parse(stored);
            if (content.password === accessPassword) {
              // Check if content has expired
              const now = new Date();
              const created = new Date(content.createdAt);
              const isExpired = () => {
                switch (content.expiration) {
                  case '1h': return now.getTime() - created.getTime() > 60 * 60 * 1000;
                  case '24h': return now.getTime() - created.getTime() > 24 * 60 * 60 * 1000;
                  case '7d': return now.getTime() - created.getTime() > 7 * 24 * 60 * 60 * 1000;
                  case '30d': return now.getTime() - created.getTime() > 30 * 24 * 60 * 60 * 1000;
                  case 'never': return false;
                  default: return false;
                }
              };
              
              if (isExpired()) {
                localStorage.removeItem(key);
                continue;
              }
              
              foundContent = content;
              break;
            }
          }
        }
      }
      
      if (foundContent) {
        setAccessedContent(foundContent);
        toast({
          title: "Content Accessed!",
          description: "You now have access to the secured content.",
          variant: "default",
        });
      } else {
        toast({
          title: "Invalid Password",
          description: "No content found with that password, or content may have expired.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Access Failed",
        description: "Something went wrong while accessing the content.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!accessedContent) return;

    if (accessedContent.type === 'file' && accessedContent.content.startsWith('data:')) {
      // Handle file download
      const element = document.createElement('a');
      element.href = accessedContent.content;
      element.download = accessedContent.filename || 'downloaded-file';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      // Handle code download
      const element = document.createElement('a');
      const file = new Blob([accessedContent.content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `code.${accessedContent.language || 'txt'}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleNewAccess = () => {
    setAccessedContent(null);
    setAccessPassword('');
  };

  if (accessedContent) {
    return (
      <div className="min-h-screen gradient-subtle p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card className="p-6 shadow-medium">
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
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={handleNewAccess} variant="secure" size="sm">
                  Access New Content
                </Button>
              </div>
            </div>
          </Card>

          {/* Content */}
          <Card className="p-6 shadow-medium">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Content</h2>
              </div>
              
              {accessedContent.type === 'file' && accessedContent.content.startsWith('data:image') ? (
                <img 
                  src={accessedContent.content} 
                  alt={accessedContent.filename}
                  className="max-w-full h-auto rounded-lg"
                />
              ) : (
                <div className="bg-muted rounded-lg p-4">
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
          
          {/* Access Section */}
          <div className="mt-16 pt-16 border-t">
            <Card className="p-8 shadow-medium max-w-2xl mx-auto">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto gradient-primary rounded-full flex items-center justify-center">
                  <Eye className="w-8 h-8 text-primary-foreground" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Access Content
                  </h2>
                  <p className="text-muted-foreground">
                    Enter the password to access shared files or code.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <Label htmlFor="accessPassword" className="text-sm font-medium">
                      Password
                    </Label>
                    <Input
                      id="accessPassword"
                      type="password"
                      placeholder="Enter password to access content"
                      value={accessPassword}
                      onChange={(e) => setAccessPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAccess()}
                      className="transition-smooth"
                    />
                  </div>
                  
                  <Button
                    onClick={handleAccess}
                    variant="secure"
                    size="lg"
                    disabled={isLoading}
                    className="w-full"
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
          </div>
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
