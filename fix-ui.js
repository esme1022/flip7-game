const fs = require("fs");
let h = fs.readFileSync("public/index.html","utf8");

// === 1. Mobile floating action buttons + countdown CSS ===
let oldMedia = "@media(max-width:480px){";
let newMedia = `.action-float{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:80;display:flex;gap:12px;background:rgba(26,26,46,.95);padding:14px 20px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,.5);border:1px solid var(--pri)}
.action-float .btn{min-width:80px}
.countdown{display:inline-block;margin-left:8px;padding:2px 8px;border-radius:10px;background:var(--red);color:#fff;font-size:12px;font-weight:700;animation:pulse 1s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
.bottom-row{width:100%;max-width:700px;display:flex;gap:8px;margin-top:8px}
.bottom-row .glog{flex:1;min-width:0}
.scoreboard{width:200px;background:var(--bg2);border-radius:var(--r);padding:10px;max-height:160px;overflow-y:auto;font-size:11px}
.scoreboard h4{font-size:11px;color:var(--pri2);margin-bottom:6px}
.sb-row{display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.sb-row:last-child{border:none}
.sb-name{color:var(--txt);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sb-score{color:var(--ylw);font-weight:700}
.sb-total{color:var(--dim)}
@media(max-width:480px){`;
h = h.replace(oldMedia, newMedia);

// === 2. Modify game HTML structure: wrap log and scoreboard ===
let oldGlog = '<div id="glog" class="glog"></div>';
let newGlog = '<div class="bottom-row"><div id="glog" class="glog"></div><div id="scoreboard" class="scoreboard"><h4>\u79ef\u5206\u699c</h4><div id="sbBody"></div></div></div>';
h = h.replace(oldGlog, newGlog);

// === 3. Add floating action container ===
let oldAA = '<div id="aa" class="aa"></div>';
let newAA = '<div id="aa" class="aa"></div><div id="floatAA" class="action-float" style="display:none"></div>';
h = h.replace(oldAA, newAA);

// === 4. Update renderGame to include countdown, floating buttons, scoreboard ===
// Find renderGame and add countdown + float logic at end
let oldGlogScroll = '$("glog").scrollTop=99999';
// Add scoreboard render + float logic after glog scroll
let scoreboardCode = `;renderScoreboard();renderFloat()`;
h = h.replace(oldGlogScroll, oldGlogScroll + scoreboardCode);

// === 5. Add renderScoreboard and renderFloat functions before connect() ===
let oldConnect = "function connect(){";
let newFunctions = `function renderScoreboard(){if(!G||!G.players)return;var sb="";var sorted=G.players.slice().sort(function(a,b){return b.total-a.total||calcLive(b)-calcLive(a)});
sorted.forEach(function(p,i){var live=calcLive(p);sb+='<div class="sb-row"><span class="sb-name">'+(i+1)+". "+esc(p.name)+'</span><span class="sb-score">'+live+'</span><span class="sb-total">(\u7d2f'+p.total+')</span></div>'});
$("sbBody").innerHTML=sb}
function renderFloat(){var f=$("floatAA");var isMobile=window.innerWidth<=480;
if(!isMobile||!G||G.phase==="roundEnd"||G.phase==="gameEnd"||G.phase==="lobby"){f.style.display="none";return}
var html="";var dl=G.deadline?Math.max(0,Math.ceil((G.deadline-Date.now())/1000)):0;var cdHtml=dl>0?'<span class="countdown">'+dl+"s</span>":"";
if(G.phase==="raise"&&mySeat===G.dealer){html='<button class="btn bw" onclick="send({type:'+String.fromCharCode(39)+'raise'+String.fromCharCode(39)+'})">\\u52a0\\u6ce8 x'+(G.mult*2)+'</button><button class="btn bo" onclick="send({type:'+String.fromCharCode(39)+'skip'+String.fromCharCode(39)+'})">\\u4e0d\\u52a0\\u6ce8</button>'+cdHtml}
else if(G.phase==="playing"&&mySeat===G.cur&&G.players[G.cur].status==="active"&&G.f3r<=0&&!G.targetPending){var cs=G.players[G.cur].hand.length>0;html='<button class="btn bp" onclick="send({type:'+String.fromCharCode(39)+'hit'+String.fromCharCode(39)+'})">\\u7ffb\\u724c</button><button class="btn bs" onclick="send({type:'+String.fromCharCode(39)+'stay'+String.fromCharCode(39)+'})"'+(cs?"":' disabled')+'>\\u505c\\u724c</button>'+cdHtml}
if(html){f.innerHTML=html;f.style.display="flex"}else{f.style.display="none"}}
setInterval(function(){if(G&&G.deadline&&(G.phase==="raise"||G.phase==="playing"))renderFloat()},1000);
function connect(){`;
h = h.replace(oldConnect, newFunctions);

// === 6. Also show countdown in desktop action area ===
// Modify the desktop action rendering to show countdown
let oldRaiseBtn = '\\u52a0\\u6ce8？';
if(h.includes(oldRaiseBtn)){
  h = h.replace(oldRaiseBtn, '\\u52a0\\u6ce8？" + cdDesktop() + "');
}

// Add cdDesktop function
let cdDesktopFn = `function cdDesktop(){if(!G||!G.deadline)return"";var s=Math.max(0,Math.ceil((G.deadline-Date.now())/1000));return s>0?' <span class="countdown">'+s+"s</span>":""}\n`;
h = h.replace("function renderScoreboard", cdDesktopFn + "function renderScoreboard");

// Add countdown to desktop renderGame action area (in the ti turn-info)
let oldTiSet = '$("ti").innerHTML=ti;';
let newTiSet = 'var cdd=cdDesktop();if(cdd&&(G.phase==="raise"||(G.phase==="playing"&&mySeat===G.cur)))ti+=cdd;$("ti").innerHTML=ti;';
h = h.replace(oldTiSet, newTiSet);

// Add interval to refresh countdown on desktop too
h = h.replace("setInterval(function(){if(G&&G.deadline&&(G.phase===\"raise\"||G.phase===\"playing\"))renderFloat()},1000);",
  "setInterval(function(){if(G&&G.deadline&&(G.phase===\"raise\"||G.phase===\"playing\")){renderFloat();var ti2=$('ti');if(ti2){renderGame()}}},1000);");

fs.writeFileSync("public/index.html", h, "utf8");
console.log("Client updated: mobile float + countdown + scoreboard");
