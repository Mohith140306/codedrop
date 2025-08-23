import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Lock, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ShareResultProps {
  shareId: string;
  type: 'file' | 'code';
  filename?: string;
  language?: string;
  expiration: string;
  onNewShare: () => void;
}

export const ShareResult: React.FC<ShareResultProps> = ({
  shareId,
  type,
  filename,
  language,
  expiration,
  onNewShare,
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const shareUrl = `${window.location.origin}/view/${shareId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "The secure share link has been copied to your clipboard.",
        variant: "default",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy the link. Please copy it manually.",
        variant: "destructive",
      });
    }
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

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="p-8 shadow-strong gradient-subtle">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto gradient-accent rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-accent-foreground" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Share Created Successfully!
            </h2>
            <p className="text-muted-foreground">
              Your {type} has been securely encrypted and is ready to share.
            </p>
          </div>

          {/* Share Details */}
          <div className="bg-background/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Type:
              </span>
              <span className="font-medium text-foreground">
                {type === 'file' ? `File: ${filename}` : `Code (${language})`}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Expires:
              </span>
              <span className="font-medium text-foreground">
                {getExpirationText(expiration)}
              </span>
            </div>
          </div>

          {/* Share URL */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-left block">
              Secure Share Link:
            </Label>
            <div className="flex items-center gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="font-mono text-sm bg-background"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => window.open(shareUrl, '_blank')}
              variant="default"
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Test Link
            </Button>
            <Button
              onClick={onNewShare}
              variant="outline"
              className="flex-1"
            >
              Share Another
            </Button>
          </div>

          {/* Security Notice */}
          <div className="bg-accent-soft/30 border border-accent/20 rounded-lg p-4 mt-6">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div className="text-left space-y-1">
                <h4 className="font-semibold text-accent text-sm">
                  Security Notice
                </h4>
                <p className="text-sm text-muted-foreground">
                  Remember to share the password separately from this link. 
                  Both are required to access the content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};