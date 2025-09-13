import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface Room {
  code: string;
  creator: WebSocket | null;
  peer: WebSocket | null;
  createdAt: number;
}

const rooms = new Map<string, Room>();
const ROOM_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Clean up expired rooms
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.createdAt > ROOM_TIMEOUT) {
      room.creator?.close();
      room.peer?.close();
      rooms.delete(code);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.onopen = () => {
    console.log("WebSocket connection opened");
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      handleMessage(socket, message);
    } catch (error) {
      console.error("Error parsing message:", error);
      socket.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  };

  socket.onclose = () => {
    // Remove socket from any room it was in
    for (const [code, room] of rooms.entries()) {
      if (room.creator === socket) {
        room.creator = null;
        room.peer?.send(JSON.stringify({ type: 'peer-disconnected' }));
      } else if (room.peer === socket) {
        room.peer = null;
        room.creator?.send(JSON.stringify({ type: 'peer-disconnected' }));
      }
      
      // Clean up empty rooms
      if (!room.creator && !room.peer) {
        rooms.delete(code);
      }
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return response;
});

function handleMessage(socket: WebSocket, message: any) {
  const { type, roomCode } = message;

  switch (type) {
    case 'create-room':
      handleCreateRoom(socket, roomCode);
      break;
      
    case 'join-room':
      handleJoinRoom(socket, roomCode);
      break;
      
    case 'offer':
      handleOffer(socket, message);
      break;
      
    case 'answer':
      handleAnswer(socket, message);
      break;
      
    case 'ice-candidate':
      handleIceCandidate(socket, message);
      break;
      
    default:
      socket.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
  }
}

function handleCreateRoom(socket: WebSocket, roomCode: string) {
  if (!roomCode || rooms.has(roomCode)) {
    socket.send(JSON.stringify({ type: 'error', message: 'Room code already exists or invalid' }));
    return;
  }

  const room: Room = {
    code: roomCode,
    creator: socket,
    peer: null,
    createdAt: Date.now()
  };

  rooms.set(roomCode, room);
  socket.send(JSON.stringify({ type: 'room-created', roomCode }));
  
  console.log(`Room created: ${roomCode}`);
}

function handleJoinRoom(socket: WebSocket, roomCode: string) {
  const room = rooms.get(roomCode);
  
  if (!room) {
    socket.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
    return;
  }

  if (room.peer) {
    socket.send(JSON.stringify({ type: 'error', message: 'Room is full' }));
    return;
  }

  room.peer = socket;
  socket.send(JSON.stringify({ type: 'joined', roomCode }));
  room.creator?.send(JSON.stringify({ type: 'peer-joined' }));
  
  console.log(`Peer joined room: ${roomCode}`);
}

function handleOffer(socket: WebSocket, message: any) {
  const { roomCode, offer } = message;
  const room = rooms.get(roomCode);
  
  if (!room || room.creator !== socket) {
    socket.send(JSON.stringify({ type: 'error', message: 'Invalid room or unauthorized' }));
    return;
  }

  if (room.peer) {
    room.peer.send(JSON.stringify({ type: 'offer', offer }));
  }
}

function handleAnswer(socket: WebSocket, message: any) {
  const { roomCode, answer } = message;
  const room = rooms.get(roomCode);
  
  if (!room || room.peer !== socket) {
    socket.send(JSON.stringify({ type: 'error', message: 'Invalid room or unauthorized' }));
    return;
  }

  if (room.creator) {
    room.creator.send(JSON.stringify({ type: 'answer', answer }));
  }
}

function handleIceCandidate(socket: WebSocket, message: any) {
  const { roomCode, candidate } = message;
  const room = rooms.get(roomCode);
  
  if (!room) {
    socket.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
    return;
  }

  // Forward ICE candidate to the other peer
  if (room.creator === socket && room.peer) {
    room.peer.send(JSON.stringify({ type: 'ice-candidate', candidate }));
  } else if (room.peer === socket && room.creator) {
    room.creator.send(JSON.stringify({ type: 'ice-candidate', candidate }));
  }
}