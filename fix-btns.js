const fs = require("fs");
let h = fs.readFileSync("public/index.html","utf8");
let old = '<div id="glog" class="glog"></div></section>';
let nw = '<div id="glog" class="glog"></div><div id="gameHostBtns" class="host-only" style="margin-top:8px;opacity:.7;gap:10px"><button class="btn bo" style="font-size:12px;padding:6px 14px" id="btnRestartG">\u91cd\u5f00\u672c\u5c40</button><button class="btn bo" style="font-size:12px;padding:6px 14px" id="btnLobbyG">\u8fd4\u56de\u623f\u95f4</button></div></section>';
h = h.replace(old, nw);

// Add click handlers
let oldScript = '$("btnLobby").onclick=function(){send({type:"backToLobby"})};';
let newScript = '$("btnLobby").onclick=function(){send({type:"backToLobby"})};$("btnRestartG").onclick=function(){send({type:"restart"})};$("btnLobbyG").onclick=function(){send({type:"backToLobby"})};';
h = h.replace(oldScript, newScript);

// Make sure gameHostBtns shows for host during game - add to renderGame
let oldRender = 'function renderGame(){if(!G)return;';
let newRender = 'function renderGame(){if(!G)return;var ghb=$("gameHostBtns");if(ghb)ghb.classList.toggle("show",isHost());';
h = h.replace(oldRender, newRender);

fs.writeFileSync("public/index.html", h, "utf8");
console.log("Fixed! Buttons added to game screen for host.");
