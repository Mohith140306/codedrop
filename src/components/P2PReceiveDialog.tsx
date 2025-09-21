import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Download, Wifi, QrCode, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { P2PFileTransfer } from '@/utils/p2pTransfer';
import { FileTransferManager } from '@/utils/fileTransfer';
import { FallbackStorageManager } from '@/utils/fallbackStorage';

interface P2PReceiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoomCode?: string;
}

export const P2PReceiveDialog: React.FC<P2PReceiveDialogProps> = ({
  isOpen,
  onClose,
  initialRoomCode = ''
}) => {
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'receiving' | 'complete' | 'error'>('idle');
  const [receiveProgress, setReceiveProgress] = useState(0);
  const [transferSpeed, setTransferSpeed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [receivedFile, setReceivedFile] = useState<File | null>(null);
  const [p2pTransfer, setP2pTransfer] = useState<P2PFileTransfer | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const { toast } = useToast();
  const fileManager = FileTransferManager.getInstance();
  const fallbackManager = FallbackStorageManager.getInstance();

  const handleConnect = async () => {
    if (!roomCode.trim() || roomCode.length !== 4) {
      toast({
        title: "Invalid Room Code",
        description: "Please enter a valid 4-character room code.",
        variant: "destructive",
      });
      return;
    }

    // First try to check if this is a fallback file
    try {
      const fallbackFile = await fallbackManager.getFallbackFile(roomCode.toUpperCase());
      if (fallbackFile) {
        await handleFallbackDownload(fallbackFile);
        return;
      }
    } catch (error) {
      console.log('Not a fallback file, trying P2P connection...');
    }

    // If not a fallback file, try P2P connection
    try {
      setConnectionStatus('connecting');
      setErrorMessage('');
      
      const transfer = new P2PFileTransfer({
        onProgress: (progress) => {
          setReceiveProgress(progress.percentage);
          setTransferSpeed(progress.speed);
          setTimeRemaining(progress.estimatedTimeRemaining);
          if (progress.percentage > 0 && connectionStatus !== 'receiving') {
            setConnectionStatus('receiving');
          }
        },
        onComplete: (file) => {
          setReceivedFile(file);
          setConnectionStatus('complete');
          toast({
            title: "File Received!",
            description: `Successfully received ${file.name}`,
          });
        },
        onError: (error) => {
          setConnectionStatus('error');
          setErrorMessage(error);
          toast({
            title: "Connection Failed",
            description: error,
            variant: "destructive",
          });
        },
        onConnected: () => {
          setConnectionStatus('connected');
          toast({
            title: "Connected!",
            description: "Waiting for file transfer to begin...",
          });
        },
        enableEncryption: true
      });

      setP2pTransfer(transfer);
      await transfer.joinRoom(roomCode.toUpperCase());

    } catch (error) {
      console.error('Failed to connect:', error);
      setConnectionStatus('error');
      setErrorMessage('Unable to connect to the room. The room may not exist or the sender may have disconnected.');
      toast({
        title: "Connection Failed",
        description: "Unable to connect to the room. Check the room code and try again.",
        variant: "destructive",
      });
    }
  };

  const handleFallbackDownload = async (fallbackFile: any) => {
    try {
      setConnectionStatus('receiving');
      setIsFallbackMode(true);
      
      // Download file from fallback storage
      const blob = await fallbackManager.downloadFallbackFile(fallbackFile.filePath);
      const file = new File([blob], fallbackFile.filename, {
        type: fallbackFile.fileType
      });
      
      // Verify file integrity
      const isValid = await fallbackManager.verifyFileIntegrity(file, fallbackFile.checksum);
      if (!isValid) {
        throw new Error('File integrity check failed');
      }
      
      setReceivedFile(file);
      setConnectionStatus('complete');
      
      toast({
        title: "File Downloaded!",
        description: `Successfully downloaded ${file.name} from fallback storage`,
      });
      
    } catch (error) {
      console.error('Fallback download failed:', error);
      setConnectionStatus('error');
      setErrorMessage('Failed to download file from fallback storage');
      toast({
        title: "Download Failed",
        description: "Unable to download file from fallback storage.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!receivedFile) return;

    const url = URL.createObjectURL(receivedFile);
    const element = document.createElement('a');
    element.href = url;
    element.download = receivedFile.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: "File is being downloaded to your device.",
    });
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      p2pTransfer?.disconnect();
      handleConnect();
    } else {
      toast({
        title: "Max Retries Reached",
        description: "Please check the room code and try again later.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    p2pTransfer?.disconnect();
    setRoomCode(initialRoomCode);
    setConnectionStatus('idle');
    setReceiveProgress(0);
    setTransferSpeed(0);
    setTimeRemaining(0);
    setReceivedFile(null);
    setP2pTransfer(null);
    setErrorMessage('');
    setRetryCount(0);
    onClose();
  };

  const getStatusDisplay = () => {
    switch (connectionStatus) {
      case 'idle':
        return { 
          text: 'Enter room code to connect', 
          color: 'text-muted-foreground',
          icon: <Wifi className="w-4 h-4" />
        };
      case 'connecting':
        return { 
          text: 'Connecting to sender...', 
          color: 'text-blue-500',
          icon: <Wifi className="w-4 h-4 animate-pulse" />
        };
      case 'connected':
        return { 
          text: 'Connected! Waiting for file...', 
          color: 'text-green-500',
          icon: <Wifi className="w-4 h-4 text-green-500" />
        };
      case 'receiving':
        return { 
          text: 'Receiving file securely...', 
          color: 'text-blue-500',
          icon: isFallbackMode ? <Cloud className="w-4 h-4" /> : <Download className="w-4 h-4" />
        };
      case 'complete':
        return { 
          text: 'File received successfully!', 
          color: 'text-green-500',
          icon: <CheckCircle className="w-4 h-4 text-green-500" />
        };
      case 'error':
        return { 
          text: 'Connection failed', 
          color: 'text-red-500',
          icon: <AlertTriangle className="w-4 h-4 text-red-500" />
        };
      default:
        return { text: '', color: '', icon: null };
    }
  };

  const status = getStatusDisplay();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            P2P Direct Receive
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
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

          {/* Room Code Input */}
          {(connectionStatus === 'idle' || connectionStatus === 'error') && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomCode" className="text-sm font-medium">
                  Room Code
                </Label>
                <Input
                  id="roomCode"
                  type="text"
                  placeholder="Enter 4-character room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
                  className="font-mono text-center tracking-wider text-lg py-3"
                  maxLength={4}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Button
                  onClick={handleConnect}
                  disabled={!roomCode.trim() || roomCode.length !== 4}
                  className="w-full"
                >
                  <Wifi className="w-4 h-4 mr-2" />
                  Connect to Sender
                </Button>
                
                {connectionStatus === 'error' && retryCount < 3 && (
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    className="w-full"
                  >
                    Retry Connection ({3 - retryCount} attempts left)
                  </Button>
                )}
              </div>

              <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg space-y-1">
                <div className="font-medium">How to connect:</div>
                <div>1. Get the 4-digit room code from the sender</div>
                <div>2. Or scan their QR code to auto-fill the code</div>
                <div>3. Both devices need internet access</div>
                <div>4. Transfer is encrypted for security</div>
              </div>
            </div>
          )}

          {/* Received File Info */}
          {receivedFile && (
            <Card className={`p-4 border-green-200 ${
              isFallbackMode 
                ? 'bg-gradient-to-r from-amber-50 to-orange-50' 
                : 'bg-gradient-to-r from-green-50 to-blue-50'
            }`}>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isFallbackMode ? 'bg-amber-100' : 'bg-green-100'
                  }`}>
                    {isFallbackMode ? (
                      <Cloud className="w-5 h-5 text-amber-600" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">{receivedFile.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {fileManager.formatFileSize(receivedFile.size)}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${
                    isFallbackMode ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      {isFallbackMode ? 'Fallback' : 'Verified'}
                    </span>
                  </div>
                </div>
                
                <Button onClick={handleDownload} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>
              </div>
            </Card>
          )}

          {/* Receive Progress */}
          {connectionStatus === 'receiving' && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Receiving</span>
                <span>{Math.round(receiveProgress)}%</span>
              </div>
              <Progress value={receiveProgress} className="w-full h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Speed: {fileManager.formatTransferSpeed(transferSpeed)}</span>
                <span>ETA: {fileManager.formatTimeRemaining(timeRemaining)}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {connectionStatus !== 'idle' && connectionStatus !== 'error' && connectionStatus !== 'complete' && (
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

          {/* Benefits */}
          {(connectionStatus === 'connected' || connectionStatus === 'receiving') && (
            <div className={`text-xs p-3 rounded-lg space-y-1 ${
              isFallbackMode 
                ? 'text-amber-700 bg-amber-50' 
                : 'text-blue-700 bg-blue-50'
            }`}>
              <div className="font-medium flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {isFallbackMode ? 'Fallback Storage:' : 'Secure P2P Transfer:'}
              </div>
              {isFallbackMode ? (
                <>
                  <div>• Downloaded from temporary cloud storage</div>
                  <div>• File integrity verified</div>
                  <div>• Auto-deleted after 24 hours</div>
                  <div>• Fallback when P2P fails</div>
                </>
              ) : (
                <>
                  <div>• Direct connection - no file size limits</div>
                  <div>• End-to-end encryption</div>
                  <div>• Faster than cloud downloads</div>
                  <div>• File integrity verification</div>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};