const fs = require("fs");

// === Server fixes ===
let srv = fs.readFileSync("server.js","utf8");

// 1. On disconnect during game: DON'T rename or mark as ai, just flag as disconnected
let oldClose = `ws.on('close',()=>{
    clients.delete(ws);
    if(ws.seat>=0&&ws.seat<seats.length&&!seats[ws.seat].ai){
      let si=ws.seat;
      if(G.phase==='lobby'){
        seats.splice(si,1);
        clients.forEach(c=>{if(c.seat>si)c.seat--});
        if(hostSeat>=seats.length)hostSeat=0;
        broadcast();
      } else {
        // During game: mark player as disconnected, AI takes over
        seats[si].ai=true;seats[si].name='[离开]'+seats[si].name;
        broadcast();
      }
    }
  });`;
let newClose = `ws.on('close',()=>{
    clients.delete(ws);
    if(ws.seat>=0&&ws.seat<seats.length&&!seats[ws.seat].ai){
      let si=ws.seat;
      if(G.phase==='lobby'){
        seats.splice(si,1);
        clients.forEach(c=>{if(c.seat>si)c.seat--});
        if(hostSeat>=seats.length)hostSeat=0;
        broadcast();
      } else {
        seats[si].dc=true;
        broadcast();
      }
    }
  });`;
srv = srv.replace(oldClose, newClose);

// 2. Rejoin: also match disconnected players (dc flag)
let oldRejoin = `if(msg.type==='rejoin'){
      let idx=seats.findIndex(s=>s.name===msg.name&&!s.ai);
      if(idx>=0){ws.seat=idx;ws.send(JSON.stringify({type:'seated',seat:idx}));ws.send(JSON.stringify({type:'state',G,seats,roomSize,hostSeat}))}
      return;
    }`;
let newRejoin = `if(msg.type==='rejoin'){
      let idx=seats.findIndex(s=>s.name===msg.name&&!s.ai);
      if(idx>=0){ws.seat=idx;seats[idx].dc=false;ws.send(JSON.stringify({type:'seated',seat:idx}));ws.send(JSON.stringify({type:'state',G,seats,roomSize,hostSeat}));broadcast()}
      return;
    }`;
srv = srv.replace(oldRejoin, newRejoin);

// 3. AI logic should also play for disconnected players
// In aiCheckTurn, also check dc flag
let oldAiTurn = "if(!seats[G.cur]||(!seats[G.cur].ai";
if(srv.includes(oldAiTurn)){
  srv = srv.replace(oldAiTurn, "if(!seats[G.cur]||((!seats[G.cur].ai&&!seats[G.cur].dc)");
}else{
  // Find aiCheckTurn and patch it
  let aiTurnMatch = srv.match(/function aiCheckTurn\(\)\{[^}]*\}/);
  if(aiTurnMatch) console.log("aiCheckTurn found, checking...");
}

// Let me look at the actual aiCheckTurn pattern
let aiIdx = srv.indexOf("function aiCheckTurn()");
if(aiIdx>=0){
  let snippet = srv.substring(aiIdx, aiIdx+200);
  console.log("aiCheckTurn:", snippet.substring(0,200));
}

fs.writeFileSync("server.js", srv, "utf8");
console.log("Server: disconnect/rejoin fixed");
