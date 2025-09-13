import React, { useState } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileFileCard } from './MobileFileCard';
import { FloatingActionButton } from './FloatingActionButton';
import { MobileUploadProgress } from './MobileUploadProgress';
import { UploadZone } from './UploadZone';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface MobileSendViewProps {
  isUploading: boolean;
  uploadProgress: number;
  onUpload: (data: any) => void;
  className?: string;
}

export const MobileSendView: React.FC<MobileSendViewProps> = ({
  isUploading,
  uploadProgress,
  onUpload,
  className
}) => {
  const isMobile = useIsMobile();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Mock data for demonstration - in real app this would come from props/state
  const mockFiles = [
    {
      id: '1',
      name: 'Project Documentation.pdf',
      size: '2.4 MB',
      date: '2 hours ago',
      type: 'file' as const,
    },
    {
      id: '2', 
      name: 'React Component Code',
      size: '1.2 KB',
      date: '5 hours ago',
      type: 'code' as const,
      fileType: 'TypeScript'
    },
    {
      id: '3',
      name: 'Design Assets.zip',
      size: '15.6 MB', 
      date: '1 day ago',
      type: 'file' as const,
    }
  ];

  const handleCopyLink = (id: string) => {
    console.log('Copy link for:', id);
  };

  const handleShare = (id: string) => {
    console.log('Share file:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete file:', id);
  };

  if (!isMobile) return null;

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Search and Filter Bar */}
      <div className="sticky top-14 z-20 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Filter className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-9 w-9"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Files List */}
      <div className="p-4 space-y-3 pb-24">
        {mockFiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No files yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tap the + button to upload your first file
            </p>
          </div>
        ) : (
          mockFiles.map((file) => (
            <MobileFileCard
              key={file.id}
              name={file.name}
              size={file.size}
              date={file.date}
              type={file.type}
              fileType={file.fileType}
              onCopyLink={() => handleCopyLink(file.id)}
              onShare={() => handleShare(file.id)}
              onDelete={() => handleDelete(file.id)}
            />
          ))
        )}
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <MobileUploadProgress
          fileName="Uploading file..."
          progress={uploadProgress}
          onCancel={() => console.log('Cancel upload')}
        />
      )}

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => setShowUploadDialog(true)}
        disabled={isUploading}
      />

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] p-4">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Upload Content</h2>
            <UploadZone 
              onUpload={(data) => {
                onUpload(data);
                setShowUploadDialog(false);
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};