export interface FileTransferConfig {
  maxCloudFileSize: number; // 100MB in bytes
  chunkSize: number; // 256KB chunks for P2P
  maxRetries: number;
  connectionTimeout: number;
}

export const FILE_TRANSFER_CONFIG: FileTransferConfig = {
  maxCloudFileSize: 100 * 1024 * 1024, // 100MB
  chunkSize: 256 * 1024, // 256KB
  maxRetries: 3,
  connectionTimeout: 30000, // 30 seconds
};

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  checksum?: string;
}

export interface TransferProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  speed: number; // bytes per second
  estimatedTimeRemaining: number; // seconds
}

export class FileTransferManager {
  private static instance: FileTransferManager;
  private transferMode: 'cloud' | 'p2p' = 'cloud';
  
  static getInstance(): FileTransferManager {
    if (!FileTransferManager.instance) {
      FileTransferManager.instance = new FileTransferManager();
    }
    return FileTransferManager.instance;
  }

  determineTransferMode(fileSize: number): 'cloud' | 'p2p' {
    return fileSize <= FILE_TRANSFER_CONFIG.maxCloudFileSize ? 'cloud' : 'p2p';
  }

  async calculateChecksum(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  formatTransferSpeed(bytesPerSecond: number): string {
    return `${this.formatFileSize(bytesPerSecond)}/s`;
  }

  formatTimeRemaining(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  }
}