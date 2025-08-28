import React, { useState, useRef } from 'react';
import { Upload, FileText, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface UploadZoneProps {
  onUpload: (data: {
    type: 'file' | 'code';
    content: string | File;
    expiration: string;
    filename?: string;
    language?: string;
  }) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUpload }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'code'>('file');
  const [dragActive, setDragActive] = useState(false);
  const [expiration, setExpiration] = useState('24h');
  const [codeContent, setCodeContent] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setActiveTab('file');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleShare = async () => {
    if (activeTab === 'file' && !selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to share.",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === 'code' && !codeContent.trim()) {
      toast({
        title: "No Code Content",
        description: "Please enter some code to share.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    const data = {
      type: activeTab,
      content: activeTab === 'file' ? selectedFile! : codeContent,
      expiration,
      filename: selectedFile?.name,
      language: activeTab === 'code' ? language : undefined,
    };

    try {
      await onUpload(data);
    } finally {
      setIsUploading(false);
      // Reset form after successful upload
      setSelectedFile(null);
      setCodeContent('');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 md:space-y-6 px-3 md:px-0">
      {/* Tab Selection */}
      <div className="flex justify-center space-x-2">
        <Button
          variant={activeTab === 'file' ? 'secure' : 'outline'}
          onClick={() => setActiveTab('file')}
          className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-3 md:px-4"
        >
          <Upload className="w-3 h-3 md:w-4 md:h-4" />
          <span className="hidden sm:inline">Share </span>File
        </Button>
        <Button
          variant={activeTab === 'code' ? 'secure' : 'outline'}
          onClick={() => setActiveTab('code')}
          className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-3 md:px-4"
        >
          <FileText className="w-3 h-3 md:w-4 md:h-4" />
          <span className="hidden sm:inline">Share </span>Code
        </Button>
      </div>

      <Card className="p-4 md:p-8 shadow-medium">
        {activeTab === 'file' ? (
          <div
            className={`upload-zone border-2 border-dashed rounded-lg p-6 md:p-12 text-center ${
              dragActive ? 'dragover' : 'border-border hover:border-accent'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInput}
              className="hidden"
            />
            
            <div className="space-y-3 md:space-y-4">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto gradient-accent rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 md:w-8 md:h-8 text-accent-foreground" />
              </div>
              
              {selectedFile ? (
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">File Selected</h3>
                  <p className="text-sm md:text-base text-muted-foreground break-all">{selectedFile.name}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">
                    <span className="hidden sm:inline">Drag & drop your file here</span>
                    <span className="sm:hidden">Tap to select file</span>
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    <span className="hidden sm:inline">or click to browse files</span>
                    <span className="sm:hidden">Choose a file to share</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <Label htmlFor="language" className="text-sm font-medium">Language:</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="plaintext">Plain Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Textarea
              placeholder="Paste your code here..."
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              className="min-h-[200px] md:min-h-[300px] font-mono text-xs md:text-sm"
            />
          </div>
        )}

        {/* Security Options */}
        <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t space-y-3 md:space-y-4">
          <div className="flex items-center gap-2 text-primary mb-2 md:mb-4">
            <Shield className="w-4 h-4 md:w-5 md:h-5" />
            <h3 className="text-sm md:text-base font-semibold">Security Settings</h3>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs md:text-sm font-medium flex items-center gap-2">
              <Clock className="w-3 h-3 md:w-4 md:h-4" />
              Expiration
            </Label>
            <Select value={expiration} onValueChange={setExpiration}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            onClick={handleShare}
            variant="secure"
            size="lg"
            disabled={isUploading}
            className="w-full mt-4 md:mt-6 transition-all duration-200 hover:scale-105 hover:shadow-lg text-sm md:text-base py-3 md:py-6"
          >
            {isUploading ? (
              <>
                <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                <span className="hidden sm:inline">Creating Secure Content...</span>
                <span className="sm:hidden">Creating...</span>
              </>
            ) : (
              <>
                <Shield className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                <span className="hidden sm:inline">Create Secure Content</span>
                <span className="sm:hidden">Create Content</span>
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};