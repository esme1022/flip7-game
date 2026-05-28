const fs = require("fs");
let h = fs.readFileSync("public/index.html","utf8");

// 1. Fix target overlay: show WHO is selecting
let oldTov = '$("tovT").textContent="\\u9009\\u62e9\\u76ee\\u6807\\uff1a"+cname(card)';
let newTov = '$("tovT").textContent=esc(G.players[G.targetPending.from].name)+" \\u4f7f\\u7528 "+cname(card)+"\\uff0c\\u9009\\u62e9\\u76ee\\u6807\\uff1a"';
h = h.replace(oldTov, newTov);

// 2. In turn-info (ti), when targetPending is active, show who is selecting
// Find where ti is set for playing phase and add a targetPending case
let oldTiPlaying = 'else if(G.phase==="playing")ti="\\u27a1 \\u8f6e\\u5230 <span class=\\"highlight\\">"+esc(G.players[G.cur].name)+(G.cur===mySeat?" (\\u4f60)":"")+"</span>"';
let newTiPlaying = 'else if(G.phase==="playing"&&G.targetPending)ti="\\ud83c\\udfaf <span class=\\"highlight\\">"+esc(G.players[G.targetPending.from].name)+"</span> \\u6b63\\u5728\\u4f7f\\u7528 "+cname(G.targetPending.card)+"\\uff0c\\u9009\\u62e9\\u76ee\\u6807\\u2026";else if(G.phase==="playing")ti="\\u27a1 \\u8f6e\\u5230 <span class=\\"highlight\\">"+esc(G.players[G.cur].name)+(G.cur===mySeat?" (\\u4f60)":"")+"</span>"';
h = h.replace(oldTiPlaying, newTiPlaying);

fs.writeFileSync("public/index.html", h, "utf8");
console.log("Fixed: skill card shows who is selecting target");
