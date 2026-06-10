const fs = require("fs");
let h = fs.readFileSync("public/index.html","utf8");

// Mobile float: always show 停牌 button regardless of hand length
let old = `var cs=G.players[G.cur].hand.length>0;btns='<button class="btn bp" id="fHit">\\u7ffb\\u724c</button>'+(cs?'<button class="btn bs" id="fStay">\\u505c\\u724c</button>':'')`;
let nw = `btns='<button class="btn bp" id="fHit">\\u7ffb\\u724c</button><button class="btn bs" id="fStay">\\u505c\\u724c</button>'`;
h = h.replace(old, nw);

// Desktop: also always show 停牌 enabled
let oldDesk = `var cs=G.players[G.cur].hand.length>0;aa='<button class="btn bp" id="aHit">`;
let newDesk = `aa='<button class="btn bp" id="aHit">`;
h = h.replace(oldDesk, newDesk);

// Remove the disabled condition on desktop stay button
h = h.replace(`id="aStay"'+(cs?"":' disabled')+'`, `id="aStay"'`);

fs.writeFileSync("public/index.html", h, "utf8");
console.log("Done: 停牌 always available");
