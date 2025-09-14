import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Copy, QrCode, Wifi, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WebRTCManager, generateQRCode } from '@/utils/webrtc';

interface LocalShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  onFallbackToCloud: () => void;
}

export const LocalShareDialog: React.FC<LocalShareDialogProps> = ({
  isOpen,
  onClose,
  file,
  onFallbackToCloud
}) => {
  const [roomCode, setRoomCode] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'creating' | 'waiting' | 'connected' | 'transferring' | 'complete' | 'error'>('creating');
  const [transferProgress, setTransferProgress] = useState(0);
  const [webrtcManager, setWebrtcManager] = useState<WebRTCManager | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && file) {
      initializeLocalShare();
    }
    
    return () => {
      webrtcManager?.disconnect();
    };
  }, [isOpen, file]);

  const initializeLocalShare = async () => {
    try {
      setConnectionStatus('creating');
      
      const manager = new WebRTCManager(
        (progress) => setTransferProgress(progress),
        () => {
          setConnectionStatus('complete');
          toast({
            title: "Transfer Complete!",
            description: "File has been successfully sent to the receiver.",
          });
        },
        (error) => {
          setConnectionStatus('error');
          toast({
            title: "Transfer Failed",
            description: error,
            variant: "destructive",
          });
        },
        () => {
          setConnectionStatus('connected');
          toast({
            title: "Receiver Connected!",
            description: "Starting file transfer...",
          });
          setTimeout(() => sendFile(manager), 1000);
        }
      );

      setWebrtcManager(manager);
      const code = await manager.createRoom();
      setRoomCode(code);
      setQrCodeUrl(generateQRCode(code));
      setConnectionStatus('waiting');

    } catch (error) {
      console.error('Failed to create room:', error);
      setConnectionStatus('error');
      toast({
        title: "Setup Failed",
        description: "Failed to setup local sharing. Try cloud upload instead.",
        variant: "destructive",
      });
    }
  };

  const sendFile = async (manager: WebRTCManager) => {
    if (!file) return;
    
    try {
      setConnectionStatus('transferring');
      await manager.sendFile(file);
    } catch (error) {
      console.error('Failed to send file:', error);
      setConnectionStatus('error');
    }
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      toast({
        title: "Room Code Copied!",
        description: "Share this code with the receiver.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy room code to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    webrtcManager?.disconnect();
    setRoomCode('');
    setQrCodeUrl('');
    setConnectionStatus('creating');
    setTransferProgress(0);
    onClose();
  };

  const handleFallback = () => {
    handleClose();
    onFallbackToCloud();
  };

  const getStatusDisplay = () => {
    switch (connectionStatus) {
      case 'creating':
        return { text: 'Setting up local sharing...', icon: <Upload className="w-4 h-4 animate-spin" /> };
      case 'waiting':
        return { text: 'Waiting for receiver...', icon: <Wifi className="w-4 h-4 animate-pulse" /> };
      case 'connected':
        return { text: 'Connected! Starting transfer...', icon: <Wifi className="w-4 h-4 text-green-500" /> };
      case 'transferring':
        return { text: 'Transferring file...', icon: <Upload className="w-4 h-4" /> };
      case 'complete':
        return { text: 'Transfer complete!', icon: <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div> };
      case 'error':
        return { text: 'Transfer failed', icon: <X className="w-4 h-4 text-red-500" /> };
      default:
        return { text: '', icon: null };
    }
  };

  const status = getStatusDisplay();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-primary" />
            Local Share
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* File Info */}
          {file && (
            <Card className="p-4">
              <div className="text-sm">
                <div className="font-medium text-foreground truncate">{file.name}</div>
                <div className="text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </Card>
          )}

          {/* Status */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            {status.icon}
            <span className="text-sm font-medium">{status.text}</span>
          </div>

          {/* Room Code & QR Code */}
          {roomCode && connectionStatus === 'waiting' && (
            <div className="space-y-4">
              <div className="text-center space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Room Code</div>
                  <div className="text-2xl font-mono font-bold tracking-wider bg-muted p-3 rounded-lg">
                    {roomCode}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyRoomCode}
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Room Code
                </Button>
              </div>

              {qrCodeUrl && (
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">Or scan QR Code</div>
                  <div className="flex justify-center">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code" 
                      className="w-32 h-32 border rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Transfer Progress */}
          {connectionStatus === 'transferring' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(transferProgress)}%</span>
              </div>
              <Progress value={transferProgress} className="w-full" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {connectionStatus === 'error' && (
              <Button onClick={handleFallback} className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Use Cloud Upload Instead
              </Button>
            )}
            
            {connectionStatus !== 'complete' && connectionStatus !== 'transferring' && (
              <Button variant="outline" onClick={handleClose} className="w-full">
                Cancel
              </Button>
            )}

            {connectionStatus === 'complete' && (
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            )}
          </div>

          {/* Instructions */}
          {connectionStatus === 'waiting' && (
            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
              Share the room code or QR code with the receiver. They need to be on the same WiFi network and use the "Local Receive" option.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};