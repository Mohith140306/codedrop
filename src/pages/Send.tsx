import React from 'react';
import { Send } from 'lucide-react';
import { UploadZone } from '@/components/UploadZone';

const SendPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              <Send className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Send Files & Code
            </h1>
            <p className="text-xl text-muted-foreground">
              Upload your files or paste your code, set a password, and share securely
            </p>
          </div>
          
          <div className="animate-scale-in">
            <UploadZone onUpload={(data) => {
              // Store the shared content in localStorage with the password
              const storedItems = JSON.parse(localStorage.getItem('sharedItems') || '[]');
              const newItem = {
                ...data,
                id: Date.now().toString(),
                createdAt: new Date().toISOString()
              };
              storedItems.push(newItem);
              localStorage.setItem('sharedItems', JSON.stringify(storedItems));
              
              // Show success message
              alert(`Content shared successfully! Password: ${data.password}`);
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendPage;