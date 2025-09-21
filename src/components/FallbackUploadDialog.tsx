import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Cloud, Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FallbackStorageManager } from '@/utils/fallbackStorage';
import { FileTransferManager } from '@/utils/fileTransfer';
import { QRCodeGenerator } from '@/utils/qrCodeGenerator';

interface FallbackUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  roomCode: string;
  onComplete: (roomCode: string) => void;
}

export const FallbackUploadDialog: React.FC<FallbackUploadDialogProps> = ({
  isOpen,
  onClose,
  file,
  roomCode,
  onComplete
}) => {
  const [uploadStatus, setUploadStatus] = useState<'uploading' | 'complete' | 'error'>('uploading');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const { toast } = useToast();
  const fallbackManager = FallbackStorageManager.getInstance();
  const fileManager = FileTransferManager.getInstance();

  React.useEffect(() => {
    if (isOpen && file && roomCode) {
      handleFallbackUpload();
    }
  }, [isOpen, file, roomCode]);

  const handleFallbackUpload = async () => {
    if (!file) return;

    try {
      setUploadStatus('uploading');
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 20;
        });
      }, 200);

      // Upload to fallback storage
      const resultRoomCode = await fallbackManager.uploadFallbackFile(file, roomCode);
      
      // Generate QR code
      const qrUrl = QRCodeGenerator.generateForRoom(resultRoomCode, { size: 200 });
      setQrCodeUrl(qrUrl);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('complete');

      toast({
        title: "Fallback Upload Complete!",
        description: "File uploaded to temporary cloud storage. Auto-deletes in 24 hours.",
      });

      onComplete(resultRoomCode);

    } catch (error) {
      console.error('Fallback upload failed:', error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
      toast({
        title: "Fallback Upload Failed",
        description: "Unable to upload file to fallback storage.",
        variant: "destructive",
      });
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

  const getStatusDisplay = () => {
    switch (uploadStatus) {
      case 'uploading':
        return {
          icon: <Upload className="w-4 h-4 animate-spin" />,
          title: 'Uploading to Fallback Storage',
          description: 'Uploading file to temporary cloud storage...',
          color: 'text-blue-500'
        };
      case 'complete':
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
          title: 'Fallback Upload Complete',
          description: 'File is now available for download',
          color: 'text-green-500'
        };
      case 'error':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
          title: 'Upload Failed',
          description: errorMessage,
          color: 'text-red-500'
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary" />
            Fallback Cloud Storage
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* File Info */}
          {file && (
            <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">{file.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {fileManager.formatFileSize(file.size)}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">24h</span>
                </div>
              </div>
            </Card>
          )}

          {/* Status */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            {status.icon}
            <div>
              <div className={`text-sm font-medium ${status.color}`}>{status.title}</div>
              <div className="text-xs text-muted-foreground">{status.description}</div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadStatus === 'uploading' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full h-2" />
            </div>
          )}

          {/* Room Code Display */}
          {uploadStatus === 'complete' && (
            <div className="space-y-4">
              <div className="text-center space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Room Code</div>
                  <div className="text-3xl font-mono font-bold tracking-wider bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent p-3 rounded-lg border-2 border-dashed border-primary/30">
                    {roomCode}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyRoomCode}
                  className="w-full"
                >
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
                      className="w-32 h-32 border rounded-lg shadow-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {uploadStatus === 'error' && (
              <Button onClick={handleFallbackUpload} className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Retry Upload
              </Button>
            )}
            
            <Button 
              variant={uploadStatus === 'complete' ? 'default' : 'outline'} 
              onClick={onClose} 
              className="w-full"
            >
              {uploadStatus === 'complete' ? 'Done' : 'Cancel'}
            </Button>
          </div>

          {/* Info */}
          {uploadStatus === 'complete' && (
            <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg space-y-1">
              <div className="font-medium flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Fallback Storage Info:
              </div>
              <div>• File stored temporarily in secure cloud</div>
              <div>• Automatically deleted after 24 hours</div>
              <div>• Receiver can download using room code</div>
              <div>• Use when P2P connection fails</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};