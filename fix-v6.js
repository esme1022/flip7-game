const fs = require("fs");
let h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");

// === FIX 1: Show deck remaining count in header ===
const oldHeader = "let pot=G.players.length*ANTE*G.mult;document.getElementById('gh').innerHTML='<div class=\"gi\"><span class=\"gl2\">\u56de\u5408</span><span class=\"gv\">'+G.round+'</span></div><div class=\"gi\"><span class=\"gl2\">\u5e95\u6ce8</span><span class=\"gv\">'+ANTE+'\u8c46</span></div><div class=\"gi\"><span class=\"gl2\">\u5f53\u524d\u5956\u6c60</span><span class=\"gv\">'+pot+'\u8c46</span></div><div class=\"gi\"><span class=\"gl2\">\u52a0\u6ce8\u5269\u4f59</span><span class=\"gv\">'+(MAXR-G.totalR)+'\u6b21</span></div>'";

const newHeader = "let pot=G.players.length*ANTE*G.mult;document.getElementById('gh').innerHTML='<div class=\"gi\"><span class=\"gl2\">\u724c\u5806</span><span class=\"gv\">'+G.deck.length+'\u5f20</span></div><div class=\"gi\"><span class=\"gl2\">\u5e95\u6ce8</span><span class=\"gv\">'+ANTE+'\u8c46</span></div><div class=\"gi\"><span class=\"gl2\">\u5956\u6c60</span><span class=\"gv\">'+pot+'\u8c46</span></div><div class=\"gi\"><span class=\"gl2\">\u52a0\u6ce8</span><span class=\"gv\">'+(MAXR-G.totalR)+'\u6b21</span></div>'";

h = h.replace(oldHeader, newHeader);

// === FIX 2: draw() already reshuffles disc into deck. Just improve the null case. ===
// When both deck and disc are empty, create a fresh deck (minus cards on table)
h = h.replace(
  "function draw(){if(!G.deck.length){if(!G.disc.length)return null;G.deck=shuf([...G.disc]);G.disc=[];log('\u724c\u5806\u8017\u5c3d\uff0c\u5f03\u724c\u5806\u91cd\u65b0\u6d17\u5165')}return G.deck.pop()}",
  "function draw(){if(!G.deck.length){if(G.disc.length){G.deck=shuf([...G.disc]);G.disc=[];log('\u724c\u5806\u8017\u5c3d\uff0c\u5f03\u724c\u5806\u91cd\u65b0\u6d17\u5165\uff08'+G.deck.length+'\u5f20\uff09')}else{return null}}return G.deck.pop()}"
);

// === FIX 3: Lock during autoF3 to prevent button presses ===
h = h.replace(
  "function autoF3(){if(G.f3r<=0)",
  "function autoF3(){G.locked=true;if(G.f3r<=0)"
);

fs.writeFileSync("C:/Users/hortor/flip7-game/index.html", h, "utf8");
console.log("v6 fixes applied!");

// Verify
h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");
let i = h.indexOf("let pot=");
console.log("\n=== Header ===");
console.log(h.substring(i, i+300));
console.log("\n=== draw ===");
i = h.indexOf("function draw");
console.log(h.substring(i, i+220));
console.log("\n=== autoF3 start ===");
i = h.indexOf("function autoF3");
console.log(h.substring(i, i+80));