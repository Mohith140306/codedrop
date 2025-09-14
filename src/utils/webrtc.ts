export interface PeerConnection {
  pc: RTCPeerConnection;
  dataChannel: RTCDataChannel;
  roomCode: string;
}

export interface FileTransfer {
  fileName: string;
  fileSize: number;
  fileType: string;
  chunks: ArrayBuffer[];
  receivedSize: number;
}

const CHUNK_SIZE = 16 * 1024; // 16KB chunks

export class WebRTCManager {
  private pc: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private ws: WebSocket | null = null;
  private onProgress?: (progress: number) => void;
  private onComplete?: (file: File) => void;
  private onError?: (error: string) => void;
  private onConnected?: () => void;
  private currentTransfer: FileTransfer | null = null;
  private roomCode: string = '';

  constructor(
    onProgress?: (progress: number) => void,
    onComplete?: (file: File) => void,
    onError?: (error: string) => void,
    onConnected?: () => void
  ) {
    this.onProgress = onProgress;
    this.onComplete = onComplete;
    this.onError = onError;
    this.onConnected = onConnected;
  }

  private getSignalingUrl(): string {
    return `wss://zydavqlxprpigxehztnu.functions.supabase.co/webrtc-signaling`;
  }

  async createRoom(): Promise<string> {
    const roomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.roomCode = roomCode;
    
    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Create data channel for file transfer
    this.dataChannel = this.pc.createDataChannel('fileTransfer', {
      ordered: true
    });

    this.setupDataChannelHandlers(this.dataChannel);

    this.ws = new WebSocket(this.getSignalingUrl());
    
    return new Promise((resolve, reject) => {
      if (!this.ws) {
        reject(new Error('Failed to create WebSocket connection'));
        return;
      }

      this.ws.onopen = () => {
        this.ws!.send(JSON.stringify({ type: 'create-room', roomCode }));
      };

      this.ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'room-created') {
          resolve(roomCode);
        } else if (message.type === 'peer-joined') {
          // Peer has joined, create offer
          const offer = await this.pc!.createOffer();
          await this.pc!.setLocalDescription(offer);
          this.ws!.send(JSON.stringify({
            type: 'offer',
            roomCode,
            offer
          }));
        } else if (message.type === 'answer') {
          await this.pc!.setRemoteDescription(message.answer);
        } else if (message.type === 'ice-candidate') {
          await this.pc!.addIceCandidate(message.candidate);
        } else if (message.type === 'error') {
          reject(new Error(message.message));
        }
      };

      this.ws.onerror = () => {
        reject(new Error('WebSocket connection failed'));
      };

      this.pc!.onicecandidate = (event) => {
        if (event.candidate && this.ws) {
          this.ws.send(JSON.stringify({
            type: 'ice-candidate',
            roomCode,
            candidate: event.candidate
          }));
        }
      };

      setTimeout(() => reject(new Error('Room creation timeout')), 10000);
    });
  }

  async joinRoom(roomCode: string): Promise<void> {
    this.roomCode = roomCode;
    
    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    this.ws = new WebSocket(this.getSignalingUrl());
    
    return new Promise((resolve, reject) => {
      if (!this.ws) {
        reject(new Error('Failed to create WebSocket connection'));
        return;
      }

      this.ws.onopen = () => {
        this.ws!.send(JSON.stringify({ type: 'join-room', roomCode }));
      };

      this.ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'joined') {
          resolve();
        } else if (message.type === 'offer') {
          await this.pc!.setRemoteDescription(message.offer);
          const answer = await this.pc!.createAnswer();
          await this.pc!.setLocalDescription(answer);
          
          this.ws!.send(JSON.stringify({
            type: 'answer',
            roomCode,
            answer
          }));
        } else if (message.type === 'ice-candidate') {
          await this.pc!.addIceCandidate(message.candidate);
        } else if (message.type === 'error') {
          reject(new Error(message.message));
        }
      };

      this.ws.onerror = () => {
        reject(new Error('WebSocket connection failed'));
      };

      this.pc!.onicecandidate = (event) => {
        if (event.candidate && this.ws) {
          this.ws.send(JSON.stringify({
            type: 'ice-candidate',
            roomCode,
            candidate: event.candidate
          }));
        }
      };

      this.pc!.ondatachannel = (event) => {
        this.dataChannel = event.channel;
        this.setupDataChannelHandlers(this.dataChannel);
      };

      setTimeout(() => reject(new Error('Join room timeout')), 10000);
    });
  }

  private setupDataChannelHandlers(channel: RTCDataChannel) {
    channel.onopen = () => {
      console.log('Data channel opened');
      this.onConnected?.();
    };

    channel.onmessage = (event) => {
      this.handleDataChannelMessage(event.data);
    };

    channel.onerror = (error) => {
      console.error('Data channel error:', error);
      this.onError?.('Connection error occurred');
    };
  }

  private handleDataChannelMessage(data: string | ArrayBuffer) {
    if (typeof data === 'string') {
      const message = JSON.parse(data);
      
      if (message.type === 'file-info') {
        this.currentTransfer = {
          fileName: message.fileName,
          fileSize: message.fileSize,
          fileType: message.fileType,
          chunks: [],
          receivedSize: 0
        };
        this.onProgress?.(0);
      } else if (message.type === 'file-complete') {
        this.completeFileTransfer();
      }
    } else if (data instanceof ArrayBuffer && this.currentTransfer) {
      this.currentTransfer.chunks.push(data);
      this.currentTransfer.receivedSize += data.byteLength;
      
      const progress = (this.currentTransfer.receivedSize / this.currentTransfer.fileSize) * 100;
      this.onProgress?.(progress);
      
      if (this.currentTransfer.receivedSize >= this.currentTransfer.fileSize) {
        this.completeFileTransfer();
      }
    }
  }

  private completeFileTransfer() {
    if (!this.currentTransfer) return;
    
    const completeBuffer = new Uint8Array(this.currentTransfer.fileSize);
    let offset = 0;
    
    for (const chunk of this.currentTransfer.chunks) {
      completeBuffer.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    }
    
    const file = new File([completeBuffer], this.currentTransfer.fileName, {
      type: this.currentTransfer.fileType
    });
    
    this.onComplete?.(file);
    this.currentTransfer = null;
  }

  async sendFile(file: File): Promise<void> {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      throw new Error('Data channel not ready');
    }

    // Send file info first
    this.dataChannel.send(JSON.stringify({
      type: 'file-info',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    }));

    // Send file in chunks
    const arrayBuffer = await file.arrayBuffer();
    const totalChunks = Math.ceil(arrayBuffer.byteLength / CHUNK_SIZE);
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, arrayBuffer.byteLength);
      const chunk = arrayBuffer.slice(start, end);
      
      this.dataChannel.send(chunk);
      
      const progress = ((i + 1) / totalChunks) * 100;
      this.onProgress?.(progress);
      
      // Small delay to prevent overwhelming the connection
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Send completion message
    this.dataChannel.send(JSON.stringify({ type: 'file-complete' }));
  }

  disconnect() {
    this.dataChannel?.close();
    this.pc?.close();
    this.ws?.close();
    this.dataChannel = null;
    this.pc = null;
    this.ws = null;
  }
}

export const generateQRCode = (roomCode: string): string => {
  const url = `${window.location.origin}/get?room=${roomCode}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
};