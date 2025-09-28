import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};
const CHUNK_SIZE = 64 * 1024; // 64 KB
const BUFFER_THRESHOLD = 1024 * 1024; // 1 MB

// Data Channel Message Types
const MSG_TYPE = {
  METADATA: 0,
  CHUNK: 1,
  ACK: 2,
  TRANSFER_COMPLETE: 3,
  CANCEL: 4,
};

export const useWebRTC = () => {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  // Connection State
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Transfer State
  const fileQueueRef = useRef<File[]>([]);
  const currentFileRef = useRef<{ file: File; chunks: ArrayBuffer[]; totalChunks: number; } | null>(null);
  const receivedFileChunksRef = useRef<Map<number, ArrayBuffer>>(new Map());
  const currentReceivedFileRef = useRef<{ name: string; size: number; totalChunks: number; } | null>(null);
  const isTransferringRef = useRef(false);

  // Progress State
  const [transferProgress, setTransferProgress] = useState(0);
  const [transferSpeed, setTransferSpeed] = useState(0);
  const [eta, setEta] = useState(0);
  const [receivedFiles, setReceivedFiles] = useState<File[]>([]);

  const totalTransferSizeRef = useRef(0);
  const totalBytesSentRef = useRef(0);
  const lastTimestampRef = useRef(0);

  // Chunk Management
  const lastSentChunkIndex = useRef(-1);
  const lastAckedChunkIndex = useRef(-1);
  const transferTimerRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback((isManual = false) => {
    if (transferTimerRef.current) clearTimeout(transferTimerRef.current);
    if (isManual && dataChannelRef.current?.readyState === 'open') {
        dataChannelRef.current.send(new Uint8Array([MSG_TYPE.CANCEL]));
    }
    isTransferringRef.current = false;
    pcRef.current?.close();
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    // Reset all states
    pcRef.current = null;
    channelRef.current = null;
    dataChannelRef.current = null;
    setIsConnected(false);
    setError(null);
    setIsLoading(false);
    setTransferProgress(0);
    setTransferSpeed(0);
    setEta(0);
    if(isManual) setReceivedFiles([]);
  }, []);

  const sendNextChunk = useCallback(() => {
    if (!isTransferringRef.current || !currentFileRef.current) return;

    // Basic congestion control: wait for ACK before sending more
    if (lastSentChunkIndex.current > lastAckedChunkIndex.current + 10) {
        return;
    }

    const dataChannel = dataChannelRef.current;
    if (dataChannel && dataChannel.readyState === 'open' && dataChannel.bufferedAmount < BUFFER_THRESHOLD) {
        const nextChunkIndex = lastSentChunkIndex.current + 1;
        if (nextChunkIndex >= currentFileRef.current.totalChunks) {
            return; // All chunks for this file are sent
        }

        lastSentChunkIndex.current = nextChunkIndex;
        const chunk = currentFileRef.current.chunks[nextChunkIndex];

        const payload = new Uint8Array(1 + 4 + chunk.byteLength);
        payload[0] = MSG_TYPE.CHUNK;
        new DataView(payload.buffer).setUint32(1, nextChunkIndex, false);
        payload.set(new Uint8Array(chunk), 5);

        dataChannel.send(payload);

        // Update total bytes sent for progress calculation
        totalBytesSentRef.current += chunk.byteLength;
        const now = Date.now();
        const timeDiff = (now - lastTimestampRef.current) / 1000;
        if (timeDiff > 1) { // Update speed every second
            const speed = (totalBytesSentRef.current - (totalBytesSentRef.current - chunk.byteLength * 10)) / timeDiff / 1024 / 1024;
            setTransferSpeed(speed);
            const remainingBytes = totalTransferSizeRef.current - totalBytesSentRef.current;
            setEta(speed > 0 ? remainingBytes / (speed * 1024 * 1024) : Infinity);
            lastTimestampRef.current = now;
        }
        setTransferProgress((totalBytesSentRef.current / totalTransferSizeRef.current) * 100);

        transferTimerRef.current = setTimeout(sendNextChunk, 0); // Schedule next chunk
    }
  }, []);

  const processNextFileInQueue = useCallback(() => {
    if (fileQueueRef.current.length === 0) {
      dataChannelRef.current?.send(new Uint8Array([MSG_TYPE.TRANSFER_COMPLETE]));
      isTransferringRef.current = false;
      setEta(0);
      return;
    }
    const file = fileQueueRef.current.shift()!;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const chunks = Array.from({ length: totalChunks }, (_, i) =>
        file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
    );

    Promise.all(chunks.map(chunk => chunk.arrayBuffer())).then(buffers => {
        currentFileRef.current = { file, chunks: buffers, totalChunks };
        const metadata = { name: file.name, size: file.size, totalChunks };
        const metadataString = JSON.stringify(metadata);
        const payload = new TextEncoder().encode(metadataString);
        const finalPayload = new Uint8Array(1 + payload.byteLength);
        finalPayload[0] = MSG_TYPE.METADATA;
        finalPayload.set(payload, 1);

        dataChannelRef.current?.send(finalPayload);

        lastSentChunkIndex.current = -1;
        lastAckedChunkIndex.current = -1;
        sendNextChunk(); // Start sending chunks for this file
    });
  }, [sendNextChunk]);

  const handleDataChannelMessage = useCallback((event: MessageEvent) => {
    const data = new Uint8Array(event.data);
    const type = data[0];

    switch(type) {
      case MSG_TYPE.METADATA: {
        const metadataString = new TextDecoder().decode(data.slice(1));
        currentReceivedFileRef.current = JSON.parse(metadataString);
        receivedFileChunksRef.current.clear();
        break;
      }
      case MSG_TYPE.CHUNK: {
        const chunkIndex = new DataView(data.buffer).getUint32(1, false);
        const chunk = data.slice(5);
        receivedFileChunksRef.current.set(chunkIndex, chunk);

        const ackPayload = new Uint8Array(5);
        ackPayload[0] = MSG_TYPE.ACK;
        new DataView(ackPayload.buffer).setUint32(1, chunkIndex, false);
        dataChannelRef.current?.send(ackPayload);

        if (currentReceivedFileRef.current) {
            totalBytesSentRef.current += chunk.byteLength;
            setTransferProgress((totalBytesSentRef.current / totalTransferSizeRef.current) * 100);

            if (receivedFileChunksRef.current.size === currentReceivedFileRef.current.totalChunks) {
                const sortedChunks = Array.from(receivedFileChunksRef.current.entries()).sort((a,b) => a[0] - b[0]).map(entry => entry[1]);
                const fileBlob = new Blob(sortedChunks);
                const file = new File([fileBlob], currentReceivedFileRef.current.name);
                setReceivedFiles(prev => [...prev, file]);
            }
        }
        break;
      }
      case MSG_TYPE.ACK: {
        const ackedIndex = new DataView(data.buffer).getUint32(1, false);
        if(ackedIndex > lastAckedChunkIndex.current) {
            lastAckedChunkIndex.current = ackedIndex;
        }
        if(ackedIndex === currentFileRef.current!.totalChunks - 1) {
            processNextFileInQueue(); // Last chunk of file acked, send next file
        } else {
            sendNextChunk();
        }
        break;
      }
      case MSG_TYPE.TRANSFER_COMPLETE:
        isTransferringRef.current = false;
        setEta(0);
        break;
      case MSG_TYPE.CANCEL:
        cleanup(false);
        setError("Transfer cancelled by peer.");
        break;
    }
  }, [processNextFileInQueue, sendNextChunk, cleanup]);

  const setupDataChannel = (channel: RTCDataChannel) => {
    channel.binaryType = 'arraybuffer';
    channel.onmessage = handleDataChannelMessage;
  };

  const startFileTransfer = (files: File[]) => {
    if (!files.length || isTransferringRef.current) return;
    fileQueueRef.current = [...files];
    totalTransferSizeRef.current = files.reduce((sum, file) => sum + file.size, 0);
    totalBytesSentRef.current = 0;
    isTransferringRef.current = true;
    lastTimestampRef.current = Date.now();
    processNextFileInQueue();
  };

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pc.onicecandidate = (event) => { if (event.candidate) channelRef.current?.send({ type: 'broadcast', event: 'ice-candidate', payload: event.candidate }); };
    pc.onconnectionstatechange = () => {
      setIsConnected(pc.connectionState === 'connected');
      if (['failed', 'disconnected', 'closed'].includes(pc.connectionState)) cleanup();
    };
    pc.ondatachannel = (event) => { dataChannelRef.current = event.channel; setupDataChannel(event.channel); };
    pcRef.current = pc;
    return pc;
  }, [cleanup]);

  const setupSignaling = useCallback(async (roomId: string, role: 'sender' | 'receiver') => {
    setIsLoading(true);
    const pc = createPeerConnection();
    if (role === 'sender') setupDataChannel(pc.createDataChannel('file-transfer'));
    const channel = supabase.channel(roomId, { config: { broadcast: { self: false } } });
    channelRef.current = channel;

    channel.on('broadcast', { event: 'ice-candidate' }, ({ payload }) => { pc.addIceCandidate(new RTCIceCandidate(payload)); });

    if (role === 'sender') {
      channel.on('broadcast', { event: 'answer' }, async ({ payload }) => { await pc.setRemoteDescription(new RTCSessionDescription(payload)); setIsLoading(false); });
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      channel.subscribe(status => { if (status === 'SUBSCRIBED') channel.send({ type: 'broadcast', event: 'offer', payload: offer }); });
    } else { // receiver
      channel.on('broadcast', { event: 'offer' }, async ({ payload }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(payload));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await channel.send({ type: 'broadcast', event: 'answer', payload: answer });
        setIsLoading(false);
      });
      channel.subscribe();
    }
  }, [createPeerConnection]);

  const generateRoom = async (files: File[]): Promise<string> => {
    setIsLoading(true);
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const file = files[0];
    if (!file) {
      setError("No file selected to generate a code.");
      setIsLoading(false);
      return "";
    }

    const { error: insertError } = await supabase.from('p2p_fallback_files').insert({
      room_code: roomCode,
      filename: file.name,
      file_size: file.size,
      file_type: file.type,
      file_path: `p2p/${roomCode}/${file.name}`,
      checksum: 'none',
    });

    if (insertError) {
      setError(`Database error: Could not create room. ${insertError.message}`);
      setIsLoading(false);
      return "";
    }

    await setupSignaling(roomCode, 'sender');
    return roomCode;
  };

  const joinRoom = async (roomCode: string) => {
    setIsLoading(true);

    const { data, error } = await supabase.rpc('get_fallback_file_by_room_code', {
      p_room_code: roomCode,
    });

    if (error || !data || data.length === 0) {
      setError('Room not found or has expired. Please check the code and try again.');
      setIsLoading(false);
      return;
    }
    await setupSignaling(roomCode, 'receiver');
  };

  useEffect(() => { return () => { cleanup(true); }; }, [cleanup]);

  return { isConnected, error, isLoading, generateRoom, joinRoom, startFileTransfer, transferProgress, transferSpeed, eta, receivedFiles, cancelTransfer: () => cleanup(true) };
};