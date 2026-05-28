const fs = require("fs");
let h = fs.readFileSync("public/index.html","utf8");

// === 1. Fix floating button: centered on screen (not bottom), bigger, fix click issue ===
// The click issue is likely caused by z-index or pointer-events conflicts
let oldFloatCSS = '.action-float{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:80;display:flex;gap:12px;background:rgba(26,26,46,.95);padding:14px 20px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,.5);border:1px solid var(--pri)}.action-float .btn{min-width:80px}';
let newFloatCSS = '.action-float{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;display:flex;flex-direction:column;align-items:center;gap:10px;background:rgba(26,26,46,.97);padding:20px 28px;border-radius:16px;box-shadow:0 4px 30px rgba(0,0,0,.7);border:1px solid var(--pri);pointer-events:auto;touch-action:manipulation}.action-float .btn{min-width:100px;padding:14px 20px;font-size:16px;-webkit-tap-highlight-color:transparent;touch-action:manipulation}.action-float .af-btns{display:flex;gap:14px}';
h = h.replace(oldFloatCSS, newFloatCSS);

// === 2. Fix countdown CSS - move margin-left to 0, center it ===
let oldCdCSS = '.countdown{display:inline-block;margin-left:8px;padding:2px 8px;border-radius:10px;background:var(--red);color:#fff;font-size:12px;font-weight:700;animation:pulse 1s infinite}';
let newCdCSS = '.countdown{display:block;text-align:center;margin-bottom:6px;padding:3px 12px;border-radius:10px;background:var(--red);color:#fff;font-size:14px;font-weight:700;animation:pulse 1s infinite}';
h = h.replace(oldCdCSS, newCdCSS);

// === 3. Fix layout: scoreboard LEFT, log RIGHT, equal size ===
let oldBottomRow = '.bottom-row{width:100%;max-width:700px;display:flex;gap:8px;margin-top:8px}.bottom-row .glog{flex:1;min-width:0}';
let newBottomRow = '.bottom-row{width:100%;max-width:700px;display:flex;gap:8px;margin-top:8px}.bottom-row .glog{flex:1;min-width:0}.bottom-row .scoreboard{order:-1}';
h = h.replace(oldBottomRow, newBottomRow);

// Make scoreboard same flex as glog
let oldSbCSS = '.scoreboard{width:200px;flex-shrink:0;background:var(--bg2);border-radius:var(--r);padding:10px;max-height:160px;overflow-y:auto;font-size:11px}';
let newSbCSS = '.scoreboard{flex:1;min-width:0;background:var(--bg2);border-radius:var(--r);padding:10px;max-height:160px;overflow-y:auto;font-size:11px}';
h = h.replace(oldSbCSS, newSbCSS);

// === 4. Unified button text: 要牌 -> 翻牌 on desktop ===
// Find desktop action area rendering with hit button
// Look for the desktop aa rendering
h = h.replace(/\u8981\u724c/g, '\u7ffb\u724c'); // 要牌 -> 翻牌

// === 5. Rewrite renderFloat: countdown ABOVE buttons, use proper event handlers ===
let oldRenderFloat = `function renderFloat(){var f=$("floatAA");var isMobile=window.innerWidth<=480;
if(!isMobile||!G||G.phase==="roundEnd"||G.phase==="gameEnd"||G.phase==="lobby"){f.style.display="none";return}
var html="";var dl=G.deadline?Math.max(0,Math.ceil((G.deadline-Date.now())/1000)):0;var cdHtml=dl>0?'<span class="countdown">'+dl+"s</span>":"";
if(G.phase==="raise"&&mySeat===G.dealer){html='<button class="btn bw" onclick="send({type:'+String.fromCharCode(39)+'raise'+String.fromCharCode(39)+'})">\\u52a0\\u6ce8 x'+(G.mult*2)+'</button><button class="btn bo" onclick="send({type:'+String.fromCharCode(39)+'skip'+String.fromCharCode(39)+'})">\\u4e0d\\u52a0\\u6ce8</button>'+cdHtml}
else if(G.phase==="playing"&&mySeat===G.cur&&G.players[G.cur].status==="active"&&G.f3r<=0&&!G.targetPending){var cs=G.players[G.cur].hand.length>0;html='<button class="btn bp" onclick="send({type:'+String.fromCharCode(39)+'hit'+String.fromCharCode(39)+'})">\\u7ffb\\u724c</button><button class="btn bs" onclick="send({type:'+String.fromCharCode(39)+'stay'+String.fromCharCode(39)+'})"'+(cs?"":' disabled')+'>\\u505c\\u724c</button>'+cdHtml}
if(html){f.innerHTML=html;f.style.display="flex"}else{f.style.display="none"}}`;

let newRenderFloat = `function renderFloat(){var f=$("floatAA");var isMobile=window.innerWidth<=480;
if(!isMobile||!G||G.phase==="roundEnd"||G.phase==="gameEnd"||G.phase==="lobby"){f.style.display="none";return}
var dl=G.deadline?Math.max(0,Math.ceil((G.deadline-Date.now())/1000)):0;var cdHtml=dl>0?'<span class="countdown">'+dl+"s</span>":"";var btns="";
if(G.phase==="raise"&&mySeat===G.dealer){btns='<div class="af-btns"><button class="btn bw" id="fRaise">\u52a0\u6ce8 x'+(G.mult*2)+'</button><button class="btn bo" id="fSkip">\u4e0d\u52a0\u6ce8</button></div>'}
else if(G.phase==="playing"&&mySeat===G.cur&&G.players[G.cur].status==="active"&&G.f3r<=0&&!G.targetPending){var cs=G.players[G.cur].hand.length>0;btns='<div class="af-btns"><button class="btn bp" id="fHit">\u7ffb\u724c</button><button class="btn bs" id="fStay"'+(cs?"":' disabled')+'>\u505c\u724c</button></div>'}
if(btns){f.innerHTML=cdHtml+btns;f.style.display="flex";var fr=$("fRaise");if(fr)fr.ontouchend=fr.onclick=function(e){e.preventDefault();send({type:"raise"})};var fs2=$("fSkip");if(fs2)fs2.ontouchend=fs2.onclick=function(e){e.preventDefault();send({type:"skip"})};var fh=$("fHit");if(fh)fh.ontouchend=fh.onclick=function(e){e.preventDefault();send({type:"hit"})};var fst=$("fStay");if(fst)fst.ontouchend=fst.onclick=function(e){e.preventDefault();send({type:"stay"})}}else{f.style.display="none"}}`;

h = h.replace(oldRenderFloat, newRenderFloat);

fs.writeFileSync("public/index.html", h, "utf8");
console.log("UI fixes applied: float center, unified text, countdown above, layout swap");
