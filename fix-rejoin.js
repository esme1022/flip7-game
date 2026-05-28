const fs = require("fs");
let h = fs.readFileSync("public/index.html","utf8");

// 1. Server side: add rejoin handler
let srv = fs.readFileSync("server.js","utf8");
let oldJoin = "if(msg.type==='join'){";
let newJoin = `if(msg.type==='rejoin'){
      let idx=seats.findIndex(s=>s.name===msg.name&&!s.ai);
      if(idx>=0){ws.seat=idx;ws.send(JSON.stringify({type:'seated',seat:idx}));ws.send(JSON.stringify({type:'state',G,seats,roomSize,hostSeat}))}
      return;
    }if(msg.type==='join'){`;
srv = srv.replace(oldJoin, newJoin);
fs.writeFileSync("server.js", srv, "utf8");
console.log("Server: rejoin handler added");

// 2. Client side: store name in localStorage and auto-rejoin on connect
// Fix the connect function to send rejoin
let oldConnect = 'ws.onclose=()=>{setTimeout(connect,2000)}';
let newConnect = 'ws.onclose=()=>{setTimeout(connect,2000)};ws.onopen=()=>{var n=localStorage.getItem("flip7name");if(n&&mySeat<0)send({type:"rejoin",name:n})}';
h = h.replace(oldConnect, newConnect);

// Fix doJoin to save name
let oldJoinC = 'function doJoin(){';
let newJoinC = 'function doJoin(){';
// Need to find the join send and add localStorage
let oldSendJoin = 'send({type:"join",name:n})';
let newSendJoin = 'send({type:"join",name:n});localStorage.setItem("flip7name",n)';
h = h.replace(oldSendJoin, newSendJoin);

fs.writeFileSync("public/index.html", h, "utf8");
console.log("Client: auto-rejoin on refresh added");
