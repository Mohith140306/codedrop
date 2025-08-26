import React from 'react';
import { Copy, Shield, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CodeShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
}

export const CodeShareDialog: React.FC<CodeShareDialogProps> = ({ 
  isOpen, 
  onClose, 
  code 
}) => {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied!",
      description: "The access code has been copied to your clipboard.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-success" />
            Content Secured!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-center text-muted-foreground">
            Your content has been secured. Share this access code:
          </p>
          
          <div className="bg-accent/10 rounded-lg p-8 border-2 border-dashed border-accent/30 text-center">
            <div className="text-6xl font-mono font-bold text-primary tracking-[0.5em] mb-4">
              {code}
            </div>
            <Button
              onClick={copyToClipboard}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Code
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2 bg-muted/50 p-4 rounded-lg">
            <p className="font-medium text-foreground">Security Notes:</p>
            <p>• Keep this code secure and only share with trusted individuals</p>
            <p>• Anyone with this code can access your shared content</p>
            <p>• Content will expire based on your selected timeframe</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="flex-1"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Again
            </Button>
            <Button
              onClick={onClose}
              variant="default"
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};