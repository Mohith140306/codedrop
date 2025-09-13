import React from 'react';
import { Upload, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MobileUploadProgressProps {
  fileName: string;
  progress: number;
  onCancel?: () => void;
  isComplete?: boolean;
}

export const MobileUploadProgress: React.FC<MobileUploadProgressProps> = ({
  fileName,
  progress,
  onCancel,
  isComplete = false
}) => {
  return (
    <Card className="fixed bottom-20 left-4 right-4 z-30 p-4 shadow-strong bg-card animate-slide-in-right">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-foreground truncate">
              {fileName}
            </span>
            {onCancel && !isComplete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={onCancel}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{isComplete ? 'Complete' : 'Uploading...'}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};