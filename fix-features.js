const fs = require("fs");

// === Fix server.js: auto next round after 2s ===
let srv = fs.readFileSync("server.js","utf8");

// In endRound, after broadcast, add setTimeout to auto-advance
let oldEnd = "G.f7winner=f7;broadcast();";
let newEnd = "G.f7winner=f7;broadcast();setTimeout(()=>{if(G.phase==='roundEnd')newRound()},2000);";
srv = srv.replace(oldEnd, newEnd);

// Add countdown timer support: server sends countdown info
// Add timer tracking
let oldVars = "let G=null, seats=[], clients=new Set(), roomSize=4, hostSeat=0;";
let newVars = "let G=null, seats=[], clients=new Set(), roomSize=4, hostSeat=0;\nlet turnTimer=null, turnDeadline=0;";
srv = srv.replace(oldVars, newVars);

// In startTurns, set 7s timer for playing
let oldStartTurns = "function startTurns(){G.cur=G.dealer;G.phase='playing';broadcast();aiCheckTurn()}";
let newStartTurns = "function startTurns(){G.cur=G.dealer;G.phase='playing';setTurnTimer(7);broadcast();aiCheckTurn()}";
srv = srv.replace(oldStartTurns, newStartTurns);

// In advance, reset timer
let oldAdvBroadcast = "G.cur=next;broadcast();aiCheckTurn();";
let newAdvBroadcast = "G.cur=next;setTurnTimer(7);broadcast();aiCheckTurn();";
srv = srv.replace(oldAdvBroadcast, newAdvBroadcast);

// In raise phase broadcast, set 5s timer
let oldRaiseBcast = "broadcast();aiCheckRaise();";
let newRaiseBcast = "setTurnTimer(5);broadcast();aiCheckRaise();";
srv = srv.replace(oldRaiseBcast, newRaiseBcast);

// Add setTurnTimer and auto-action on timeout
let timerCode = `
function setTurnTimer(sec){
  if(turnTimer)clearTimeout(turnTimer);
  turnDeadline=Date.now()+sec*1000;
  G.deadline=turnDeadline;
  turnTimer=setTimeout(()=>{
    turnTimer=null;
    if(G.phase==='raise'){skipRaise()}
    else if(G.phase==='playing'&&G.f3r<=0&&!G.targetPending){
      let p=G.players[G.cur];
      if(p&&p.status==='active'){if(p.hand.length>0){doStay()}else{doHit()}}
    }
  },sec*1000);
}
function clearTurnTimer(){if(turnTimer){clearTimeout(turnTimer);turnTimer=null;G.deadline=0}}
`;

// Insert timer code before startGame
srv = srv.replace("function startGame(){", timerCode + "\nfunction startGame(){");

// Clear timer on various events
srv = srv.replace("function doHit(){", "function doHit(){clearTurnTimer();");
srv = srv.replace("function doStay(){", "function doStay(){clearTurnTimer();");
srv = srv.replace("function doRaise(){G.roundRaised", "function doRaise(){clearTurnTimer();G.roundRaised");
srv = srv.replace("function skipRaise(){startTurns", "function skipRaise(){clearTurnTimer();startTurns");
srv = srv.replace("function endRound(f7){", "function endRound(f7){clearTurnTimer();");

fs.writeFileSync("server.js", srv, "utf8");
console.log("Server updated: auto-next + countdown timers");
