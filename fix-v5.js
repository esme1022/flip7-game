const fs = require("fs");
let h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");

// === FIX 1: Show conflicting card in UI before safety triggers ===

// doHit safety case: show conflict card visually, then remove after delay
h = h.replace(
  "if(p.safe){p.safe=false;log(p.name+' \u7ffb\u51fa\u91cd\u590d['+c.v+']\uff01\u5b89\u5168\u724c\u751f\u6548\uff0c\u907f\u514d\u7206\u70b8','ok');render();setTimeout(()=>advance(),800);return}",
  "if(p.safe){p.hand.push({t:'n',v:c.v,xx:true});log(p.name+' \u7ffb\u51fa\u91cd\u590d['+c.v+']\uff01','ex');render();setTimeout(()=>{p.hand.pop();p.safe=false;log('\u2714 \u5b89\u5168\u724c\u751f\u6548\uff0c\u907f\u514d\u7206\u70b8\uff01','ok');render();setTimeout(()=>advance(),600)},1000);return}"
);

// autoF3 safety case: same visual treatment
h = h.replace(
  "if(p.safe){p.safe=false;log(p.name+' \u7ffb\u51fa\u91cd\u590d['+c.v+']\uff01\u5b89\u5168\u724c\u751f\u6548\uff0c\u907f\u514d\u7206\u70b8','ok');render();setTimeout(autoF3,800)}",
  "if(p.safe){p.hand.push({t:'n',v:c.v,xx:true});log(p.name+' \u7ffb\u51fa\u91cd\u590d['+c.v+']\uff01','ex');render();setTimeout(()=>{p.hand.pop();p.safe=false;log('\u2714 \u5b89\u5168\u724c\u751f\u6548\uff0c\u907f\u514d\u7206\u70b8\uff01','ok');render();setTimeout(autoF3,800)},1000);return}"
);

// Modify rcard to show conflict cards with red highlight
h = h.replace(
  "function rcard(c){if(c.t==='n')return'<div class=\"cd cn\">'+c.v+'</div>';",
  "function rcard(c){if(c.xx)return'<div class=\"cd cn\" style=\"border:2px solid var(--red);box-shadow:0 0 10px var(--red);opacity:.8\">'+c.v+'</div>';if(c.t==='n')return'<div class=\"cd cn\">'+c.v+'</div>';"
);

// === FIX 2: Log persists across rounds (whole game) ===
// Remove G.log=[] from newRound (keep it only in startGame/restartSame)
h = h.replace(
  "G.log=[];log('=== \u7b2c'+G.round+'\u56de\u5408\u5f00\u59cb ===');log('\u5e84\u5bb6: '+G.players[G.dealer].name);",
  "log('');log('=== \u7b2c'+G.round+'\u56de\u5408\u5f00\u59cb ===');log('\u5e84\u5bb6: '+G.players[G.dealer].name);"
);

// Show more log entries (all with scroll instead of just last 15)
h = h.replace(
  "let lg='';G.log.slice(-15).forEach(l=>{lg+='<div class=\"le '+(l.cls||'')+'\">'+l.t+'</div>'});",
  "let lg='';G.log.forEach(l=>{lg+='<div class=\"le '+(l.cls||'')+'\">'+l.t+'</div>'});"
);

// Increase log area max-height for better visibility
h = h.replace(
  ".glog{width:100%;max-width:700px;background:var(--bg2);border-radius:var(--r);padding:10px;max-height:100px;overflow-y:auto}",
  ".glog{width:100%;max-width:700px;background:var(--bg2);border-radius:var(--r);padding:10px;max-height:160px;overflow-y:auto}"
);

// Update version
h = h.replace('<title>Flip7 \u7ffb\u8f6c\u4e03 v4</title>', '<title>Flip7 \u7ffb\u8f6c\u4e03 v5</title>');

fs.writeFileSync("C:/Users/hortor/flip7-game/index.html", h, "utf8");
console.log("v5 fixes applied!");
console.log("1. Conflicting card shown in UI with red highlight before safety triggers");
console.log("2. Log persists across entire game");

// Verify
h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");
let i = h.indexOf("if(p.safe){p.hand.push");
console.log("\n=== doHit safety (visual) ===");
console.log(h.substring(i, i+200));
console.log("\n=== rcard ===");
i = h.indexOf("function rcard");
console.log(h.substring(i, i+250));
console.log("\n=== newRound log ===");
i = h.indexOf("log('');log('=== ");
console.log(h.substring(i, i+100));