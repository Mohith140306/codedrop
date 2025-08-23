import React, { useState } from 'react';
import { Lock, Download, Eye, FileText, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface SecureViewProps {
  shareId: string;
}

interface ShareData {
  type: 'file' | 'code';
  content: string;
  filename?: string;
  language?: string;
  expiration: string;
  createdAt: string;
}

export const SecureView: React.FC<SecureViewProps> = ({ shareId }) => {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUnlock = async () => {
    if (!password) {
      toast({
        title: "Password Required",
        description: "Please enter the password to access this content.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call - In real app, this would validate password and decrypt content
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful unlock
      const mockData: ShareData = {
        type: 'code',
        content: `// Example secure code snippet
const encryptData = (data, key) => {
  // Encryption logic here
  return encrypted;
};

const decryptData = (encryptedData, key) => {
  // Decryption logic here  
  return decrypted;
};

// Usage
const myData = "Sensitive information";
const secretKey = "my-secret-key";
const encrypted = encryptData(myData, secretKey);
const decrypted = decryptData(encrypted, secretKey);

console.log(decrypted); // "Sensitive information"`,
        language: 'javascript',
        expiration: '24h',
        createdAt: new Date().toISOString(),
      };

      setShareData(mockData);
      setIsUnlocked(true);
      
      toast({
        title: "Content Unlocked!",
        description: "You now have access to the shared content.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Invalid Password",
        description: "The password you entered is incorrect.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!shareData) return;

    const element = document.createElement('a');
    const file = new Blob([shareData.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = shareData.filename || `shared-${shareData.type}.${shareData.language || 'txt'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getExpirationText = (exp: string) => {
    switch (exp) {
      case '1h': return '1 hour';
      case '24h': return '24 hours';
      case '7d': return '7 days';
      case '30d': return '30 days';
      case 'never': return 'Never';
      default: return exp;
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-strong">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto gradient-primary rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary-foreground" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Protected Content
              </h1>
              <p className="text-muted-foreground">
                This content is password protected. Enter the password to continue.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                  className="transition-smooth"
                />
              </div>
              
              <Button
                onClick={handleUnlock}
                variant="secure"
                size="lg"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Unlocking...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Unlock Content
                  </>
                )}
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4" />
                <span className="font-medium">Security Info</span>
              </div>
              <p>
                This content is encrypted and requires the correct password for access.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

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
                  {shareData?.type === 'file' ? shareData.filename : 'Code Snippet'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {shareData?.language && `Language: ${shareData.language}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          
          {/* Metadata */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Expires: {getExpirationText(shareData?.expiration || '')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>Secure View</span>
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
            
            <div className="bg-muted rounded-lg p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm text-foreground overflow-x-auto">
                {shareData?.content}
              </pre>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <Button
            onClick={() => window.location.href = '/'}
            variant="ghost"
            className="text-muted-foreground"
          >
            Create your own secure share
          </Button>
        </div>
      </div>
    </div>
  );
};