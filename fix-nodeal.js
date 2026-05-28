const fs = require("fs");
let h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");

// Remove dealPhase - go directly to startTurns after raise
h = h.replace(
  "function chkRaise(){if(G.totalR<MAXR&&!G.roundRaised){G.phase='raise';render()}else{dealPhase()}}",
  "function chkRaise(){if(G.totalR<MAXR&&!G.roundRaised){G.phase='raise';render()}else{startTurns()}}"
);

h = h.replace(
  "function doRaise(){G.roundRaised=true;G.totalR++;G.mult*=2;log('\u5e84\u5bb6\u52a0\u6ce8\uff01\u5e95\u6ce8\u500d\u7387\u2192x'+G.mult,'ac');dealPhase()}",
  "function doRaise(){G.roundRaised=true;G.totalR++;G.mult*=2;log('\u5e84\u5bb6\u52a0\u6ce8\uff01\u5e95\u6ce8\u500d\u7387\u2192x'+G.mult,'ac');startTurns()}"
);

h = h.replace(
  "function skipRaise(){dealPhase()}",
  "function skipRaise(){startTurns()}"
);

// Remove dealPhase and dealInit functions (now dead code), replace with empty
h = h.replace(
  "function dealPhase(){G.phase='dealing';render();setTimeout(dealInit,600)}",
  ""
);

// Remove dealInit function
const dealInitStart = h.indexOf("function dealInit()");
const dealInitEnd = h.indexOf("function procPend");
if (dealInitStart > 0 && dealInitEnd > dealInitStart) {
  h = h.substring(0, dealInitStart) + h.substring(dealInitEnd);
}

// Remove procPend function (no longer needed without dealing)
h = h.replace(
  /function procPend\(\)\{if\(!G\.pending\.length\)\{startTurns\(\);return\}let a=G\.pending\.shift\(\);handleAction\(a\.c,a\.pi\)\}\n?/,
  ""
);

// Update render: remove 'dealing' phase display since it no longer exists
h = h.replace(
  "if(G.phase==='dealing'){ti='\u53d1\u724c\u4e2d...';}",
  "if(G.phase==='dealing'){ti='\u51c6\u5907\u4e2d...';}",
);

// afterAct: when not in playing phase (shouldn't happen anymore but keep safe)
// Already calls startTurns() which is correct

fs.writeFileSync("C:/Users/hortor/flip7-game/index.html", h, "utf8");
console.log("Removed initial dealing phase. Cards only come from player flips.");

// Verify
h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");
let i = h.indexOf("function newRound");
console.log("\n=== newRound + flow ===");
console.log(h.substring(i, i + 400));
console.log("\n=== chkRaise area ===");
i = h.indexOf("function chkRaise");
console.log(h.substring(i, i + 300));