import { supabase } from '@/integrations/supabase/client';
import { FileTransferManager } from './fileTransfer';

export interface FallbackFileMetadata {
  id: string;
  roomCode: string;
  filePath: string;
  filename: string;
  fileSize: number;
  fileType: string;
  checksum: string;
  expiresAt: string;
  createdAt: string;
}

export class FallbackStorageManager {
  private static instance: FallbackStorageManager;
  
  static getInstance(): FallbackStorageManager {
    if (!FallbackStorageManager.instance) {
      FallbackStorageManager.instance = new FallbackStorageManager();
    }
    return FallbackStorageManager.instance;
  }

  async uploadFallbackFile(file: File, roomCode: string): Promise<string> {
    const fileManager = FileTransferManager.getInstance();
    const checksum = await fileManager.calculateChecksum(file);
    
    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${roomCode}_${Date.now()}.${fileExt}`;
    
    // Upload file to fallback storage
    const { error: uploadError } = await supabase.storage
      .from('p2p-fallback')
      .upload(fileName, file);

    if (uploadError) {
      throw new Error(`Failed to upload fallback file: ${uploadError.message}`);
    }

    // Store metadata in database
    const { error: dbError } = await supabase
      .from('p2p_fallback_files')
      .insert({
        room_code: roomCode.toUpperCase(),
        file_path: fileName,
        filename: file.name,
        file_size: file.size,
        file_type: file.type,
        checksum: checksum,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      });

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('p2p-fallback')
        .remove([fileName]);
      
      throw new Error(`Failed to store fallback file metadata: ${dbError.message}`);
    }

    return roomCode;
  }

  async getFallbackFile(roomCode: string): Promise<FallbackFileMetadata | null> {
    const { data, error } = await supabase
      .rpc('get_fallback_file_by_room_code', {
        p_room_code: roomCode.toUpperCase()
      });

    if (error) {
      throw new Error(`Failed to get fallback file: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return null;
    }

    const fileData = data[0];
    return {
      id: fileData.id,
      roomCode: fileData.room_code,
      filePath: fileData.file_path,
      filename: fileData.filename,
      fileSize: fileData.file_size,
      fileType: fileData.file_type,
      checksum: fileData.checksum,
      expiresAt: fileData.expires_at,
      createdAt: fileData.created_at,
    };
  }

  async downloadFallbackFile(filePath: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from('p2p-fallback')
      .download(filePath);

    if (error) {
      throw new Error(`Failed to download fallback file: ${error.message}`);
    }

    return data;
  }

  async verifyFileIntegrity(file: File, expectedChecksum: string): Promise<boolean> {
    const fileManager = FileTransferManager.getInstance();
    const actualChecksum = await fileManager.calculateChecksum(file);
    return actualChecksum === expectedChecksum;
  }

  async cleanupExpiredFiles(): Promise<void> {
    const { error } = await supabase
      .rpc('cleanup_expired_fallback_files');

    if (error) {
      console.error('Failed to cleanup expired fallback files:', error);
    }
  }

  getDownloadUrl(filePath: string): string {
    const { data } = supabase.storage
      .from('p2p-fallback')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }
}