const fs = require("fs");
let h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");

// === FIX 1: Freeze cannot target self (card user excluded from targets) ===
// Change freeze target filter to exclude the card user (from)
h = h.replace(
  "if(c.v==='freeze'){showTarget('\u51bb\u7ed3\uff1a\u9009\u62e9\u4e00\u540d\u73a9\u5bb6\u5f3a\u5236\u505c\u724c',act,",
  "if(c.v==='freeze'){let fAct=act.filter(x=>x.idx!==from);if(!fAct.length){afterAct();return}showTarget('\u51bb\u7ed3\uff1a\u9009\u62e9\u4e00\u540d\u5176\u4ed6\u73a9\u5bb6\u5f3a\u5236\u505c\u724c',fAct,"
);

// === FIX 3: Show pot, ante, and each player's beans ===
// Update the header to show current pot info
const oldHeader = "document.getElementById('gh').innerHTML='<div class=\"gi\"><span class=\"gl2\">\u56de\u5408</span><span class=\"gv\">'+G.round+'</span></div><div class=\"gi\"><span class=\"gl2\">\u724c\u5806</span><span class=\"gv\">'+G.deck.length+'</span></div><div class=\"gi\"><span class=\"gl2\">\u5e95\u6ce8\u500d\u7387</span><span class=\"gv\">x'+G.mult+'</span></div><div class=\"gi\"><span class=\"gl2\">\u52a0\u6ce8\u5269\u4f59</span><span class=\"gv\">'+(MAXR-G.totalR)+'</span></div>'";

const newHeader = "let pot=G.players.length*ANTE*G.mult;document.getElementById('gh').innerHTML='<div class=\"gi\"><span class=\"gl2\">\u56de\u5408</span><span class=\"gv\">'+G.round+'</span></div><div class=\"gi\"><span class=\"gl2\">\u5e95\u6ce8</span><span class=\"gv\">'+ANTE+'\u8c46</span></div><div class=\"gi\"><span class=\"gl2\">\u5f53\u524d\u5956\u6c60</span><span class=\"gv\">'+pot+'\u8c46</span></div><div class=\"gi\"><span class=\"gl2\">\u52a0\u6ce8\u5269\u4f59</span><span class=\"gv\">'+(MAXR-G.totalR)+'\u6b21</span></div>'";

h = h.replace(oldHeader, newHeader);

// Update player box to show beans
const oldPscore = "pa+='</div><div class=\"pscore\">\u7d2f\u8ba1:'+pl.total+'\u5206 | \u672c\u56de\u5408:'+calcScoreLive(pl)+'\u5206</div><div class=\"pcards\">'";
const newPscore = "pa+='</div><div class=\"pscore\">\u7d2f\u8ba1:'+pl.total+'\u5206 | \u672c\u56de\u5408:'+calcScoreLive(pl)+'\u5206 | \u8c46:'+pl.beans+'</div><div class=\"pcards\">'";
h = h.replace(oldPscore, newPscore);

// Add a version indicator to help with cache debugging
h = h.replace('<title>Flip7 \u7ffb\u8f6c\u4e03</title>', '<title>Flip7 \u7ffb\u8f6c\u4e03 v3</title>');

fs.writeFileSync("C:/Users/hortor/flip7-game/index.html", h, "utf8");
console.log("All fixes applied:");
console.log("1. Freeze cannot target self");
console.log("2. No dealing phase (already removed)");
console.log("3. Shows pot, ante, player beans");

// Verify
h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");
let i = h.indexOf("if(c.v==='freeze')");
console.log("\n=== Freeze logic ===");
console.log(h.substring(i, i+250));
console.log("\n=== Header ===");
i = h.indexOf("let pot=");
console.log(h.substring(i, i+300));
console.log("\n=== Player score line ===");
i = h.indexOf("pscore");
i = h.indexOf("pscore", i+6);
console.log(h.substring(i, i+120));