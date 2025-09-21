import { FileEncryption } from './encryption';
import { FileTransferManager, TransferProgress, FILE_TRANSFER_CONFIG } from './fileTransfer';

export interface P2PTransferOptions {
  onProgress?: (progress: TransferProgress) => void;
  onComplete?: (file: File) => void;
  onError?: (error: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  enableEncryption?: boolean;
}

export interface FileChunk {
  index: number;
  data: ArrayBuffer;
  iv?: Uint8Array;
  isLast: boolean;
  checksum: string;
}

export interface FileTransferMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  totalChunks: number;
  chunkSize: number;
  encrypted: boolean;
  encryptionKey?: string;
  checksum: string;
}

export class P2PFileTransfer {
  private pc: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private ws: WebSocket | null = null;
  private roomCode: string = '';
  private isInitiator: boolean = false;
  private options: P2PTransferOptions;
  
  // Transfer state
  private currentTransfer: {
    metadata: FileTransferMetadata;
    receivedChunks: Map<number, FileChunk>;
    startTime: number;
    lastProgressTime: number;
    bytesReceived: number;
  } | null = null;

  private encryptionKey: CryptoKey | null = null;

  constructor(options: P2PTransferOptions = {}) {
    this.options = {
      enableEncryption: true,
      ...options,
    };
  }

  private getSignalingUrl(): string {
    return `wss://zydavqlxprpigxehztnu.functions.supabase.co/webrtc-signaling`;
  }

  async createRoom(): Promise<string> {
    const roomCode = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.roomCode = roomCode;
    this.isInitiator = true;
    
    await this.initializePeerConnection();
    await this.connectToSignalingServer();
    
    return new Promise((resolve, reject) => {
      if (!this.ws) {
        reject(new Error('Failed to create WebSocket connection'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Room creation timeout'));
      }, FILE_TRANSFER_CONFIG.connectionTimeout);

      this.ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'room-created') {
          clearTimeout(timeout);
          resolve(roomCode);
        } else if (message.type === 'error') {
          clearTimeout(timeout);
          reject(new Error(message.message));
        } else {
          await this.handleSignalingMessage(message);
        }
      };

      this.ws.send(JSON.stringify({ type: 'create-room', roomCode }));
    });
  }

  async joinRoom(roomCode: string): Promise<void> {
    this.roomCode = roomCode.toUpperCase();
    this.isInitiator = false;
    
    await this.initializePeerConnection();
    await this.connectToSignalingServer();
    
    return new Promise((resolve, reject) => {
      if (!this.ws) {
        reject(new Error('Failed to create WebSocket connection'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Join room timeout'));
      }, FILE_TRANSFER_CONFIG.connectionTimeout);

      this.ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'joined') {
          clearTimeout(timeout);
          resolve();
        } else if (message.type === 'error') {
          clearTimeout(timeout);
          reject(new Error(message.message));
        } else {
          await this.handleSignalingMessage(message);
        }
      };

      this.ws.send(JSON.stringify({ type: 'join-room', roomCode: this.roomCode }));
    });
  }

  private async initializePeerConnection(): Promise<void> {
    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ]
    });

    this.pc.onicecandidate = (event) => {
      if (event.candidate && this.ws) {
        this.ws.send(JSON.stringify({
          type: 'ice-candidate',
          roomCode: this.roomCode,
          candidate: event.candidate
        }));
      }
    };

    this.pc.onconnectionstatechange = () => {
      if (this.pc?.connectionState === 'connected') {
        this.options.onConnected?.();
      } else if (this.pc?.connectionState === 'disconnected' || 
                 this.pc?.connectionState === 'failed') {
        this.options.onDisconnected?.();
      }
    };

    if (this.isInitiator) {
      this.dataChannel = this.pc.createDataChannel('fileTransfer', {
        ordered: true,
        maxRetransmits: 3
      });
      this.setupDataChannelHandlers(this.dataChannel);
    } else {
      this.pc.ondatachannel = (event) => {
        this.dataChannel = event.channel;
        this.setupDataChannelHandlers(this.dataChannel);
      };
    }

    // Generate encryption key if enabled
    if (this.options.enableEncryption) {
      this.encryptionKey = await FileEncryption.generateKey();
    }
  }

  private async connectToSignalingServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.getSignalingUrl());
      
      this.ws.onopen = () => resolve();
      this.ws.onerror = () => reject(new Error('WebSocket connection failed'));
      
      this.ws.onclose = () => {
        this.options.onDisconnected?.();
      };
    });
  }

  private async handleSignalingMessage(message: any): Promise<void> {
    switch (message.type) {
      case 'peer-joined':
        if (this.isInitiator) {
          const offer = await this.pc!.createOffer();
          await this.pc!.setLocalDescription(offer);
          this.ws!.send(JSON.stringify({
            type: 'offer',
            roomCode: this.roomCode,
            offer,
            encryptionKey: this.options.enableEncryption ? 
              await FileEncryption.exportKey(this.encryptionKey!) : undefined
          }));
        }
        break;

      case 'offer':
        await this.pc!.setRemoteDescription(message.offer);
        if (message.encryptionKey && this.options.enableEncryption) {
          this.encryptionKey = await FileEncryption.importKey(message.encryptionKey);
        }
        const answer = await this.pc!.createAnswer();
        await this.pc!.setLocalDescription(answer);
        this.ws!.send(JSON.stringify({
          type: 'answer',
          roomCode: this.roomCode,
          answer
        }));
        break;

      case 'answer':
        await this.pc!.setRemoteDescription(message.answer);
        break;

      case 'ice-candidate':
        await this.pc!.addIceCandidate(message.candidate);
        break;
    }
  }

  private setupDataChannelHandlers(channel: RTCDataChannel): void {
    channel.onopen = () => {
      console.log('Data channel opened');
      this.options.onConnected?.();
    };

    channel.onmessage = async (event) => {
      await this.handleDataChannelMessage(event.data);
    };

    channel.onerror = (error) => {
      console.error('Data channel error:', error);
      this.options.onError?.('Data channel error occurred');
    };

    channel.onclose = () => {
      this.options.onDisconnected?.();
    };
  }

  private async handleDataChannelMessage(data: string | ArrayBuffer): Promise<void> {
    if (typeof data === 'string') {
      const message = JSON.parse(data);
      
      if (message.type === 'file-metadata') {
        this.currentTransfer = {
          metadata: message.metadata,
          receivedChunks: new Map(),
          startTime: Date.now(),
          lastProgressTime: Date.now(),
          bytesReceived: 0
        };
        
        if (message.metadata.encrypted && message.metadata.encryptionKey) {
          this.encryptionKey = await FileEncryption.importKey(message.metadata.encryptionKey);
        }
        
        this.options.onProgress?.({
          bytesTransferred: 0,
          totalBytes: this.currentTransfer.metadata.fileSize,
          percentage: 0,
          speed: 0,
          estimatedTimeRemaining: 0
        });
      }
    } else if (data instanceof ArrayBuffer && this.currentTransfer) {
      await this.handleFileChunk(data);
    }
  }

  private async handleFileChunk(chunkData: ArrayBuffer): Promise<void> {
    if (!this.currentTransfer) return;

    // Parse chunk header (first 16 bytes contain metadata)
    const headerView = new DataView(chunkData, 0, 16);
    const chunkIndex = headerView.getUint32(0);
    const isLast = headerView.getUint8(4) === 1;
    const ivLength = headerView.getUint8(5);
    
    let dataStart = 16;
    let iv: Uint8Array | undefined;
    
    if (ivLength > 0) {
      iv = new Uint8Array(chunkData, dataStart, ivLength);
      dataStart += ivLength;
    }
    
    const actualData = chunkData.slice(dataStart);
    
    // Decrypt if needed
    let finalData = actualData;
    if (this.currentTransfer.metadata.encrypted && this.encryptionKey && iv) {
      finalData = await FileEncryption.decryptChunk(actualData, this.encryptionKey, iv);
    }
    
    // Calculate checksum for verification
    const checksumBuffer = await crypto.subtle.digest('SHA-256', finalData);
    const checksum = Array.from(new Uint8Array(checksumBuffer))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    
    const chunk: FileChunk = {
      index: chunkIndex,
      data: finalData,
      iv,
      isLast,
      checksum
    };
    
    this.currentTransfer.receivedChunks.set(chunkIndex, chunk);
    this.currentTransfer.bytesReceived += finalData.byteLength;
    
    // Update progress
    const now = Date.now();
    const elapsed = (now - this.currentTransfer.startTime) / 1000;
    const speed = elapsed > 0 ? this.currentTransfer.bytesReceived / elapsed : 0;
    const remaining = speed > 0 ? 
      (this.currentTransfer.metadata.fileSize - this.currentTransfer.bytesReceived) / speed : 0;
    
    this.options.onProgress?.({
      bytesTransferred: this.currentTransfer.bytesReceived,
      totalBytes: this.currentTransfer.metadata.fileSize,
      percentage: (this.currentTransfer.bytesReceived / this.currentTransfer.metadata.fileSize) * 100,
      speed,
      estimatedTimeRemaining: remaining
    });
    
    // Check if transfer is complete
    if (this.currentTransfer.receivedChunks.size === this.currentTransfer.metadata.totalChunks) {
      await this.assembleFile();
    }
  }

  private async assembleFile(): Promise<void> {
    if (!this.currentTransfer) return;
    
    const chunks: ArrayBuffer[] = [];
    
    // Sort chunks by index and assemble
    for (let i = 0; i < this.currentTransfer.metadata.totalChunks; i++) {
      const chunk = this.currentTransfer.receivedChunks.get(i);
      if (!chunk) {
        this.options.onError?.('Missing file chunk during assembly');
        return;
      }
      chunks.push(chunk.data);
    }
    
    const blob = new Blob(chunks, { type: this.currentTransfer.metadata.fileType });
    const file = new File([blob], this.currentTransfer.metadata.fileName, {
      type: this.currentTransfer.metadata.fileType
    });
    
    // Verify file integrity
    const manager = FileTransferManager.getInstance();
    const checksum = await manager.calculateChecksum(file);
    
    if (checksum !== this.currentTransfer.metadata.checksum) {
      this.options.onError?.('File integrity check failed');
      return;
    }
    
    this.options.onComplete?.(file);
    this.currentTransfer = null;
  }

  async sendFile(file: File): Promise<void> {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      throw new Error('Data channel not ready');
    }

    const manager = FileTransferManager.getInstance();
    const checksum = await manager.calculateChecksum(file);
    
    const metadata: FileTransferMetadata = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      totalChunks: Math.ceil(file.size / FILE_TRANSFER_CONFIG.chunkSize),
      chunkSize: FILE_TRANSFER_CONFIG.chunkSize,
      encrypted: this.options.enableEncryption || false,
      encryptionKey: this.options.enableEncryption && this.encryptionKey ? 
        await FileEncryption.exportKey(this.encryptionKey) : undefined,
      checksum
    };

    // Send metadata
    this.dataChannel.send(JSON.stringify({
      type: 'file-metadata',
      metadata
    }));

    // Send file chunks
    const startTime = Date.now();
    let bytesSent = 0;
    
    for (let i = 0; i < metadata.totalChunks; i++) {
      const start = i * FILE_TRANSFER_CONFIG.chunkSize;
      const end = Math.min(start + FILE_TRANSFER_CONFIG.chunkSize, file.size);
      const chunk = file.slice(start, end);
      const chunkBuffer = await chunk.arrayBuffer();
      
      let finalData = chunkBuffer;
      let iv: Uint8Array | undefined;
      
      // Encrypt if needed
      if (this.options.enableEncryption && this.encryptionKey) {
        const encrypted = await FileEncryption.encryptChunk(chunkBuffer, this.encryptionKey);
        finalData = encrypted.encrypted;
        iv = encrypted.iv;
      }
      
      // Create chunk header
      const headerSize = 16 + (iv ? iv.length : 0);
      const chunkData = new ArrayBuffer(headerSize + finalData.byteLength);
      const headerView = new DataView(chunkData);
      
      headerView.setUint32(0, i); // chunk index
      headerView.setUint8(4, i === metadata.totalChunks - 1 ? 1 : 0); // is last
      headerView.setUint8(5, iv ? iv.length : 0); // IV length
      
      if (iv) {
        new Uint8Array(chunkData, 16, iv.length).set(iv);
      }
      
      new Uint8Array(chunkData, headerSize).set(new Uint8Array(finalData));
      
      this.dataChannel.send(chunkData);
      
      bytesSent += chunkBuffer.byteLength;
      
      // Update progress
      const elapsed = (Date.now() - startTime) / 1000;
      const speed = elapsed > 0 ? bytesSent / elapsed : 0;
      const remaining = speed > 0 ? (file.size - bytesSent) / speed : 0;
      
      this.options.onProgress?.({
        bytesTransferred: bytesSent,
        totalBytes: file.size,
        percentage: (bytesSent / file.size) * 100,
        speed,
        estimatedTimeRemaining: remaining
      });
      
      // Small delay to prevent overwhelming the connection
      await new Promise(resolve => setTimeout(resolve, 1));
    }
  }

  disconnect(): void {
    this.dataChannel?.close();
    this.pc?.close();
    this.ws?.close();
    
    this.dataChannel = null;
    this.pc = null;
    this.ws = null;
    this.currentTransfer = null;
  }
}