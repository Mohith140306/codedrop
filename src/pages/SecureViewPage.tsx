import React from 'react';
import { useParams } from 'react-router-dom';
import { SecureView } from '@/components/SecureView';

const SecureViewPage = () => {
  const { shareId } = useParams<{ shareId: string }>();

  if (!shareId) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Invalid Share Link</h1>
          <p className="text-muted-foreground mb-4">The share link appears to be invalid or corrupted.</p>
          <a href="/" className="text-primary hover:underline">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return <SecureView shareId={shareId} />;
};

export default SecureViewPage;