import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: '50mb' }));

interface PeerDevice {
  name: string;
  type: 'pc' | 'mobile';
  os: string;
  browser: string;
}

interface PeerConnection {
  ws: WebSocket;
  id: string;
  roomId: string;
  device: PeerDevice;
  joinedAt: number;
}

// In-memory active rooms: roomId -> Map<peerId, PeerConnection>
const rooms = new Map<string, Map<string, PeerConnection>>();

function generateRoomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude confusing chars like 0, O, 1, I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Health & room helper APIs
app.get('/api/health', (_req, res) => {
  let totalPeers = 0;
  for (const peers of rooms.values()) {
    totalPeers += peers.size;
  }
  res.json({
    status: 'ok',
    roomsCount: rooms.size,
    peersCount: totalPeers,
    timestamp: Date.now(),
  });
});

app.get('/api/new-room', (_req, res) => {
  let roomId = generateRoomCode();
  while (rooms.has(roomId) && (rooms.get(roomId)?.size || 0) > 0) {
    roomId = generateRoomCode();
  }
  res.json({ roomId });
});

app.get('/api/room/:roomId', (req, res) => {
  const roomId = req.params.roomId.toUpperCase();
  const room = rooms.get(roomId);
  const peers = room
    ? Array.from(room.values()).map((p) => ({
        id: p.id,
        device: p.device,
        joinedAt: p.joinedAt,
      }))
    : [];
  res.json({ roomId, active: !!room, peerCount: peers.length, peers });
});

// WebSocket Setup
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const url = request.url || '';
  const pathname = url.split('?')[0];

  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
  // Allow Vite HMR to handle its own upgrades if any
});

wss.on('connection', (ws: WebSocket) => {
  let currentPeer: PeerConnection | null = null;

  const send = (data: any) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(data));
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    }
  };

  const removeCurrentPeer = () => {
    if (!currentPeer) return;
    const { roomId, id } = currentPeer;
    const room = rooms.get(roomId);
    if (room) {
      room.delete(id);
      // Notify remaining peers
      for (const peer of room.values()) {
        try {
          if (peer.ws.readyState === WebSocket.OPEN) {
            peer.ws.send(
              JSON.stringify({
                type: 'peer_left',
                peerId: id,
                remainingPeers: room.size,
              })
            );
          }
        } catch {
          // ignore
        }
      }
      if (room.size === 0) {
        rooms.delete(roomId);
      }
    }
    currentPeer = null;
  };

  ws.on('message', (raw) => {
    try {
      const message = JSON.parse(raw.toString());

      switch (message.type) {
        case 'join': {
          const roomId = (message.roomId || '').toString().trim().toUpperCase();
          const peerId = (message.peerId || `peer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
          const device: PeerDevice = message.device || {
            name: 'Device',
            type: 'pc',
            os: 'Unknown',
            browser: 'Unknown',
          };

          if (currentPeer) {
            removeCurrentPeer();
          }

          if (!rooms.has(roomId)) {
            rooms.set(roomId, new Map());
          }
          const room = rooms.get(roomId)!;

          currentPeer = {
            ws,
            id: peerId,
            roomId,
            device,
            joinedAt: Date.now(),
          };
          room.set(peerId, currentPeer);

          // Get list of existing peers in this room
          const existingPeers = Array.from(room.values())
            .filter((p) => p.id !== peerId)
            .map((p) => ({
              id: p.id,
              device: p.device,
              joinedAt: p.joinedAt,
            }));

          // Confirm join to the connecting client
          send({
            type: 'joined',
            roomId,
            peerId,
            peers: existingPeers,
          });

          // Notify existing peers about this new peer
          for (const peer of room.values()) {
            if (peer.id !== peerId && peer.ws.readyState === WebSocket.OPEN) {
              peer.ws.send(
                JSON.stringify({
                  type: 'peer_joined',
                  peer: {
                    id: peerId,
                    device,
                    joinedAt: currentPeer.joinedAt,
                  },
                })
              );
            }
          }
          break;
        }

        case 'signal': {
          if (!currentPeer) return;
          const { targetId, data } = message;
          const room = rooms.get(currentPeer.roomId);
          if (room && targetId) {
            const targetPeer = room.get(targetId);
            if (targetPeer && targetPeer.ws.readyState === WebSocket.OPEN) {
              targetPeer.ws.send(
                JSON.stringify({
                  type: 'signal',
                  senderId: currentPeer.id,
                  data,
                })
              );
            }
          }
          break;
        }

        // Direct WebSocket Relay for files & chunks (instant, 100% reliable)
        case 'file_offer':
        case 'file_chunk':
        case 'file_ack':
        case 'clipboard_text':
        case 'device_update': {
          if (!currentPeer) return;
          const room = rooms.get(currentPeer.roomId);
          if (!room) return;

          const broadcastPayload = {
            ...message,
            senderId: currentPeer.id,
            senderName: currentPeer.device.name,
          };

          if (message.targetId) {
            const targetPeer = room.get(message.targetId);
            if (targetPeer && targetPeer.ws.readyState === WebSocket.OPEN) {
              targetPeer.ws.send(JSON.stringify(broadcastPayload));
            }
          } else {
            // Broadcast to all other peers in the room
            for (const peer of room.values()) {
              if (peer.id !== currentPeer.id && peer.ws.readyState === WebSocket.OPEN) {
                peer.ws.send(JSON.stringify(broadcastPayload));
              }
            }
          }
          break;
        }

        case 'ping': {
          send({ type: 'pong', timestamp: Date.now() });
          break;
        }

        case 'leave': {
          removeCurrentPeer();
          send({ type: 'left' });
          break;
        }
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    removeCurrentPeer();
  });

  ws.on('error', (err) => {
    console.error('WebSocket connection error:', err);
    removeCurrentPeer();
  });
});

// Periodic heartbeat & stale peer check
setInterval(() => {
  for (const [roomId, room] of rooms.entries()) {
    for (const [peerId, peer] of room.entries()) {
      if (peer.ws.readyState === WebSocket.CLOSED || peer.ws.readyState === WebSocket.CLOSING) {
        room.delete(peerId);
      }
    }
    if (room.size === 0) {
      rooms.delete(roomId);
    }
  }
}, 30000);

// Set up Vite in development or static serving in production
async function startServer() {
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BeamDrop server running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
