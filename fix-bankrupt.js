const fs = require("fs");
let h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");

// Replace the entire showEnd function
const oldShowEnd = `function showEnd(){let sorted=[...G.players].sort((a,b)=>b.total-a.total);let w=sorted[0];
let pool=G.players.length*ANTE*G.mult,rats=PR[G.players.length];
document.getElementById('wn').textContent=w.name+' \u83b7\u80dc!';document.getElementById('ws').textContent='\u6700\u7ec8\u5f97\u5206: '+w.total+' \u5206';
let h='<thead><tr><th>#</th><th>\u73a9\u5bb6</th><th>\u603b\u5206</th><th>\u6b22\u4e50\u8c46</th></tr></thead><tbody>';
sorted.forEach((p,i)=>{let bc=0;if(i===0)bc=pool;else{bc=-Math.round(pool*(rats[rats.length-i]||rats[0]))}p.beans+=bc;
let cls=i===0?'wr':'',ct=bc>=0?'+'+bc:''+bc,cc=bc>=0?'pos':'neg';
h+='<tr class="'+cls+'"><td>'+(i+1)+'</td><td>'+p.name+'</td><td>'+p.total+'</td><td><span class="bc '+cc+'">'+ct+'</span></td></tr>'});
h+='</tbody>';document.getElementById('frt').innerHTML=h;S('gameEnd')}`;

const newShowEnd = `function showEnd(){let sorted=[...G.players].sort((a,b)=>b.total-a.total);let w=sorted[0];
let pool=G.players.length*ANTE*G.mult,rats=PR[G.players.length];
document.getElementById('wn').textContent=w.name+' \u83b7\u80dc!';document.getElementById('ws').textContent='\u6700\u7ec8\u5f97\u5206: '+w.total+' \u5206';
let totalPaid=0;
sorted.forEach((p,i)=>{if(i===0)return;let owe=Math.round(pool*(rats[rats.length-i]||rats[0]));
if(p.beans<owe){p._bk=true;p._bc=-p.beans;totalPaid+=p.beans;p.beans=0}
else{p._bk=false;p._bc=-owe;totalPaid+=owe;p.beans-=owe}});
sorted[0]._bc=totalPaid;sorted[0].beans+=totalPaid;sorted[0]._bk=false;
let h='<thead><tr><th>#</th><th>\u73a9\u5bb6</th><th>\u603b\u5206</th><th>\u6b22\u4e50\u8c46</th><th></th></tr></thead><tbody>';
sorted.forEach((p,i)=>{let cls=i===0?'wr':'',ct=p._bc>=0?'+'+p._bc:''+p._bc,cc=p._bc>=0?'pos':'neg';
h+='<tr class="'+cls+'"><td>'+(i+1)+'</td><td>'+p.name+'</td><td>'+p.total+'</td><td><span class="bc '+cc+'">'+ct+'</span> (\u4f59'+p.beans+')</td><td>'+(p._bk?'\ud83d\udcb8 \u7834\u4ea7':'')+'</td></tr>'});
h+='</tbody>';document.getElementById('frt').innerHTML=h;S('gameEnd')}`;

h = h.replace(oldShowEnd, newShowEnd);

fs.writeFileSync("C:/Users/hortor/flip7-game/index.html", h, "utf8");
console.log("Bankruptcy logic added!");

// Verify
h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");
let i = h.indexOf("function showEnd");
console.log(h.substring(i, i+600));