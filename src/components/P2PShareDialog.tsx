import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Copy, QrCode, Wifi, Upload, X, Shield, Zap, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { P2PFileTransfer } from '@/utils/p2pTransfer';
import { QRCodeGenerator } from '@/utils/qrCodeGenerator';
import { FileTransferManager } from '@/utils/fileTransfer';
import { FallbackUploadDialog } from './FallbackUploadDialog';

interface P2PShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  onFallbackToCloud: () => void;
}

export const P2PShareDialog: React.FC<P2PShareDialogProps> = ({
  isOpen,
  onClose,
  file,
  onFallbackToCloud
}) => {
  const [roomCode, setRoomCode] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'creating' | 'waiting' | 'connected' | 'transferring' | 'complete' | 'error'>('creating');
  const [transferProgress, setTransferProgress] = useState(0);
  const [transferSpeed, setTransferSpeed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [p2pTransfer, setP2pTransfer] = useState<P2PFileTransfer | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [showFallbackDialog, setShowFallbackDialog] = useState(false);
  const { toast } = useToast();
  const fileManager = FileTransferManager.getInstance();

  useEffect(() => {
    if (isOpen && file) {
      initializeP2PShare();
    }
    
    return () => {
      p2pTransfer?.disconnect();
    };
  }, [isOpen, file]);

  const initializeP2PShare = async () => {
    try {
      setConnectionStatus('creating');
      setErrorMessage('');
      
      const transfer = new P2PFileTransfer({
        onProgress: (progress) => {
          setTransferProgress(progress.percentage);
          setTransferSpeed(progress.speed);
          setTimeRemaining(progress.estimatedTimeRemaining);
          if (progress.percentage > 0 && connectionStatus !== 'transferring') {
            setConnectionStatus('transferring');
          }
        },
        onComplete: () => {
          setConnectionStatus('complete');
          toast({
            title: "Transfer Complete!",
            description: "File has been successfully sent to the receiver.",
          });
        },
        onError: (error) => {
          setConnectionStatus('error');
          setErrorMessage(error);
          toast({
            title: "Transfer Failed",
            description: error,
            variant: "destructive",
          });
        },
        onConnected: () => {
          setConnectionStatus('connected');
          toast({
            title: "Receiver Connected!",
            description: "Starting file transfer...",
          });
          setTimeout(() => sendFile(transfer), 1000);
        },
        enableEncryption: true
      });

      setP2pTransfer(transfer);
      const code = await transfer.createRoom();
      setRoomCode(code);
      
      // Generate QR code
      const qrUrl = QRCodeGenerator.generateForRoom(code, { size: 200 });
      setQrCodeUrl(qrUrl);
      
      setConnectionStatus('waiting');

    } catch (error) {
      console.error('Failed to create P2P room:', error);
      setConnectionStatus('error');
      setErrorMessage('Failed to setup P2P sharing. Network restrictions may be blocking the connection.');
      toast({
        title: "Setup Failed",
        description: "Failed to setup P2P sharing. Try cloud upload instead.",
        variant: "destructive",
      });
    }
  };

  const sendFile = async (transfer: P2PFileTransfer) => {
    if (!file) return;
    
    try {
      setConnectionStatus('transferring');
      await transfer.sendFile(file);
    } catch (error) {
      console.error('Failed to send file:', error);
      setConnectionStatus('error');
      setErrorMessage('File transfer failed. Connection may have been interrupted.');
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

  const copyShareLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/get?room=${roomCode}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Share Link Copied!",
        description: "Send this link to the receiver.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy share link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      p2pTransfer?.disconnect();
      initializeP2PShare();
    } else {
      toast({
        title: "Max Retries Reached",
        description: "Switching to cloud fallback mode.",
      });
      handleFallback();
    }
  };

  const handleClose = () => {
    p2pTransfer?.disconnect();
    setRoomCode('');
    setQrCodeUrl('');
    setConnectionStatus('creating');
    setTransferProgress(0);
    setTransferSpeed(0);
    setTimeRemaining(0);
    setErrorMessage('');
    setRetryCount(0);
    onClose();
  };

  const handleFallback = () => {
    if (file && roomCode) {
      setShowFallbackDialog(true);
    } else {
      handleClose();
      onFallbackToCloud();
    }
  };

  const handleFallbackComplete = (fallbackRoomCode: string) => {
    setShowFallbackDialog(false);
    toast({
      title: "Fallback Complete!",
      description: `File available with room code: ${fallbackRoomCode}`,
    });
  };

  const getStatusDisplay = () => {
    switch (connectionStatus) {
      case 'creating':
        return { 
          text: 'Setting up secure P2P connection...', 
          icon: <Upload className="w-4 h-4 animate-spin" />,
          color: 'text-blue-500'
        };
      case 'waiting':
        return { 
          text: 'Waiting for receiver to connect...', 
          icon: <Wifi className="w-4 h-4 animate-pulse" />,
          color: 'text-amber-500'
        };
      case 'connected':
        return { 
          text: 'Connected! Preparing transfer...', 
          icon: <Wifi className="w-4 h-4 text-green-500" />,
          color: 'text-green-500'
        };
      case 'transferring':
        return { 
          text: 'Transferring file securely...', 
          icon: <Upload className="w-4 h-4" />,
          color: 'text-blue-500'
        };
      case 'complete':
        return { 
          text: 'Transfer completed successfully!', 
          icon: <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>,
          color: 'text-green-500'
        };
      case 'error':
        return { 
          text: 'Transfer failed', 
          icon: <X className="w-4 h-4 text-red-500" />,
          color: 'text-red-500'
        };
      default:
        return { text: '', icon: null, color: '' };
    }
  };

  const status = getStatusDisplay();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            P2P Direct Transfer
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* File Info */}
          {file && (
            <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">{file.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {fileManager.formatFileSize(file.size)}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs font-medium">Encrypted</span>
                </div>
              </div>
            </Card>
          )}

          {/* Status */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            {status.icon}
            <span className={`text-sm font-medium ${status.color}`}>{status.text}</span>
          </div>

          {/* Error Message */}
          {connectionStatus === 'error' && errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                <div className="text-sm text-red-700">{errorMessage}</div>
              </div>
            </div>
          )}

          {/* Room Code & QR Code */}
          {roomCode && (connectionStatus === 'waiting' || connectionStatus === 'connected') && (
            <div className="space-y-4">
              <div className="text-center space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Room Code</div>
                  <div className="text-3xl font-mono font-bold tracking-wider bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent p-3 rounded-lg border-2 border-dashed border-primary/30">
                    {roomCode}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyRoomCode}
                    className="w-full"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyShareLink}
                    className="w-full"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>

              {qrCodeUrl && (
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">Or scan QR Code</div>
                  <div className="flex justify-center">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code" 
                      className="w-40 h-40 border rounded-lg shadow-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Transfer Progress */}
          {connectionStatus === 'transferring' && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(transferProgress)}%</span>
              </div>
              <Progress value={transferProgress} className="w-full h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Speed: {fileManager.formatTransferSpeed(transferSpeed)}</span>
                <span>ETA: {fileManager.formatTimeRemaining(timeRemaining)}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {connectionStatus === 'error' && (
              <>
                {retryCount < 3 ? (
                  <Button onClick={handleRetry} variant="outline" className="w-full">
                    <Wifi className="w-4 h-4 mr-2" />
                    Retry Connection ({3 - retryCount} attempts left)
                  </Button>
                ) : null}
                <Button onClick={handleFallback} className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Use Cloud Fallback
                </Button>
              </>
            )}
            
            {connectionStatus !== 'complete' && connectionStatus !== 'transferring' && connectionStatus !== 'error' && (
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
            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg space-y-1">
              <div className="font-medium">Instructions:</div>
              <div>1. Share the room code or QR code with the receiver</div>
              <div>2. They should use "Local Receive" option on the Get page</div>
              <div>3. Both devices must be on the same network or have internet access</div>
              <div>4. Transfer is encrypted end-to-end for security</div>
            </div>
          )}

          {/* Benefits */}
          {(connectionStatus === 'waiting' || connectionStatus === 'connected') && (
            <div className="text-xs text-green-700 bg-green-50 p-3 rounded-lg space-y-1">
              <div className="font-medium flex items-center gap-1">
                <Zap className="w-3 h-3" />
                P2P Benefits:
              </div>
              <div>• Direct transfer - no file size limits</div>
              <div>• Faster speeds than cloud upload</div>
              <div>• End-to-end encryption</div>
              <div>• No server storage costs</div>
            </div>
          )}
        </div>
        
        <FallbackUploadDialog
          isOpen={showFallbackDialog}
          onClose={() => setShowFallbackDialog(false)}
          file={file}
          roomCode={roomCode}
          onComplete={handleFallbackComplete}
        />
      </DialogContent>
    </Dialog>
  );
};