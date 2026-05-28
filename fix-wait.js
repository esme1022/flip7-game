const fs = require("fs");
let h = fs.readFileSync("public/index.html","utf8");

// Problem: when waiting, we replace joinBlock innerHTML, destroying the input permanently.
// Fix: add a separate waitMsg div, toggle visibility instead of destroying joinBlock content.

// Add a waitMsg div after joinBlock
let oldJoinBlock = '<div id="joinBlock"><div class="join-area"><input id="nameIn" maxlength="12" placeholder="\u8f93\u5165\u6635\u79f0"><button class="btn bp" id="btnJoin">\u52a0\u5165</button></div></div>';
let newJoinBlock = '<div id="joinBlock"><div class="join-area"><input id="nameIn" maxlength="12" placeholder="\u8f93\u5165\u6635\u79f0"><button class="btn bp" id="btnJoin">\u52a0\u5165</button></div></div><div id="waitMsg" style="display:none"><p style="color:var(--ylw);font-weight:700;padding:12px 0">\u5bf9\u5c40\u8fdb\u884c\u4e2d\uff0c\u8bf7\u8010\u5fc3\u7b49\u5f85\u2026</p></div>';
h = h.replace(oldJoinBlock, newJoinBlock);

// Fix the routing: use waitMsg visibility instead of replacing joinBlock innerHTML
let oldWaiting = `if(waiting){showScr("lobby");renderLobby();$("joinBlock").innerHTML='<p style="color:var(--ylw);font-weight:700;padding:12px 0">\\u5bf9\\u5c40\\u8fdb\\u884c\\u4e2d\\uff0c\\u8bf7\\u8010\\u5fc3\\u7b49\\u5f85\\u2026</p>'}`;
let newWaiting = `if(waiting){showScr("lobby");renderLobby();$("joinBlock").style.display="none";$("waitMsg").style.display="block"}`;
h = h.replace(oldWaiting, newWaiting);

// When not waiting, ensure waitMsg is hidden and joinBlock is restored
let oldElseLobby = `else if(G.phase==="lobby"){showScr("lobby");renderLobby()}`;
let newElseLobby = `else if(G.phase==="lobby"){showScr("lobby");$("waitMsg").style.display="none";renderLobby()}`;
h = h.replace(oldElseLobby, newElseLobby);

fs.writeFileSync("public/index.html", h, "utf8");
console.log("Fixed: waiting players see lobby correctly after game ends");
