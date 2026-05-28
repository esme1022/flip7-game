const fs = require('fs');

const css = `*{margin:0;padding:0;box-sizing:border-box}
:root{--pri:#6c5ce7;--pri2:#a29bfe;--red:#e74c3c;--grn:#27ae60;--ylw:#f39c12;--bg:#1a1a2e;--bg2:#16213e;--bg3:#0f3460;--txt:#eee;--dim:#aaa;--r:12px}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--bg);color:var(--txt);min-height:100vh;overflow-x:hidden}
.scr{display:none;min-height:100vh;padding:20px;animation:fi .3s}.scr.act{display:flex;flex-direction:column;align-items:center}
@keyframes fi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes su{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
.btn{padding:12px 28px;border:none;border-radius:var(--r);font-size:16px;font-weight:600;cursor:pointer;transition:all .2s}
.btn:active{transform:scale(.95)}.btn:disabled{opacity:.4;cursor:not-allowed}
.bp{background:var(--pri);color:#fff}.bp:hover{background:var(--pri2)}
.bd{background:var(--red);color:#fff}.bs{background:var(--grn);color:#fff}
.bw{background:var(--ylw);color:#fff}.bo{background:0 0;border:2px solid var(--pri);color:var(--pri)}
.bl{padding:16px 40px;font-size:18px}
.logo{font-size:48px;font-weight:900;background:linear-gradient(135deg,var(--pri),var(--ylw));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.sub{color:var(--dim);font-size:16px;margin-top:8px}
#lobby{justify-content:center;text-align:center;gap:20px}
.lobby-box{background:var(--bg2);border-radius:var(--r);padding:20px;max-width:400px;width:100%;text-align:left}
.lobby-box h3{color:var(--pri2);margin-bottom:10px}
.seat-list{list-style:none;margin:10px 0}.seat-list li{padding:8px 12px;border-bottom:1px solid var(--bg3);color:var(--txt)}.seat-list li:last-child{border:none}
.join-area{display:flex;gap:10px;margin-top:10px}
.join-area input{flex:1;padding:10px 14px;border-radius:var(--r);border:2px solid var(--bg3);background:var(--bg2);color:var(--txt);font-size:16px;outline:none}
.join-area input:focus{border-color:var(--pri)}
#game{padding:10px;gap:8px}
.ghdr{width:100%;max-width:700px;display:flex;justify-content:space-between;align-items:center;background:var(--bg2);border-radius:var(--r);padding:10px 16px;font-size:13px}
.ghdr .gi{display:flex;flex-direction:column;align-items:center;gap:2px}.ghdr .gl2{color:var(--dim);font-size:11px}.ghdr .gv{font-weight:700}
.players-area{width:100%;max-width:700px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.player-box{flex:1;min-width:140px;max-width:220px;background:var(--bg2);border-radius:var(--r);padding:12px;border:2px solid transparent;transition:all .2s}
.player-box.current{border-color:var(--pri);box-shadow:0 0 15px rgba(108,92,231,.4)}
.player-box.stayed{border-color:var(--grn);opacity:.7}.player-box.busted{border-color:var(--red);opacity:.5}
.player-box.me{background:var(--bg3)}
.player-box .pname{font-size:13px;font-weight:700;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center}
.player-box .pname .badge{font-size:10px;padding:2px 6px;border-radius:8px;background:var(--ylw);color:#333}
.player-box .pscore{font-size:11px;color:var(--dim);margin-bottom:6px}
.player-box .pcards{display:flex;flex-wrap:wrap;gap:4px;min-height:40px}
.player-box .ptags{display:flex;gap:4px;flex-wrap:wrap;margin-top:4px}
.cd{width:36px;height:50px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;box-shadow:0 1px 4px rgba(0,0,0,.2);animation:su .3s}
.cn{background:#fff;color:#333}.cb{background:linear-gradient(135deg,#f8e71c,#f5a623);color:#333}
.ca{color:#fff;font-size:9px;text-align:center;line-height:1.1;padding:2px}
.ca.fr{background:linear-gradient(135deg,#74b9ff,#0984e3)}.ca.f3{background:linear-gradient(135deg,#fd79a8,#e84393)}.ca.sf{background:linear-gradient(135deg,#55efc4,#00b894)}
.tg{padding:2px 6px;border-radius:4px;font-size:9px;font-weight:600}
.tg.bonus{background:rgba(245,166,35,.2);color:var(--ylw)}.tg.safe{background:rgba(39,174,96,.2);color:var(--grn)}
.tg.status-stayed{background:rgba(39,174,96,.15);color:var(--grn)}.tg.status-busted{background:rgba(231,76,60,.15);color:var(--red)}
.aa{width:100%;max-width:700px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;padding:8px 0}.aa .btn{min-width:100px}
.turn-info{width:100%;max-width:700px;background:var(--bg3);border-radius:var(--r);padding:10px 16px;text-align:center;font-size:14px;font-weight:600}
.turn-info .highlight{color:var(--ylw)}
.ov{position:fixed;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;z-index:100;background:rgba(0,0,0,.85)}
.ov h3{font-size:20px}
.tl{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.tb{padding:14px 20px;border-radius:var(--r);background:var(--bg2);border:2px solid var(--bg3);color:var(--txt);font-size:15px;cursor:pointer;transition:all .2s}
.tb:hover{border-color:var(--pri);background:var(--bg3)}
.glog{width:100%;max-width:700px;background:var(--bg2);border-radius:var(--r);padding:10px;max-height:160px;overflow-y:auto}
.le{font-size:11px;color:var(--dim);padding:2px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.le:last-child{border:none}.le.ex{color:var(--red)}.le.ok{color:var(--grn)}.le.ac{color:var(--pri2)}
.result-scr{justify-content:center;gap:20px;text-align:center}
.rt{width:100%;max-width:500px;border-collapse:collapse}
.rt th,.rt td{padding:10px 12px;text-align:center;border-bottom:1px solid var(--bg3)}
.rt th{color:var(--dim);font-size:13px;font-weight:600}
.rt .br{color:var(--red);opacity:.7}.rt .wr{color:var(--ylw);font-weight:700}.rt .fr{color:var(--grn);font-weight:700}
.crown{font-size:60px}.ftit{font-size:28px;font-weight:700;color:var(--ylw)}
.bc{font-size:13px}.bc.pos{color:var(--grn)}.bc.neg{color:var(--red)}
.dbg{display:flex;gap:10px;margin-top:8px;opacity:.6}
.dbg button{font-size:12px;padding:6px 14px}
.spec-bar{background:var(--ylw);color:#333;text-align:center;padding:8px;font-weight:700;font-size:14px;position:fixed;top:0;left:0;right:0;z-index:50}
@media(max-width:480px){.cd{width:30px;height:42px;font-size:10px}.btn{padding:10px 16px;font-size:14px}.logo{font-size:36px}.player-box{min-width:120px;padding:8px}}`;

const script = `
let ws,mySeat=-1,G=null,seats=[];
function connect(){const p=location.protocol==='https:'?'wss:':'ws:';ws=new WebSocket(p+'//'+location.host);
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.type==='state'){G=m.G;seats=m.seats;renderAll()}else if(m.type==='info'){alert(m.text)}};
ws.onclose=()=>{setTimeout(connect,2000)}}
function send(m){if(ws&&ws.readyState===1)ws.send(JSON.stringify(m))}
function doJoin(){const n=document.getElementById('joinName').value.trim();if(!n)return;mySeat=seats.length;send({type:'join',name:n})}
function S(id){document.querySelectorAll('.scr').forEach(s=>s.classList.remove('act'));document.getElementById(id).classList.add('act')}
function renderAll(){if(!G)return;
if(G.phase==='lobby'){renderLobby();S('lobby')}
else if(G.phase==='roundEnd'){renderRE();S('roundEnd')}
else if(G.phase==='gameEnd'){renderGE();S('gameEnd')}
else{renderGame();S('game')}
document.getElementById('specBar').style.display=(G.phase!=='lobby'&&(mySeat<0||mySeat>=G.players.length))?'block':'none';
if(G.targetPending&&G.targetPending.from===mySeat){showTgt()}else{rmOv('tov')}}
function renderLobby(){let h='';if(!seats.length)h='<li style="color:var(--dim)">\u6682\u65e0\u73a9\u5bb6</li>';
else seats.forEach((s,i)=>{h+='<li>'+(i+1)+'. '+s.name+(i===mySeat?' (\u4f60)':'')+'</li>'});
document.getElementById('seatList').innerHTML=h;document.getElementById('startBtn').disabled=seats.length<2}
function renderGame(){const ANTE=100,MAXR=3;let pot=G.players.length*ANTE*G.mult;
document.getElementById('gh').innerHTML='<div class="gi"><span class="gl2">\u724c\u5806</span><span class="gv">'+G.deck.length+'\u5f20</span></div><div class="gi"><span class="gl2">\u5e95\u6ce8</span><span class="gv">'+ANTE+'\u8c46</span></div><div class="gi"><span class="gl2">\u5956\u6c60</span><span class="gv">'+pot+'\u8c46</span></div><div class="gi"><span class="gl2">\u52a0\u6ce8</span><span class="gv">'+(MAXR-G.totalR)+'\u6b21</span></div>';
let ti='';if(G.phase==='raise')ti='\u2728 <span class="highlight">'+G.players[G.dealer].name+'</span>\uff0c\u672c\u56de\u5408\u4f60\u662f\u5e84\u5bb6\uff0c\u53ef\u4ee5\u9009\u62e9\u662f\u5426\u52a0\u6ce8';
else if(G.f3r>0)ti='\u26a0\ufe0f <span class="highlight">'+G.players[G.f3t].name+'</span> \u6b63\u5728\u88ab\u5f3a\u5236\u7ffb\u724c\uff08\u5269\u4f59'+G.f3r+'\u5f20\uff09';
else if(G.phase==='playing')ti='\u25b6 \u8f6e\u5230 <span class="highlight">'+G.players[G.cur].name+'</span> \u64cd\u4f5c';
document.getElementById('ti').innerHTML=ti;
let pa='';G.players.forEach((pl,i)=>{let cls='player-box';if(i===G.cur&&G.phase==='playing')cls+=' current';if(pl.status==='stayed')cls+=' stayed';if(pl.status==='busted')cls+=' busted';if(i===mySeat)cls+=' me';
pa+='<div class="'+cls+'"><div class="pname"><span>'+pl.name+(i===G.dealer?' \ud83c\udfb2':'')+'</span>';
if(i===G.cur&&G.phase==='playing')pa+='<span class="badge">\u5f53\u524d</span>';
pa+='</div><div class="pscore"><b>\u684c\u4e0a:'+csLive(pl)+'\u5206</b> | \u7d2f\u8ba1:'+pl.total+'\u5206 | \ud83d\udcb0'+pl.beans+'</div><div class="pcards">';
pl.hand.forEach(c=>{pa+=rc(c)});if(!pl.hand.length&&pl.status==='active')pa+='<span style="color:var(--dim);font-size:10px">\u6682\u65e0</span>';
pa+='</div><div class="ptags">';pl.bonus.forEach(b=>{pa+='<span class="tg bonus">'+b.v+'</span>'});
if(pl.safe)pa+='<span class="tg safe">\u5b89\u5168\u724c</span>';if(pl.status==='stayed')pa+='<span class="tg status-stayed">\u5df2\u505c\u724c</span>';if(pl.status==='busted')pa+='<span class="tg status-busted">\u5df2\u7206\u70b8</span>';
pa+='</div></div>'});document.getElementById('pa').innerHTML=pa;
let aa='';if(G.phase==='raise'&&mySeat===G.dealer){aa='<button class="btn bw" onclick="send({type:\\'raise\\'})">'+'\u52a0\u6ce8 (x'+G.mult+' \u2192 x'+(G.mult*2)+')</button><button class="btn bo" onclick="send({type:\\'skip\\'})">'+'\u4e0d\u52a0\u6ce8\uff0c\u5f00\u59cb\u7ffb\u724c</button>'}
else if(G.phase==='playing'&&!G.targetPending){if(G.f3r>0){aa='<span style="color:var(--ylw)">\u2699 \u7ffb\u4e09\u5f20\u81ea\u52a8\u6267\u884c\u4e2d\u2026</span>'}
else if(mySeat===G.cur&&G.players[G.cur].status==='active'){let cs=G.players[G.cur].hand.length>0;
aa='<button class="btn bp" onclick="send({type:\\'hit\\'})">'+'\u7ffb\u724c</button><button class="btn bs" onclick="send({type:\\'stay\\'})"'+(cs?'':' disabled')+'>'+'\u505c\u724c</button>'}}
document.getElementById('aa').innerHTML=aa;
let lg='';G.log.forEach(l=>{lg+='<div class="le '+(l.cls||'')+'">'+l.t+'</div>'});document.getElementById('glog').innerHTML=lg;document.getElementById('glog').scrollTop=99999}
function renderRE(){let h='<thead><tr><th>\u73a9\u5bb6</th><th>\u72b6\u6001</th><th>\u672c\u56de\u5408</th><th>\u7d2f\u8ba1</th></tr></thead><tbody>';
let sorted=[...G.players].sort((a,b)=>b.rscore-a.rscore);
sorted.forEach(p=>{let cls='',st='\u505c\u724c';if(p.status==='busted'){cls='br';st='\u7206\u70b8'}if(G.f7winner>=0&&G.players.indexOf(p)===G.f7winner){cls='fr';st='\u4e03\u8fde\u7ffb!'}
h+='<tr class="'+cls+'"><td>'+p.name+'</td><td>'+st+'</td><td>+'+p.rscore+'</td><td>'+p.total+'</td></tr>'});
h+='</tbody>';document.getElementById('rrt').innerHTML=h;document.getElementById('ret').textContent='\u7b2c'+G.round+'\u56de\u5408\u7ed3\u7b97'}
function renderGE(){if(!G.finalRanking)return;let s=G.finalRanking;document.getElementById('wn').textContent=s[0].name+' \u83b7\u80dc!';document.getElementById('ws').textContent='\u6700\u7ec8\u5f97\u5206: '+s[0].total+' \u5206';
let h='<thead><tr><th>#</th><th>\u73a9\u5bb6</th><th>\u603b\u5206</th><th>\u6b22\u4e50\u8c46</th><th></th></tr></thead><tbody>';
s.forEach((p,i)=>{let cls=i===0?'wr':'',ct=p._bc>=0?'+'+p._bc:''+p._bc,cc=p._bc>=0?'pos':'neg';
h+='<tr class="'+cls+'"><td>'+(i+1)+'</td><td>'+p.name+'</td><td>'+p.total+'</td><td><span class="bc '+cc+'">'+ct+'</span> (\u4f59'+p.beans+')</td><td>'+(p._bk?'\ud83d\udcb8 \u7834\u4ea7':'')+'</td></tr>'});
h+='</tbody>';document.getElementById('frt').innerHTML=h}
function showTgt(){if(document.getElementById('tov'))return;let tp=G.targetPending,who=G.players[tp.from].name;
let cn={freeze:'\u51bb\u7ed3',flip3:'\u7ffb\u4e09\u5f20',safety:'\u5b89\u5168\u724c'}[tp.card.v];
let ov=document.createElement('div');ov.className='ov';ov.id='tov';let b='';
tp.targets.forEach(t=>{b+='<button class="tb" onclick="send({type:\\'target\\',idx:'+t.idx+'})">'+t.name+'</button>'});
ov.innerHTML='<h3>\u3010'+who+'\u3011\u4f7f\u7528'+cn+'\uff1a\u9009\u62e9\u76ee\u6807</h3><div class="tl">'+b+'</div>';document.body.appendChild(ov)}
function rmOv(id){let e=document.getElementById(id);if(e)e.remove()}
function rc(c){if(c.xx)return'<div class="cd cn" style="border:2px solid var(--red);box-shadow:0 0 10px var(--red);opacity:.8">'+c.v+'</div>';
if(c.t==='n')return'<div class="cd cn">'+c.v+'</div>';if(c.t==='b')return'<div class="cd cb">'+c.v+'</div>';
let sc=c.v==='freeze'?'fr':c.v==='flip3'?'f3':'sf',nm={freeze:'\u51bb\u7ed3',flip3:'\u7ffb\u4e09\u5f20',safety:'\u5b89\u5168\u724c'};return'<div class="cd ca '+sc+'">'+nm[c.v]+'</div>'}
function csLive(p){if(p.status==='busted')return 0;let ns=0;p.hand.forEach(c=>{if(c.t==='n')ns+=c.v});let mul=1,ba=0;p.bonus.forEach(b=>{if(b.v==='x2')mul*=2;else ba+=parseInt(b.v)});return ns*mul+ba}
connect();
`;

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no">
<title>Flip7 \u7ffb\u8f6c\u4e03 v7</title>
<style>${css}</style>
</head>
<body>
<div id="specBar" class="spec-bar" style="display:none">\ud83d\udc40 \u89c2\u6218\u4e2d - \u7b49\u5f85\u672c\u5c40\u7ed3\u675f\u540e\u53ef\u52a0\u5165</div>
<div id="lobby" class="scr act">
<div><div class="logo">FLIP 7</div><div class="sub">\u591a\u4eba\u5b9e\u65f6\u5bf9\u6218</div></div>
<div class="lobby-box">
<h3>\u623f\u95f4 (\u7b49\u5f85\u73a9\u5bb6\u52a0\u5165)</h3>
<ul class="seat-list" id="seatList"><li style="color:var(--dim)">\u6682\u65e0\u73a9\u5bb6</li></ul>
<div class="join-area"><input id="joinName" placeholder="\u8f93\u5165\u4f60\u7684\u540d\u79f0" maxlength="10"><button class="btn bp" onclick="doJoin()">\u52a0\u5165</button></div>
<button class="btn bp bl" style="margin-top:16px;width:100%" id="startBtn" onclick="send({type:'start'})" disabled>\u5f00\u59cb\u6e38\u620f (\u81f3\u5c112\u4eba)</button>
</div>
</div>
<div id="game" class="scr">
<div class="ghdr" id="gh"></div><div class="turn-info" id="ti"></div><div class="players-area" id="pa"></div><div class="aa" id="aa"></div><div class="glog" id="glog"></div>
<div class="dbg"><button class="btn bo" onclick="send({type:'restart'})">\u91cd\u5f00\u672c\u5c40</button><button class="btn bo" onclick="send({type:'backToLobby'})">\u8fd4\u56de\u623f\u95f4</button></div>
</div>
<div id="roundEnd" class="scr result-scr"><h2 id="ret"></h2><table class="rt" id="rrt"></table><button class="btn bp bl" onclick="send({type:'nextRound'})">\u4e0b\u4e00\u56de\u5408</button></div>
<div id="gameEnd" class="scr result-scr"><div class="crown">\ud83d\udc51</div><div class="ftit" id="wn"></div><p style="color:var(--dim)" id="ws"></p><table class="rt" id="frt"></table>
<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><button class="btn bp bl" onclick="send({type:'restart'})">\u518d\u6765\u4e00\u5c40</button><button class="btn bo" onclick="send({type:'backToLobby'})">\u8fd4\u56de\u623f\u95f4</button></div></div>
<script>${script}</script>
</body></html>`;

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Client HTML generated! Size:', html.length);
