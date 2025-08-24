import React, { useState } from 'react';
import { Download, Eye, Copy, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface SharedContent {
  type: 'file' | 'code';
  content: string;
  filename: string;
  expiration: string;
}

const GetPage = () => {
  const [accessPassword, setAccessPassword] = useState('');
  const [accessedContent, setAccessedContent] = useState<SharedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAccessContent = async () => {
    if (!accessPassword.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter the password to access the content.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const storedItems = JSON.parse(localStorage.getItem('sharedItems') || '[]');
      const item = storedItems.find((item: any) => item.password === accessPassword);
      
      if (item) {
        setAccessedContent(item);
        toast({
          title: "Access Granted!",
          description: "Content has been successfully accessed.",
          variant: "default",
        });
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid password or content not found.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleDownload = () => {
    if (!accessedContent) return;

    const blob = new Blob([accessedContent.content], { 
      type: accessedContent.type === 'code' ? 'text/plain' : 'application/octet-stream' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = accessedContent.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: `${accessedContent.filename} is being downloaded.`,
      variant: "default",
    });
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
    setAccessPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              <Download className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Get Shared Content
            </h1>
            <p className="text-xl text-muted-foreground">
              Enter the password to access shared files or code snippets
            </p>
          </div>

          {!accessedContent ? (
            <Card className="p-8 animate-scale-in">
              <div className="space-y-6">
                <div className="text-center">
                  <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    Protected Content
                  </h2>
                  <p className="text-muted-foreground">
                    Enter the password provided by the sender
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="access-password">Password</Label>
                    <Input
                      id="access-password"
                      type="password"
                      placeholder="Enter password..."
                      value={accessPassword}
                      onChange={(e) => setAccessPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAccessContent()}
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    onClick={handleAccessContent} 
                    className="w-full hover:scale-105 transition-transform"
                    disabled={isLoading}
                  >
                    {isLoading ? "Accessing..." : "Access Content"}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      {accessedContent.type === 'file' ? <Download className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      {accessedContent.filename}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Type: {accessedContent.type === 'file' ? 'File' : 'Code Snippet'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {accessedContent.type === 'code' && (
                      <Button onClick={handleCopyCode} variant="outline" size="sm" className="hover:scale-105 transition-transform">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    )}
                    <Button onClick={handleDownload} variant="outline" size="sm" className="hover:scale-105 transition-transform">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                {accessedContent.type === 'code' && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-muted-foreground">Code Content:</Label>
                    <div className="mt-2 p-4 bg-muted rounded-lg border">
                      <pre className="text-sm text-foreground overflow-x-auto whitespace-pre-wrap">
                        {accessedContent.content}
                      </pre>
                    </div>
                  </div>
                )}
              </Card>

              <div className="text-center">
                <Button 
                  onClick={handleNewAccess} 
                  variant="outline"
                  className="hover:scale-105 transition-transform"
                >
                  Access Another Item
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GetPage;