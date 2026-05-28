const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, 'public')));

const WIN = 200, BEANS = 5000, ANTE = 100, MAXR = 3;
const PR = { 2: [1], 3: [.6, .4], 4: [.5, .3, .2], 5: [.4, .3, .2, .1], 6: [.4, .3, .2, .07, .03] };

let G = null;
let seats = [];
let spectators = new Set();
let clients = new Set();

function initState() {
  G = { players: [], deck: [], disc: [], round: 0, cur: 0, dealer: 0, roundRaised: false, totalR: 0, mult: 1, phase: 'lobby', log: [], pending: [], f3r: 0, f3t: -1, targetPending: null };
  seats = [];
}
initState();

function mkDeck() {
  let d = [];
  for (let v = 0; v <= 12; v++) { let n = Math.max(1, v); for (let i = 0; i < n; i++) d.push({ t: 'n', v }); }
  d.push({ t: 'b', v: '+2' }, { t: 'b', v: '+4' }, { t: 'b', v: '+6' }, { t: 'b', v: '+8' }, { t: 'b', v: '+10' }, { t: 'b', v: 'x2' });
  for (let i = 0; i < 3; i++) { d.push({ t: 'a', v: 'freeze' }); d.push({ t: 'a', v: 'flip3' }); d.push({ t: 'a', v: 'safety' }); }
  return d;
}
function shuf(a) { for (let i = a.length - 1; i > 0; i--) { let j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function draw() {
  if (!G.deck.length) {
    if (G.disc.length) { G.deck = shuf([...G.disc]); G.disc = []; log('牌堆耗尽，弃牌堆重新洗入（' + G.deck.length + '张）'); }
    else return null;
  }
  return G.deck.pop();
}
function cname(c) { if (c.t === 'n') return String(c.v); if (c.t === 'b') return c.v; return { freeze: '冻结', flip3: '翻三张', safety: '安全牌' }[c.v]; }
function cdisp(c) { return '[' + cname(c) + ']'; }
function log(t, cls) { G.log.push({ t, cls: cls || '' }); }
function uniq(p) { let s = new Set(); p.hand.forEach(c => { if (c.t === 'n') s.add(c.v); }); return [...s]; }
function calcScore(p, f7) { let ns = 0; p.hand.forEach(c => { if (c.t === 'n') ns += c.v; }); let mul = 1, ba = 0; p.bonus.forEach(b => { if (b.v === 'x2') mul *= 2; else ba += parseInt(b.v); }); return ns * mul + ba + (f7 ? 15 : 0); }

function broadcast() {
  const state = JSON.stringify({ type: 'state', G, seats });
  clients.forEach(ws => { if (ws.readyState === 1) ws.send(state); });
}

function broadcastAfter(ms) { setTimeout(broadcast, ms); }

function startGame() {
  G.players = seats.map(s => ({ name: s.name, hand: [], bonus: [], total: 0, rscore: 0, beans: BEANS - ANTE, status: 'active', safe: false }));
  G.deck = shuf(mkDeck()); G.disc = []; G.round = 0; G.dealer = 0; G.totalR = 0; G.mult = 1; G.log = []; G.pending = [];
  newRound();
}

function newRound() {
  G.round++; G.roundRaised = false; G.f3r = 0; G.f3t = -1; G.pending = []; G.targetPending = null;
  G.players.forEach(p => { p.hand = []; p.bonus = []; p.rscore = 0; p.status = 'active'; p.safe = false; });
  log(''); log('=== 第' + G.round + '回合开始 ==='); log('庄家: ' + G.players[G.dealer].name);
  G.phase = 'raise';
  if (G.totalR >= MAXR || G.roundRaised) { startTurns(); return; }
  broadcast();
}

function startTurns() { G.cur = G.dealer; G.phase = 'playing'; broadcast(); }

function advance() {
  if (chkEnd()) return;
  let next = (G.cur + 1) % G.players.length, att = 0;
  while (G.players[next].status !== 'active' && att < G.players.length) { next = (next + 1) % G.players.length; att++; }
  if (att >= G.players.length) { endRound(); return; }
  G.cur = next; broadcast();
}

function chkEnd() { if (!G.players.some(p => p.status === 'active')) { endRound(); return true; } return false; }

function doRaise() {
  G.roundRaised = true; G.totalR++; G.mult *= 2;
  log('庄家加注！底注倍率→x' + G.mult, 'ac'); startTurns();
}

function skipRaise() { startTurns(); }

function doHit() {
  let c = draw(); if (!c) { log('牌堆空！'); endRound(); return; }
  let p = G.players[G.cur]; log(p.name + ' 翻牌: ' + cdisp(c));
  if (c.t === 'n') {
    if (p.hand.some(x => x.t === 'n' && x.v === c.v)) {
      if (p.safe) {
        p.hand.push({ t: 'n', v: c.v, xx: true }); log(p.name + ' 翻出重复[' + c.v + ']！', 'ex');
        broadcast();
        setTimeout(() => { p.hand.pop(); p.safe = false; log('✔ 安全牌生效，避免爆炸！', 'ok'); broadcast(); setTimeout(() => advance(), 600); }, 1000);
        return;
      }
      p.hand.forEach(x => { if (x.t === 'n' && x.v === c.v) x.xx = true; });
      p.hand.push({ t: 'n', v: c.v, xx: true }); log(p.name + ' 翻出重复[' + c.v + ']！', 'ex');
      broadcast();
      setTimeout(() => { p.status = 'busted'; log(p.name + ' 💥 爆炸！', 'ex'); p.hand = []; p.bonus = []; broadcast(); setTimeout(() => advance(), 600); }, 1200);
      return;
    }
    p.hand.push(c);
    if (uniq(p).length >= 7) { log(p.name + ' 七连翻！+15分！', 'ok'); broadcast(); setTimeout(() => endRound(G.cur), 600); return; }
  } else if (c.t === 'b') { p.bonus.push(c); }
  else { handleAction(c, G.cur); return; }
  broadcast(); advance();
}

function doStay() {
  let p = G.players[G.cur]; p.status = 'stayed'; log(p.name + ' 停牌', 'ok'); broadcast(); advance();
}

function autoF3() {
  if (G.f3r <= 0) { if (G.pending.length) { setTimeout(procPend, 300); } else { advance(); } return; }
  let c = draw(); if (!c) { G.f3r = 0; log('牌堆空'); broadcast(); advance(); return; }
  let p = G.players[G.f3t];
  log('[翻三张] ' + p.name + ' 翻出: ' + cdisp(c)); G.f3r--;
  if (c.t === 'n') {
    if (p.hand.some(x => x.t === 'n' && x.v === c.v)) {
      if (p.safe) {
        p.hand.push({ t: 'n', v: c.v, xx: true }); log(p.name + ' 翻出重复[' + c.v + ']！', 'ex');
        broadcast(); setTimeout(() => { p.hand.pop(); p.safe = false; log('✔ 安全牌生效，避免爆炸！', 'ok'); broadcast(); setTimeout(autoF3, 800); }, 1000); return;
      } else {
        p.hand.forEach(x => { if (x.t === 'n' && x.v === c.v) x.xx = true; });
        p.hand.push({ t: 'n', v: c.v, xx: true }); log(p.name + ' 翻出重复[' + c.v + ']！', 'ex'); G.f3r = 0;
        broadcast(); setTimeout(() => { p.status = 'busted'; log(p.name + ' 💥 翻三张中爆炸！', 'ex'); p.hand = []; p.bonus = []; broadcast(); setTimeout(() => advance(), 600); }, 1200); return;
      }
    } else {
      p.hand.push(c);
      if (uniq(p).length >= 7) { G.f3r = 0; log(p.name + ' 翻三张达成七连翻！', 'ok'); broadcast(); setTimeout(() => endRound(G.f3t), 600); return; }
    }
  } else if (c.t === 'b') { p.bonus.push(c); }
  else { G.pending.push({ c, pi: G.f3t }); log('【' + cname(c) + '】暂存', 'ac'); }
  broadcast(); setTimeout(autoF3, 800);
}

function handleAction(c, from) {
  let act = G.players.map((p, i) => ({ name: p.name, idx: i })).filter(x => G.players[x.idx].status === 'active');
  if (!act.length) { afterAct(); return; }
  G.targetPending = { card: c, from, targets: act };
  broadcast();
}

function selectTarget(ti) {
  if (!G.targetPending) return;
  let { card: c, from } = G.targetPending;
  let who = G.players[from].name;
  G.targetPending = null;
  if (c.v === 'freeze') {
    G.players[ti].status = 'stayed'; log(who + ' 对 ' + G.players[ti].name + ' 使用冻结', 'ac');
    broadcast(); setTimeout(afterAct, 100);
  } else if (c.v === 'flip3') {
    log(who + ' 对 ' + G.players[ti].name + ' 使用翻三张', 'ac');
    G.f3r = 3; G.f3t = ti; broadcast(); setTimeout(autoF3, 800);
  } else if (c.v === 'safety') {
    G.players[ti].safe = true; log(who + ' 对 ' + G.players[ti].name + ' 使用安全牌', 'ac');
    broadcast(); setTimeout(afterAct, 100);
  }
}

function afterAct() { if (G.pending.length) { setTimeout(procPend, 300); } else if (G.phase === 'playing') { if (!chkEnd()) advance(); } else { startTurns(); } }
function procPend() { if (!G.pending.length) { if (!chkEnd()) advance(); return; } let a = G.pending.shift(); handleAction(a.c, a.pi); }

function endRound(f7) {
  if (f7 === undefined) f7 = -1; G.phase = 'roundEnd';
  G.players.forEach((p, i) => { if (p.status !== 'busted') { p.rscore = calcScore(p, i === f7); p.total += p.rscore; } else { p.rscore = 0; }
    p.hand.forEach(c => G.disc.push(c)); p.bonus.forEach(c => G.disc.push(c)); });
  if (G.players.some(p => p.total >= WIN)) { showEnd(); return; }
  let best = -1, bi = G.dealer; G.players.forEach((p, i) => { if (p.rscore > best) { best = p.rscore; bi = i; } }); G.dealer = bi;
  G.f7winner = f7;
  broadcast();
}

function showEnd() {
  let sorted = [...G.players].sort((a, b) => b.total - a.total);
  let pool = G.players.length * ANTE * G.mult, rats = PR[G.players.length];
  let totalPaid = 0;
  sorted.forEach((p, i) => { if (i === 0) return; let owe = Math.round(pool * (rats[rats.length - i] || rats[0]));
    if (p.beans < owe) { p._bk = true; p._bc = -p.beans; totalPaid += p.beans; p.beans = 0; }
    else { p._bk = false; p._bc = -owe; totalPaid += owe; p.beans -= owe; } });
  sorted[0]._bc = totalPaid; sorted[0].beans += totalPaid; sorted[0]._bk = false;
  G.phase = 'gameEnd'; G.finalRanking = sorted;
  broadcast();
}

function restartGame() {
  G.players.forEach(p => { p.total = 0; p.rscore = 0; p.hand = []; p.bonus = []; p.beans = BEANS - ANTE; p.status = 'active'; p.safe = false; });
  G.deck = shuf(mkDeck()); G.disc = []; G.round = 0; G.dealer = 0; G.totalR = 0; G.mult = 1; G.log = []; G.pending = []; G.targetPending = null;
  newRound();
}

function backToLobby() {
  G.phase = 'lobby'; G.log = []; G.targetPending = null;
  broadcast();
}

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.seat = -1;
  ws.send(JSON.stringify({ type: 'state', G, seats }));

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch (e) { return; }

    if (msg.type === 'join') {
      if (G.phase !== 'lobby') { ws.send(JSON.stringify({ type: 'info', text: '游戏进行中，请等待本局结束' })); return; }
      if (seats.length >= 6) { ws.send(JSON.stringify({ type: 'info', text: '房间已满' })); return; }
      if (seats.some(s => s.name === msg.name)) { ws.send(JSON.stringify({ type: 'info', text: '名称已存在' })); return; }
      seats.push({ name: msg.name, id: Date.now() + '' + Math.random() });
      ws.seat = seats.length - 1;
      broadcast();
    } else if (msg.type === 'start') {
      if (G.phase !== 'lobby' || seats.length < 2) return;
      startGame();
    } else if (msg.type === 'hit') {
      if (G.phase !== 'playing' || G.f3r > 0) return;
      if (ws.seat !== G.cur) return;
      doHit();
    } else if (msg.type === 'stay') {
      if (G.phase !== 'playing' || G.f3r > 0) return;
      if (ws.seat !== G.cur) return;
      doStay();
    } else if (msg.type === 'raise') {
      if (G.phase !== 'raise') return;
      if (ws.seat !== G.dealer) return;
      doRaise();
    } else if (msg.type === 'skip') {
      if (G.phase !== 'raise') return;
      if (ws.seat !== G.dealer) return;
      skipRaise();
    } else if (msg.type === 'target') {
      if (!G.targetPending) return;
      if (ws.seat !== G.targetPending.from) return;
      selectTarget(msg.idx);
    } else if (msg.type === 'nextRound') {
      if (G.phase !== 'roundEnd') return;
      newRound();
    } else if (msg.type === 'restart') {
      restartGame();
    } else if (msg.type === 'backToLobby') {
      backToLobby();
    }
  });

  ws.on('close', () => { clients.delete(ws); });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { console.log('Flip7 server running on port ' + PORT); });
