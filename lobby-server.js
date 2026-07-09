const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_req, res) => res.redirect('/lobby-design.html'));

app.use(express.static(__dirname));

const rooms = new Map();
const clients = new Map();

function roomKey(mode, game) { return `${mode}::${game}`; }

function getRoom(key) {
  if (!rooms.has(key)) rooms.set(key, []);
  return rooms.get(key);
}

function broadcastRoom(key) {
  const room = getRoom(key);
  const players = room.map(c => ({ nickname: c.nickname, emoji: c.emoji }));
  const msg = JSON.stringify({ type: 'room_update', players });
  room.forEach(c => { if (c.ws.readyState === 1) c.ws.send(msg); });
}

function leaveCurrentRoom(ws) {
  const info = clients.get(ws);
  if (!info || !info.roomKey) return;
  const room = getRoom(info.roomKey);
  const idx = room.findIndex(c => c.ws === ws);
  if (idx !== -1) room.splice(idx, 1);
  if (room.length === 0) rooms.delete(info.roomKey);
  else broadcastRoom(info.roomKey);
  info.roomKey = null;
}

wss.on('connection', ws => {
  clients.set(ws, { nickname: null, emoji: null, roomKey: null });

  ws.on('message', raw => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    const info = clients.get(ws);

    if (msg.type === 'set_name') {
      info.nickname = msg.nickname;
      info.emoji = msg.emoji;
    }

    if (msg.type === 'join_room') {
      leaveCurrentRoom(ws);
      const key = roomKey(msg.mode, msg.game);
      const room = getRoom(key);
      if (room.length >= 4) {
        ws.send(JSON.stringify({ type: 'room_full' }));
        return;
      }
      info.roomKey = key;
      room.push({ ws, nickname: info.nickname, emoji: info.emoji });
      broadcastRoom(key);
    }

    if (msg.type === 'leave_room') {
      leaveCurrentRoom(ws);
    }
  });

  ws.on('close', () => {
    leaveCurrentRoom(ws);
    clients.delete(ws);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Game running on port ' + PORT);
});
