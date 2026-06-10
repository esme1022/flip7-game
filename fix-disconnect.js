const fs = require("fs");

// === Server changes ===
let srv = fs.readFileSync("server.js","utf8");

// 1. On disconnect: remove player from seats if in lobby, or mark as disconnected
let oldClose = "ws.on('close',()=>{clients.delete(ws)});";
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
        // During game: mark player as disconnected, AI takes over
        seats[si].ai=true;seats[si].name='[离开]'+seats[si].name;
        broadcast();
      }
    }
  });`;
srv = srv.replace(oldClose, newClose);

// 2. Add kick handler (host only, lobby only)
let oldBackToLobby = "else if(msg.type==='backToLobby'){";
let kickHandler = `else if(msg.type==='kick'){
      if(ws.seat!==hostSeat||G.phase!=='lobby')return;
      let ki=msg.seat;
      if(ki<0||ki>=seats.length||ki===hostSeat||seats[ki].ai)return;
      // Notify kicked player
      clients.forEach(c=>{if(c.seat===ki){c.send(JSON.stringify({type:'kicked'}));c.seat=-1}});
      seats.splice(ki,1);
      clients.forEach(c=>{if(c.seat>ki)c.seat--});
      if(hostSeat>ki)hostSeat--;
      broadcast();
    }else if(msg.type==='backToLobby'){`;
srv = srv.replace(oldBackToLobby, kickHandler);

fs.writeFileSync("server.js", srv, "utf8");
console.log("Server: disconnect+kick done");

// === Client changes ===
let h = fs.readFileSync("public/index.html","utf8");

// 1. Handle 'kicked' message - clear localStorage and show alert
let oldOnMsg = "if(msg.type===\"state\")onState(msg);else if(msg.type===\"seated\")mySeat=msg.seat;else if(msg.type===\"info\")toast(msg.text)";
let newOnMsg = "if(msg.type===\"state\")onState(msg);else if(msg.type===\"seated\")mySeat=msg.seat;else if(msg.type===\"kicked\"){localStorage.removeItem(\"flip7name\");mySeat=-1;toast(\"\u4f60\u5df2\u88ab\u623f\u4e3b\u8e22\u51fa\u623f\u95f4\")}else if(msg.type===\"info\")toast(msg.text)";
h = h.replace(oldOnMsg, newOnMsg);

// 2. In renderLobby, add kick button next to each player (for host, in lobby)
let oldSeatRender = 'li.textContent=pre+s.name;ul.appendChild(li)});';
let newSeatRender = `li.textContent=pre+s.name;if(isHost()&&i!==hostSeat&&!s.ai){var kb=document.createElement("button");kb.textContent="\\u2715";kb.style.cssText="float:right;background:none;border:1px solid var(--red);color:var(--red);border-radius:4px;padding:2px 8px;cursor:pointer;font-size:11px";kb.dataset.idx=i;kb.onclick=function(){send({type:"kick",seat:parseInt(this.dataset.idx,10)})};li.appendChild(kb)}ul.appendChild(li)});`;
h = h.replace(oldSeatRender, newSeatRender);

// 3. On disconnect (close), clear localStorage so rejoin won't auto-seat
// Actually we should NOT clear localStorage on normal close (tab close is intentional exit)
// The server handles removal, and on reconnect the rejoin will fail (name not in seats)

fs.writeFileSync("public/index.html", h, "utf8");
console.log("Client: kick UI + kicked handler done");
