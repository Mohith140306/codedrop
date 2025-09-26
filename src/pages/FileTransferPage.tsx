import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, File as FileIcon, X, Share2, CheckCircle, Copy, Loader2, AlertTriangle, Download, XCircle } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

const FileTransferPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const {
    isConnected,
    error,
    isLoading,
    generateRoom,
    joinRoom,
    cleanup,
    startFileTransfer,
    cancelTransfer,
    transferProgress,
    transferSpeed,
    eta,
    receivedFiles,
  } = useWebRTC();

  const [roomCode, setRoomCode] = useState('');
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [activeTab, setActiveTab] = useState('sender');

  useEffect(() => {
    if (isConnected && activeTab === 'sender' && files.length > 0) {
      startFileTransfer(files);
    }
  }, [isConnected, activeTab, files, startFileTransfer]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleFileDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (files.length > 0 || isConnected) return;
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, [files.length, isConnected]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (files.length > 0 || isConnected) return;
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleGenerateRoom = async () => {
    if (files.length === 0) return;
    const newRoomCode = await generateRoom(files);
    setRoomCode(newRoomCode);
  };

  const handleJoinRoom = () => {
    if (inputRoomCode.trim()) {
      joinRoom(inputRoomCode.trim().toUpperCase());
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(err => console.error("Failed to copy text: ", err));
  };

  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatEta = (seconds: number) => {
    if (seconds === Infinity || !isFinite(seconds) || seconds === 0) return '...';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
  };

  const isTransferComplete = transferProgress >= 100;

  const renderSenderView = () => (
    <div className="space-y-4">
      <div
        className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:border-elegant transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
      >
        <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Drag & drop files here, or click to select</p>
        <input type="file" multiple onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>

      {files.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Selected Files:</h3>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                  <div className="flex items-center gap-2 overflow-hidden">
                  <FileIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                  <X className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!roomCode ? (
        <Button onClick={handleGenerateRoom} disabled={isLoading || files.length === 0}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Share Code
        </Button>
      ) : (
        <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">Share this code with the receiver:</p>
            <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold tracking-widest p-2 bg-muted rounded-md">{roomCode}</span>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(roomCode)}>
                    <Copy className="w-5 h-5" />
                </Button>
            </div>
            <div className="flex items-center justify-center pt-4">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <p>Waiting for receiver to join...</p>
            </div>
        </div>
      )}
    </div>
  );

  const renderReceiverView = () => (
    <div className="space-y-4 text-center">
        <CardDescription>Enter the code from the sender to start the connection.</CardDescription>
        <div className="flex w-full max-w-sm items-center space-x-2 mx-auto">
            <Input
                type="text"
                placeholder="Enter Code"
                value={inputRoomCode}
                onChange={(e) => setInputRoomCode(e.target.value)}
                className="text-center tracking-widest"
                maxLength={6}
            />
            <Button onClick={handleJoinRoom} disabled={isLoading || !inputRoomCode}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Join
            </Button>
        </div>
    </div>
  );

  const renderTransferView = () => (
    <div className="text-center space-y-4">
      {isTransferComplete ? (
        <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
      ) : (
        <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center">
            <Share2 className="w-8 h-8 text-blue-500 animate-pulse" />
        </div>
      )}
      <h2 className="text-2xl font-bold mt-4">{isTransferComplete ? 'Transfer Complete!' : 'Transfer in Progress'}</h2>
      <p className="text-muted-foreground">{isTransferComplete ? 'Files have been successfully transferred.' : 'Please keep this tab open.'}</p>

      <div className="mt-6 space-y-3">
          <Progress value={transferProgress} className="w-full" />
          <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>{transferProgress.toFixed(2)}%</span>
              <span>{transferSpeed.toFixed(2)} MB/s</span>
              <span>ETA: {formatEta(eta)}</span>
          </div>
      </div>

      {!isTransferComplete && (
          <Button variant="destructive" className="mt-6" onClick={cancelTransfer}>
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Transfer
          </Button>
      )}

      {receivedFiles.length > 0 && (
        <div className="mt-6 text-left">
          <h3 className="font-semibold mb-2">Received Files:</h3>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {receivedFiles.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => downloadFile(file)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-4xl mx-auto glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-elegant">
            <Share2 className="w-6 h-6" />
            P2P File Transfer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isConnected ? renderTransferView() : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sender">Sender</TabsTrigger>
                <TabsTrigger value="receiver">Receiver</TabsTrigger>
              </TabsList>
              <TabsContent value="sender" className="pt-4">{renderSenderView()}</TabsContent>
              <TabsContent value="receiver" className="pt-4">{renderReceiverView()}</TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FileTransferPage;