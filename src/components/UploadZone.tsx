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
    password: string;
    expiration: string;
    filename?: string;
    language?: string;
  }) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUpload }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'code'>('file');
  const [dragActive, setDragActive] = useState(false);
  const [password, setPassword] = useState('');
  const [expiration, setExpiration] = useState('24h');
  const [codeContent, setCodeContent] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  const handleShare = () => {
    if (!password) {
      toast({
        title: "Password Required",
        description: "Please set a password for your shared content.",
        variant: "destructive",
      });
      return;
    }

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

    const data = {
      type: activeTab,
      content: activeTab === 'file' ? selectedFile! : codeContent,
      password,
      expiration,
      filename: selectedFile?.name,
      language: activeTab === 'code' ? language : undefined,
    };

    onUpload(data);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Tab Selection */}
      <div className="flex justify-center space-x-2">
        <Button
          variant={activeTab === 'file' ? 'secure' : 'outline'}
          onClick={() => setActiveTab('file')}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Share File
        </Button>
        <Button
          variant={activeTab === 'code' ? 'secure' : 'outline'}
          onClick={() => setActiveTab('code')}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Share Code
        </Button>
      </div>

      <Card className="p-8 shadow-medium">
        {activeTab === 'file' ? (
          <div
            className={`upload-zone border-2 border-dashed rounded-lg p-12 text-center ${
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
            
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto gradient-accent rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-accent-foreground" />
              </div>
              
              {selectedFile ? (
                <div>
                  <h3 className="text-lg font-semibold text-foreground">File Selected</h3>
                  <p className="text-muted-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Drag & drop your file here
                  </h3>
                  <p className="text-muted-foreground">
                    or click to browse files
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="language" className="text-sm font-medium">Language:</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-48">
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
              className="min-h-[300px] font-mono text-sm"
            />
          </div>
        )}

        {/* Security Options */}
        <div className="mt-6 pt-6 border-t space-y-4">
          <div className="flex items-center gap-2 text-primary mb-4">
            <Shield className="w-5 h-5" />
            <h3 className="font-semibold">Security Settings</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password (Required)
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="transition-smooth"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Expiration
              </Label>
              <Select value={expiration} onValueChange={setExpiration}>
                <SelectTrigger>
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
          </div>
          
          <Button
            onClick={handleShare}
            variant="secure"
            size="lg"
            className="w-full mt-6"
          >
            <Shield className="w-4 h-4 mr-2" />
            Create Secure Share Link
          </Button>
        </div>
      </Card>
    </div>
  );
};