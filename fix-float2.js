const fs = require("fs");
let h = fs.readFileSync("public/index.html","utf8");

// 1. Mobile float: show BOTH 翻牌 and 停牌 buttons (not just one)
let oldFloat = `function renderFloat(){var f=$("floatAA");var isMobile=window.innerWidth<=480;
if(!isMobile||!G||G.phase==="roundEnd"||G.phase==="gameEnd"||G.phase==="lobby"||actionSent){f.style.display="none";return}
var dl=G.deadline?Math.max(0,Math.ceil((G.deadline-Date.now())/1000)):0;var cdHtml=dl>0?'<span class="countdown">'+dl+"s</span>":"";var btn="";
if(G.phase==="raise"&&mySeat===G.dealer){btn='<button class="btn bw" id="fBtn">\u52a0\u6ce8 x'+(G.mult*2)+'</button>'}
else if(G.phase==="playing"&&mySeat===G.cur&&G.players[G.cur].status==="active"&&G.f3r<=0&&!G.targetPending){btn='<button class="btn bp" id="fBtn">\u7ffb\u724c</button>'}
if(btn){f.innerHTML=cdHtml+btn;f.style.display="flex";var b=$("fBtn");if(b)b.ontouchend=b.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;this.disabled=true;if(G.phase==="raise")send({type:"raise"});else send({type:"hit"})}}else{f.style.display="none"}}`;

let newFloat = `function renderFloat(){var f=$("floatAA");var isMobile=window.innerWidth<=480;
if(!isMobile||!G||G.phase==="roundEnd"||G.phase==="gameEnd"||G.phase==="lobby"||actionSent){f.style.display="none";return}
var dl=G.deadline?Math.max(0,Math.ceil((G.deadline-Date.now())/1000)):0;var cdHtml=dl>0?'<span class="countdown">'+dl+"s</span>":"";var btns="";
if(G.phase==="raise"&&mySeat===G.dealer){btns='<button class="btn bw" id="fRaise">\u52a0\u6ce8 x'+(G.mult*2)+'</button><button class="btn bo" id="fSkip">\u4e0d\u52a0\u6ce8</button>'}
else if(G.phase==="playing"&&mySeat===G.cur&&G.players[G.cur].status==="active"&&G.f3r<=0&&!G.targetPending){var cs=G.players[G.cur].hand.length>0;btns='<button class="btn bp" id="fHit">\u7ffb\u724c</button>'+(cs?'<button class="btn bs" id="fStay">\u505c\u724c</button>':'')}
if(btns){f.innerHTML=cdHtml+btns;f.style.display="flex";var fr=$("fRaise");if(fr)fr.ontouchend=fr.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;this.disabled=true;send({type:"raise"})};var fk=$("fSkip");if(fk)fk.ontouchend=fk.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;this.disabled=true;send({type:"skip"})};var fh=$("fHit");if(fh)fh.ontouchend=fh.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;this.disabled=true;send({type:"hit"})};var fs2=$("fStay");if(fs2)fs2.ontouchend=fs2.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;this.disabled=true;send({type:"stay"})}}else{f.style.display="none"}}`;

h = h.replace(oldFloat, newFloat);

// 2. Hide bottom action area (#aa) on mobile - only use float
// Add CSS to hide #aa on mobile
let oldMobileMedia = '@media(max-width:600px){.bottom-row{flex-direction:column}.scoreboard{width:100%;max-height:100px}}';
let newMobileMedia = '@media(max-width:600px){.bottom-row{flex-direction:column}.scoreboard{width:100%;max-height:100px}.aa{display:none!important}}';
h = h.replace(oldMobileMedia, newMobileMedia);

// 3. Fix float CSS to accommodate two buttons side by side
let oldFloatCSS = '.action-float{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;display:flex;flex-direction:column;align-items:center;gap:8px;background:rgba(26,26,46,.97);padding:24px 36px;border-radius:20px;box-shadow:0 4px 30px rgba(0,0,0,.7);border:1px solid var(--pri);pointer-events:auto;touch-action:manipulation}.action-float .btn{min-width:140px;padding:18px 32px;font-size:20px;font-weight:700;-webkit-tap-highlight-color:transparent;touch-action:manipulation}';
let newFloatCSS = '.action-float{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:12px;background:rgba(26,26,46,.97);padding:24px 30px;border-radius:20px;box-shadow:0 4px 30px rgba(0,0,0,.7);border:1px solid var(--pri);pointer-events:auto;touch-action:manipulation}.action-float .btn{min-width:110px;padding:16px 28px;font-size:18px;font-weight:700;-webkit-tap-highlight-color:transparent;touch-action:manipulation}';
h = h.replace(oldFloatCSS, newFloatCSS);

fs.writeFileSync("public/index.html", h, "utf8");
console.log("Done: float has both buttons, bottom aa hidden on mobile");
