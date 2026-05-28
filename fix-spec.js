const fs = require("fs");
let srv = fs.readFileSync("server.js","utf8");

// Make isAI also return true for disconnected players (they should be auto-played)
srv = srv.replace(
  "function isAI(idx){return seats[idx]&&seats[idx].ai}",
  "function isAI(idx){return seats[idx]&&(seats[idx].ai||seats[idx].dc)}"
);

fs.writeFileSync("server.js", srv, "utf8");
console.log("Server: isAI includes disconnected players");

// === Client fixes ===
let h = fs.readFileSync("public/index.html","utf8");

// Remove spectator mode: when not seated and game is running, stay on lobby screen with a message
// Instead of showing game screen with spec bar, just show lobby with a waiting notice
let oldSpec = 'var spec=mySeat<0&&G.phase!=="lobby";$("specBar").classList.toggle("show",spec);document.querySelectorAll(".scr").forEach(function(s){s.style.paddingTop=spec?"48px":"20px"});';
let newSpec = 'var waiting=mySeat<0&&G.phase!=="lobby";';
h = h.replace(oldSpec, newSpec);

// Change the screen routing: if waiting, show lobby instead of game
let oldRouting = 'if(G.phase==="lobby"){showScr("lobby");renderLobby()}else if(G.phase==="roundEnd"){showScr("roundEnd");renderRoundEnd();renderGame()}else if(G.phase==="gameEnd"){showScr("gameEnd");renderGameEnd()}else{showScr("game");renderGame()}renderLobby()';
let newRouting = 'if(waiting){showScr("lobby");renderLobby();$("joinBlock").innerHTML=\'<p style="color:var(--ylw);font-weight:700;padding:12px 0">\\u5bf9\\u5c40\\u8fdb\\u884c\\u4e2d\\uff0c\\u8bf7\\u8010\\u5fc3\\u7b49\\u5f85\\u2026</p>\'}else if(G.phase==="lobby"){showScr("lobby");renderLobby()}else if(G.phase==="roundEnd"){showScr("roundEnd");renderRoundEnd();renderGame()}else if(G.phase==="gameEnd"){showScr("gameEnd");renderGameEnd()}else{showScr("game");renderGame()}if(!waiting)renderLobby()';
h = h.replace(oldRouting, newRouting);

fs.writeFileSync("public/index.html", h, "utf8");
console.log("Client: no spectator, waiting message instead");
