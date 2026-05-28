const fs = require("fs");
let h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");

// === FIX 1: All skill cards can target self + show who is using the card ===
// Replace the entire handleAction function
const oldHandleAction = `function handleAction(c,from){let act=G.players.map((p,i)=>({name:p.name,idx:i})).filter(x=>G.players[x.idx].status==='active');
if(!act.length){afterAct();return}
if(c.v==='freeze'){let fAct=act.filter(x=>x.idx!==from);if(!fAct.length){afterAct();return}showTarget('\u51bb\u7ed3\uff1a\u9009\u62e9\u4e00\u540d\u5176\u4ed6\u73a9\u5bb6\u5f3a\u5236\u505c\u724c',fAct,(ti)=>{G.players[ti].status='stayed';log(G.players[from].name+' \u5bf9 '+G.players[ti].name+' \u4f7f\u7528\u51bb\u7ed3','ac');render();afterAct()})}
else if(c.v==='flip3'){showTarget('\u7ffb\u4e09\u5f20\uff1a\u9009\u62e9\u4e00\u540d\u73a9\u5bb6\u5f3a\u5236\u7ffb3\u5f20',act,(ti)=>{log(G.players[from].name+' \u5bf9 '+G.players[ti].name+' \u4f7f\u7528\u7ffb\u4e09\u5f20','ac');G.f3r=3;G.f3t=ti;render()})}
else if(c.v==='safety'){showTarget('\u5b89\u5168\u724c\uff1a\u9009\u62e9\u4e00\u540d\u73a9\u5bb6\u83b7\u5f97\u8c41\u514d',act,(ti)=>{G.players[ti].safe=true;log(G.players[from].name+' \u5bf9 '+G.players[ti].name+' \u4f7f\u7528\u5b89\u5168\u724c','ac');render();afterAct()})}}`;

const newHandleAction = `function handleAction(c,from){let act=G.players.map((p,i)=>({name:p.name,idx:i})).filter(x=>G.players[x.idx].status==='active');
if(!act.length){afterAct();return}
let who=G.players[from].name;
if(c.v==='freeze'){showTarget('\u3010'+who+'\u3011\u4f7f\u7528\u51bb\u7ed3\uff1a\u9009\u62e9\u4e00\u540d\u73a9\u5bb6\u5f3a\u5236\u505c\u724c',act,(ti)=>{G.players[ti].status='stayed';log(who+' \u5bf9 '+G.players[ti].name+' \u4f7f\u7528\u51bb\u7ed3','ac');render();setTimeout(afterAct,100)})}
else if(c.v==='flip3'){showTarget('\u3010'+who+'\u3011\u4f7f\u7528\u7ffb\u4e09\u5f20\uff1a\u9009\u62e9\u4e00\u540d\u73a9\u5bb6',act,(ti)=>{log(who+' \u5bf9 '+G.players[ti].name+' \u4f7f\u7528\u7ffb\u4e09\u5f20','ac');G.f3r=3;G.f3t=ti;render();setTimeout(autoF3,800)})}
else if(c.v==='safety'){showTarget('\u3010'+who+'\u3011\u4f7f\u7528\u5b89\u5168\u724c\uff1a\u9009\u62e9\u4e00\u540d\u73a9\u5bb6\u83b7\u5f97\u8c41\u514d',act,(ti)=>{G.players[ti].safe=true;log(who+' \u5bf9 '+G.players[ti].name+' \u4f7f\u7528\u5b89\u5168\u724c','ac');render();setTimeout(afterAct,100)})}}`;

h = h.replace(oldHandleAction, newHandleAction);

// === FIX 3: Auto-flip for flip3 (no button click needed) ===
// Add autoF3 function and modify doF3 to chain automatically
const oldDoF3 = `function doF3(){let c=draw();if(!c){G.f3r=0;log('\u724c\u5806\u7a7a');render();advance();return}let p=G.players[G.f3t];
log('[\u7ffb\u4e09\u5f20] '+p.name+' \u7ffb\u51fa: '+cdisp(c));G.f3r--;
if(c.t==='n'){if(p.hand.some(x=>x.t==='n'&&x.v===c.v)){if(p.safe){p.safe=false;log(p.name+' \u5b89\u5168\u724c\u751f\u6548\uff01','ok')}
else{p.status='busted';G.f3r=0;log(p.name+' \u7ffb\u4e09\u5f20\u4e2d\u7206\u70b8\uff01','ex');p.hand=[];p.bonus=[];render();setTimeout(()=>advance(),500);return}}
else{p.hand.push(c);if(uniq(p).length>=7){G.f3r=0;log(p.name+' \u7ffb\u4e09\u5f20\u8fbe\u6210\u4e03\u8fde\u7ffb\uff01','ok');render();setTimeout(()=>endRound(G.f3t),600);return}}}
else if(c.t==='b'){p.bonus.push(c)}else{G.pending.push({c,pi:G.f3t});log('\u3010'+cname(c)+'\u3011\u6682\u5b58','ac')}
render();if(G.f3r<=0){if(G.pending.length){setTimeout(procPend,300)}else{advance()}}else{setTimeout(()=>render(),200)}}`;

const newDoF3 = `function autoF3(){if(G.f3r<=0){if(G.pending.length){setTimeout(procPend,300)}else{advance()}return}
let c=draw();if(!c){G.f3r=0;log('\u724c\u5806\u7a7a');render();advance();return}let p=G.players[G.f3t];
log('[\u7ffb\u4e09\u5f20] '+p.name+' \u7ffb\u51fa: '+cdisp(c));G.f3r--;
if(c.t==='n'){if(p.hand.some(x=>x.t==='n'&&x.v===c.v)){if(p.safe){p.safe=false;log(p.name+' \u5b89\u5168\u724c\u751f\u6548\uff01','ok');render();setTimeout(autoF3,800)}
else{p.status='busted';G.f3r=0;log(p.name+' \u7ffb\u4e09\u5f20\u4e2d\u7206\u70b8\uff01','ex');p.hand=[];p.bonus=[];render();setTimeout(()=>advance(),600)}}
else{p.hand.push(c);if(uniq(p).length>=7){G.f3r=0;log(p.name+' \u7ffb\u4e09\u5f20\u8fbe\u6210\u4e03\u8fde\u7ffb\uff01','ok');render();setTimeout(()=>endRound(G.f3t),600)}
else{render();setTimeout(autoF3,800)}}}
else if(c.t==='b'){p.bonus.push(c);render();setTimeout(autoF3,800)}
else{G.pending.push({c,pi:G.f3t});log('\u3010'+cname(c)+'\u3011\u6682\u5b58','ac');render();setTimeout(autoF3,800)}}`;

h = h.replace(oldDoF3, newDoF3);

// Remove the doF3 button from render (flip3 now auto-executes)
h = h.replace(
  "if(G.f3r>0&&G.f3t>=0){aa='<button class=\"btn bd\" onclick=\"doF3()\">\u5f3a\u5236\u7ffb\u724c (\u5269\u4f59'+G.f3r+'\u5f20)</button>';}",
  "if(G.f3r>0&&G.f3t>=0){aa='<span style=\"color:var(--ylw)\">\u2699 \u7ffb\u4e09\u5f20\u81ea\u52a8\u6267\u884c\u4e2d\u2026 (\u5269\u4f59'+(G.f3r)+'\u5f20)</span>';}"
);

// === FIX 2: Make player score more visible ===
// Already showing calcScoreLive, just make formatting clearer
h = h.replace(
  "pa+='</div><div class=\"pscore\">\u7d2f\u8ba1:'+pl.total+'\u5206 | \u672c\u56de\u5408:'+calcScoreLive(pl)+'\u5206 | \u8c46:'+pl.beans+'</div><div class=\"pcards\">'",
  "pa+='</div><div class=\"pscore\"><b>\u684c\u4e0a:'+calcScoreLive(pl)+'\u5206</b> | \u7d2f\u8ba1:'+pl.total+'\u5206 | \ud83d\udcb0'+pl.beans+'</div><div class=\"pcards\">'"
);

// Update version
h = h.replace('<title>Flip7 \u7ffb\u8f6c\u4e03 v3</title>', '<title>Flip7 \u7ffb\u8f6c\u4e03 v4</title>');

fs.writeFileSync("C:/Users/hortor/flip7-game/index.html", h, "utf8");
console.log("All v4 fixes applied!");
console.log("1. Skill cards can target self + shows who is using");
console.log("2. Player table score highlighted");
console.log("3. Flip3 auto-executes");

// Verify
h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");
let i = h.indexOf("function handleAction");
console.log("\n=== handleAction ===");
console.log(h.substring(i, i+500));
console.log("\n=== autoF3 ===");
i = h.indexOf("function autoF3");
console.log(h.substring(i, i+300));