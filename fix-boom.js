const fs = require("fs");
let h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");

// === doHit explosion: show conflicting card + highlight both duplicates, then explode ===
const oldBust = "p.status='busted';log(p.name+' \u7206\u70b8\uff01\u91cd\u590d['+c.v+']','ex');p.hand=[];p.bonus=[];render();setTimeout(()=>advance(),500);return}";
const newBust = "p.hand.forEach(x=>{if(x.t==='n'&&x.v===c.v)x.xx=true});p.hand.push({t:'n',v:c.v,xx:true});log(p.name+' \u7ffb\u51fa\u91cd\u590d['+c.v+']\uff01','ex');render();setTimeout(()=>{p.status='busted';log(p.name+' \ud83d\udca5 \u7206\u70b8\uff01','ex');p.hand=[];p.bonus=[];render();setTimeout(()=>advance(),600)},1200);return}";
h = h.replace(oldBust, newBust);

// === autoF3 explosion: same visual treatment ===
const oldF3Bust = "else{p.status='busted';G.f3r=0;log(p.name+' \u7ffb\u4e09\u5f20\u4e2d\u7206\u70b8\uff01','ex');p.hand=[];p.bonus=[];render();setTimeout(()=>advance(),600)}";
const newF3Bust = "else{p.hand.forEach(x=>{if(x.t==='n'&&x.v===c.v)x.xx=true});p.hand.push({t:'n',v:c.v,xx:true});log(p.name+' \u7ffb\u51fa\u91cd\u590d['+c.v+']\uff01','ex');G.f3r=0;render();setTimeout(()=>{p.status='busted';log(p.name+' \ud83d\udca5 \u7ffb\u4e09\u5f20\u4e2d\u7206\u70b8\uff01','ex');p.hand=[];p.bonus=[];render();setTimeout(()=>advance(),600)},1200)}";
h = h.replace(oldF3Bust, newF3Bust);

fs.writeFileSync("C:/Users/hortor/flip7-game/index.html", h, "utf8");
console.log("Explosion UI fixed!");

// Verify
h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");
let i = h.indexOf("p.hand.forEach(x=>{if(x.t==='n'&&x.v===c.v)x.xx=true})");
console.log("\n=== doHit explosion ===");
console.log(h.substring(i, i+280));
i = h.indexOf("p.hand.forEach(x=>{if(x.t==='n'&&x.v===c.v)x.xx=true})", i+50);
console.log("\n=== autoF3 explosion ===");
console.log(h.substring(i, i+280));