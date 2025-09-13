import React from 'react';
import { FileText, Image, Archive, FileAudio, FileVideo, Copy, Share2, Trash2, MoreHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileFileCardProps {
  name: string;
  size: string;
  date: string;
  type: 'file' | 'code';
  fileType?: string;
  onCopyLink: () => void;
  onShare: () => void;
  onDelete: () => void;
  className?: string;
}

const getFileIcon = (filename: string, type: 'file' | 'code') => {
  if (type === 'code') return FileText;
  
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return FileText;
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return Image;
  if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) return FileAudio;
  if (['mp4', 'avi', 'mov', 'webm'].includes(ext)) return FileVideo;
  if (['zip', 'rar', '7z', 'tar'].includes(ext)) return Archive;
  
  return FileText;
};

export const MobileFileCard: React.FC<MobileFileCardProps> = ({
  name,
  size,
  date,
  type,
  fileType,
  onCopyLink,
  onShare,
  onDelete,
  className
}) => {
  const IconComponent = getFileIcon(name, type);

  return (
    <Card className={cn(
      "p-4 shadow-soft hover:shadow-medium transition-all duration-200 bg-card",
      className
    )}>
      <div className="flex items-start gap-3">
        {/* File Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-primary" />
        </div>
        
        {/* File Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground text-sm truncate">
            {name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">{size}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{date}</span>
          </div>
          {type === 'code' && fileType && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-accent/20 text-accent-foreground rounded-full">
              {fileType}
            </span>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={onCopyLink}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost" 
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={onShare}
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon" 
            className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};