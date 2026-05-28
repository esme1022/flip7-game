const fs = require("fs");
let h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");

// 1. newRound: change from "dealing first" to "raise first"
h = h.replace(
  "function newRound(){G.round++;G.roundRaised=false;G.f3r=0;G.f3t=-1;G.pending=[];\nG.players.forEach(p=>{p.hand=[];p.bonus=[];p.rscore=0;p.status='active';p.safe=false});\nG.log=[];log('=== \u7b2c'+G.round+'\u56de\u5408\u5f00\u59cb ===');log('\u5e84\u5bb6: '+G.players[G.dealer].name);\nG.phase='dealing';S('game');render();setTimeout(dealInit,600)}",
  "function newRound(){G.round++;G.roundRaised=false;G.f3r=0;G.f3t=-1;G.pending=[];\nG.players.forEach(p=>{p.hand=[];p.bonus=[];p.rscore=0;p.status='active';p.safe=false});\nG.log=[];log('=== \u7b2c'+G.round+'\u56de\u5408\u5f00\u59cb ===');log('\u5e84\u5bb6: '+G.players[G.dealer].name);\nS('game');chkRaise()}"
);

// 2. chkRaise: change startTurns to dealPhase
h = h.replace(
  "function chkRaise(){if(G.totalR<MAXR&&!G.roundRaised){G.phase='raise';render()}else{startTurns()}}",
  "function chkRaise(){if(G.totalR<MAXR&&!G.roundRaised){G.phase='raise';render()}else{dealPhase()}}"
);

// 3. doRaise: change startTurns to dealPhase
h = h.replace(
  "function doRaise(){G.roundRaised=true;G.totalR++;G.mult*=2;log('\u5e84\u5bb6\u52a0\u6ce8\uff01\u5e95\u6ce8\u500d\u7387\u2192x'+G.mult,'ac');startTurns()}",
  "function doRaise(){G.roundRaised=true;G.totalR++;G.mult*=2;log('\u5e84\u5bb6\u52a0\u6ce8\uff01\u5e95\u6ce8\u500d\u7387\u2192x'+G.mult,'ac');dealPhase()}"
);

// 4. skipRaise: change startTurns to dealPhase
h = h.replace(
  "function skipRaise(){startTurns()}",
  "function skipRaise(){dealPhase()}"
);

// 5. Add dealPhase function before startTurns
h = h.replace(
  "function startTurns(){G.cur=G.dealer;G.phase='playing';render()}",
  "function dealPhase(){G.phase='dealing';render();setTimeout(dealInit,600)}\nfunction startTurns(){G.cur=G.dealer;G.phase='playing';render()}"
);

// 6. dealInit: change chkRaise to startTurns
h = h.replace(
  "render();if(G.pending.length){setTimeout(procPend,400)}else{setTimeout(chkRaise,400)}",
  "render();if(G.pending.length){setTimeout(procPend,400)}else{setTimeout(startTurns,400)}"
);

// 7. procPend: change chkRaise to startTurns
h = h.replace(
  "function procPend(){if(!G.pending.length){chkRaise();return}",
  "function procPend(){if(!G.pending.length){startTurns();return}"
);

// 8. afterAct: change chkRaise to startTurns (for dealing phase)
h = h.replace(
  "function afterAct(){if(G.pending.length){setTimeout(procPend,300)}else if(G.phase==='playing'){if(!chkEnd())advance()}else{chkRaise()}}",
  "function afterAct(){if(G.pending.length){setTimeout(procPend,300)}else if(G.phase==='playing'){if(!chkEnd())advance()}else{startTurns()}}"
);

fs.writeFileSync("C:/Users/hortor/flip7-game/index.html", h, "utf8");
console.log("Flow fixed: raise -> deal -> play");

// Verify
h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");
let i = h.indexOf("function newRound");
console.log("\n=== newRound ===");
console.log(h.substring(i, h.indexOf("function dealInit")));
console.log("=== chkRaise + doRaise + skipRaise ===");
i = h.indexOf("function chkRaise");
console.log(h.substring(i, h.indexOf("function dealPhase")));
console.log("=== dealPhase + startTurns ===");
i = h.indexOf("function dealPhase");
console.log(h.substring(i, h.indexOf("\n\nfunction render")));