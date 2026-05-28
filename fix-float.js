const fs = require("fs");
let h = fs.readFileSync("public/index.html","utf8");

// Simplify mobile float: only ONE button at a time
let oldFloat = `function renderFloat(){var f=$("floatAA");var isMobile=window.innerWidth<=480;
if(!isMobile||!G||G.phase==="roundEnd"||G.phase==="gameEnd"||G.phase==="lobby"){f.style.display="none";return}
var dl=G.deadline?Math.max(0,Math.ceil((G.deadline-Date.now())/1000)):0;var cdHtml=dl>0?'<span class="countdown">'+dl+"s</span>":"";var btns="";
if(G.phase==="raise"&&mySeat===G.dealer&&!actionSent){btns='<div class="af-btns"><button class="btn bw" id="fRaise">加注 x'+(G.mult*2)+'</button><button class="btn bo" id="fSkip">不加注</button></div>'}
else if(G.phase==="playing"&&mySeat===G.cur&&G.players[G.cur].status==="active"&&G.f3r<=0&&!G.targetPending&&!actionSent){var cs=G.players[G.cur].hand.length>0;btns='<div class="af-btns"><button class="btn bp" id="fHit">翻牌</button><button class="btn bs" id="fStay"'+(cs?"":' disabled')+'>停牌</button></div>'}
if(btns){f.innerHTML=cdHtml+btns;f.style.display="flex";var fr=$("fRaise");if(fr)fr.ontouchend=fr.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;this.disabled=true;send({type:"raise"})};var fs2=$("fSkip");if(fs2)fs2.ontouchend=fs2.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;this.disabled=true;send({type:"skip"})};var fh=$("fHit");if(fh)fh.ontouchend=fh.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;this.disabled=true;send({type:"hit"})};var fst=$("fStay");if(fst)fst.ontouchend=fst.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;this.disabled=true;send({type:"stay"})}}else{f.style.display="none"}}`;

let newFloat = `function renderFloat(){var f=$("floatAA");var isMobile=window.innerWidth<=480;
if(!isMobile||!G||G.phase==="roundEnd"||G.phase==="gameEnd"||G.phase==="lobby"||actionSent){f.style.display="none";return}
var dl=G.deadline?Math.max(0,Math.ceil((G.deadline-Date.now())/1000)):0;var cdHtml=dl>0?'<span class="countdown">'+dl+"s</span>":"";var btn="";
if(G.phase==="raise"&&mySeat===G.dealer){btn='<button class="btn bw" id="fBtn">\u52a0\u6ce8 x'+(G.mult*2)+'</button>'}
else if(G.phase==="playing"&&mySeat===G.cur&&G.players[G.cur].status==="active"&&G.f3r<=0&&!G.targetPending){btn='<button class="btn bp" id="fBtn">\u7ffb\u724c</button>'}
if(btn){f.innerHTML=cdHtml+btn;f.style.display="flex";var b=$("fBtn");if(b)b.ontouchend=b.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;this.disabled=true;if(G.phase==="raise")send({type:"raise"});else send({type:"hit"})}}else{f.style.display="none"}}`;

h = h.replace(oldFloat, newFloat);

// Also simplify CSS - single button, bigger
let oldFloatCSS = '.action-float{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;display:flex;flex-direction:column;align-items:center;gap:10px;background:rgba(26,26,46,.97);padding:20px 28px;border-radius:16px;box-shadow:0 4px 30px rgba(0,0,0,.7);border:1px solid var(--pri);pointer-events:auto;touch-action:manipulation}.action-float .btn{min-width:100px;padding:14px 20px;font-size:16px;-webkit-tap-highlight-color:transparent;touch-action:manipulation}.action-float .af-btns{display:flex;gap:14px}';
let newFloatCSS = '.action-float{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;display:flex;flex-direction:column;align-items:center;gap:8px;background:rgba(26,26,46,.97);padding:24px 36px;border-radius:20px;box-shadow:0 4px 30px rgba(0,0,0,.7);border:1px solid var(--pri);pointer-events:auto;touch-action:manipulation}.action-float .btn{min-width:140px;padding:18px 32px;font-size:20px;font-weight:700;-webkit-tap-highlight-color:transparent;touch-action:manipulation}';
h = h.replace(oldFloatCSS, newFloatCSS);

fs.writeFileSync("public/index.html", h, "utf8");
console.log("Float simplified: single button only");
