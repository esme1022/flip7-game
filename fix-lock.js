const fs = require("fs");
let h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");

// Add G.locked to game state init
h = h.replace(
  "let G={players:[],deck:[],disc:[],round:0,cur:0,dealer:0,roundRaised:false,totalR:0,mult:1,phase:'setup',log:[],pending:[],f3r:0,f3t:-1};",
  "let G={players:[],deck:[],disc:[],round:0,cur:0,dealer:0,roundRaised:false,totalR:0,mult:1,phase:'setup',log:[],pending:[],f3r:0,f3t:-1,locked:false};"
);

// Guard doHit with lock check + set lock on entry
h = h.replace(
  "function doHit(){let c=draw();",
  "function doHit(){if(G.locked)return;G.locked=true;let c=draw();"
);

// Guard doStay with lock check
h = h.replace(
  "function doStay(){let p=G.players[G.cur];",
  "function doStay(){if(G.locked)return;G.locked=true;let p=G.players[G.cur];"
);

// Unlock when render shows next player's buttons (in advance and startTurns)
h = h.replace(
  "function advance(){if(chkEnd())return;",
  "function advance(){G.locked=false;if(chkEnd())return;"
);

h = h.replace(
  "function startTurns(){G.cur=G.dealer;G.phase='playing';render()}",
  "function startTurns(){G.locked=false;G.cur=G.dealer;G.phase='playing';render()}"
);

// Also unlock at normal end of doHit (when card is added normally and advance is called)
// The advance() already unlocks, so that case is covered.
// But for handleAction (action card), unlock when overlay shows
h = h.replace(
  "function showTarget(title,targets,cb){",
  "function showTarget(title,targets,cb){G.locked=false;"
);

fs.writeFileSync("C:/Users/hortor/flip7-game/index.html", h, "utf8");
console.log("Lock mechanism added!");

// Verify
h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");
let i = h.indexOf("function doHit");
console.log(h.substring(i, i+80));
i = h.indexOf("function doStay");
console.log(h.substring(i, i+80));
i = h.indexOf("function advance");
console.log(h.substring(i, i+60));