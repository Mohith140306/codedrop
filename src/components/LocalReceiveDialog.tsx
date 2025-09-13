import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Download, Wifi, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WebRTCManager } from '@/utils/webrtc';

interface LocalReceiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoomCode?: string;
}

export const LocalReceiveDialog: React.FC<LocalReceiveDialogProps> = ({
  isOpen,
  onClose,
  initialRoomCode = ''
}) => {
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'receiving' | 'complete' | 'error'>('idle');
  const [receiveProgress, setReceiveProgress] = useState(0);
  const [receivedFile, setReceivedFile] = useState<File | null>(null);
  const [webrtcManager, setWebrtcManager] = useState<WebRTCManager | null>(null);
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!roomCode.trim()) {
      toast({
        title: "Room Code Required",
        description: "Please enter a room code to connect.",
        variant: "destructive",
      });
      return;
    }

    try {
      setConnectionStatus('connecting');
      
      const manager = new WebRTCManager(
        (progress) => {
          setReceiveProgress(progress);
          if (progress > 0 && connectionStatus !== 'receiving') {
            setConnectionStatus('receiving');
          }
        },
        (file) => {
          setReceivedFile(file);
          setConnectionStatus('complete');
          toast({
            title: "File Received!",
            description: `Successfully received ${file.name}`,
          });
        },
        (error) => {
          setConnectionStatus('error');
          toast({
            title: "Connection Failed",
            description: error,
            variant: "destructive",
          });
        }
      );

      setWebrtcManager(manager);
      await manager.joinRoom(roomCode.toUpperCase());
      setConnectionStatus('connected');
      
      toast({
        title: "Connected!",
        description: "Waiting for file transfer to begin...",
      });

    } catch (error) {
      console.error('Failed to connect:', error);
      setConnectionStatus('error');
      toast({
        title: "Connection Failed",
        description: "Unable to connect to the room. Check the room code and try again.",
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

  const handleClose = () => {
    webrtcManager?.disconnect();
    setRoomCode(initialRoomCode);
    setConnectionStatus('idle');
    setReceiveProgress(0);
    setReceivedFile(null);
    setWebrtcManager(null);
    onClose();
  };

  const getStatusDisplay = () => {
    switch (connectionStatus) {
      case 'idle':
        return { text: 'Enter room code to connect', color: 'text-muted-foreground' };
      case 'connecting':
        return { text: 'Connecting to sender...', color: 'text-blue-500' };
      case 'connected':
        return { text: 'Connected! Waiting for file...', color: 'text-green-500' };
      case 'receiving':
        return { text: 'Receiving file...', color: 'text-blue-500' };
      case 'complete':
        return { text: 'File received successfully!', color: 'text-green-500' };
      case 'error':
        return { text: 'Connection failed', color: 'text-red-500' };
      default:
        return { text: '', color: '' };
    }
  };

  const status = getStatusDisplay();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Local Receive
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Wifi className={`w-4 h-4 ${connectionStatus === 'connected' || connectionStatus === 'receiving' || connectionStatus === 'complete' ? 'text-green-500' : 'text-muted-foreground'}`} />
            <span className={`text-sm font-medium ${status.color}`}>{status.text}</span>
          </div>

          {/* Room Code Input */}
          {connectionStatus === 'idle' || connectionStatus === 'error' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomCode" className="text-sm font-medium">
                  Room Code
                </Label>
                <Input
                  id="roomCode"
                  type="text"
                  placeholder="Enter 6-character room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
                  className="font-mono text-center tracking-wider text-lg py-3"
                  maxLength={6}
                />
              </div>
              
              <Button
                onClick={handleConnect}
                disabled={!roomCode.trim() || roomCode.length !== 6}
                className="w-full"
              >
                <Wifi className="w-4 h-4 mr-2" />
                Connect
              </Button>

              <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                Get the room code from the sender or scan their QR code. Make sure you're on the same WiFi network.
              </div>
            </div>
          ) : null}

          {/* Received File Info */}
          {receivedFile && (
            <Card className="p-4">
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium text-foreground truncate">{receivedFile.name}</div>
                  <div className="text-muted-foreground">
                    {(receivedFile.size / 1024 / 1024).toFixed(2)} MB
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
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Receiving</span>
                <span>{Math.round(receiveProgress)}%</span>
              </div>
              <Progress value={receiveProgress} className="w-full" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {connectionStatus !== 'idle' && connectionStatus !== 'error' && (
              <Button variant="outline" onClick={handleClose} className="w-full">
                {connectionStatus === 'complete' ? 'Done' : 'Cancel'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};