export class FileEncryption {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;

  static async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  static async exportKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }

  static async importKey(keyString: string): Promise<CryptoKey> {
    const keyData = new Uint8Array(
      atob(keyString).split('').map(char => char.charCodeAt(0))
    );
    
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: this.ALGORITHM },
      false,
      ['encrypt', 'decrypt']
    );
  }

  static async encryptChunk(data: ArrayBuffer, key: CryptoKey): Promise<{
    encrypted: ArrayBuffer;
    iv: Uint8Array;
  }> {
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      data
    );

    return { encrypted, iv };
  }

  static async decryptChunk(
    encryptedData: ArrayBuffer,
    key: CryptoKey,
    iv: Uint8Array
  ): Promise<ArrayBuffer> {
    return await crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      encryptedData
    );
  }

  static async encryptFile(file: File, key: CryptoKey): Promise<{
    encryptedChunks: Array<{ data: ArrayBuffer; iv: Uint8Array }>;
    metadata: any;
  }> {
    const chunkSize = 256 * 1024; // 256KB chunks
    const encryptedChunks: Array<{ data: ArrayBuffer; iv: Uint8Array }> = [];
    
    for (let offset = 0; offset < file.size; offset += chunkSize) {
      const chunk = file.slice(offset, offset + chunkSize);
      const chunkBuffer = await chunk.arrayBuffer();
      const { encrypted, iv } = await this.encryptChunk(chunkBuffer, key);
      encryptedChunks.push({ data: encrypted, iv });
    }

    return {
      encryptedChunks,
      metadata: {
        originalSize: file.size,
        name: file.name,
        type: file.type,
        lastModified: file.lastModified,
      },
    };
  }

  static async decryptFile(
    encryptedChunks: Array<{ data: ArrayBuffer; iv: Uint8Array }>,
    key: CryptoKey,
    metadata: any
  ): Promise<File> {
    const decryptedChunks: ArrayBuffer[] = [];
    
    for (const chunk of encryptedChunks) {
      const decrypted = await this.decryptChunk(chunk.data, key, chunk.iv);
      decryptedChunks.push(decrypted);
    }

    const blob = new Blob(decryptedChunks, { type: metadata.type });
    return new File([blob], metadata.name, {
      type: metadata.type,
      lastModified: metadata.lastModified,
    });
  }
}