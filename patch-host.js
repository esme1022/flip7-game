const fs=require('fs');
const p='C:/Users/hortor/flip7-game/public/index.html';
let h=fs.readFileSync(p,'utf8');
h=h.replace('.host-only.show{display:block}','.host-only.show{display:block}#hostEnd.host-only.show{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}');
h=h.replace('<div id="hostEnd" class="host-only" style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">','<div id="hostEnd" class="host-only">');
fs.writeFileSync(p,h,'utf8');
console.log('patched hostEnd');
