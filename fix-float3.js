const fs = require("fs");
let h = fs.readFileSync("public/index.html","utf8");

// 1. Immediately hide float on click (add $("floatAA").style.display="none" to handlers)
// All float button handlers
h = h.replace(
  'fh.ontouchend=fh.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;this.disabled=true;send({type:"hit"})}',
  'fh.ontouchend=fh.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;$("floatAA").style.display="none";send({type:"hit"})}'
);
h = h.replace(
  'fs2.ontouchend=fs2.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;this.disabled=true;send({type:"stay"})}',
  'fs2.ontouchend=fs2.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;$("floatAA").style.display="none";send({type:"stay"})}'
);
h = h.replace(
  'fr.ontouchend=fr.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;this.disabled=true;send({type:"raise"})}',
  'fr.ontouchend=fr.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;$("floatAA").style.display="none";send({type:"raise"})}'
);
h = h.replace(
  'fk.ontouchend=fk.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;this.disabled=true;send({type:"skip"})}',
  'fk.ontouchend=fk.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;$("floatAA").style.display="none";send({type:"skip"})}'
);

// 2. Also hide float when targetPending is active (in renderFloat early exit)
let oldFloatCheck = 'if(!isMobile||!G||G.phase==="roundEnd"||G.phase==="gameEnd"||G.phase==="lobby"||actionSent){f.style.display="none";return}';
let newFloatCheck = 'if(!isMobile||!G||G.phase==="roundEnd"||G.phase==="gameEnd"||G.phase==="lobby"||actionSent||G.targetPending){f.style.display="none";return}';
h = h.replace(oldFloatCheck, newFloatCheck);

// 3. Make target overlay (tov) z-index higher than float (9999)
let oldOv = '<div id="tov" class="ov" style="display:none">';
let newOv = '<div id="tov" class="ov" style="display:none;z-index:10000">';
h = h.replace(oldOv, newOv);

fs.writeFileSync("public/index.html", h, "utf8");
console.log("Fixed: float hides immediately on click + target overlay on top");
