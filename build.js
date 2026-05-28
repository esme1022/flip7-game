const fs = require("fs");
const path = require("path");

const html = String.raw`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no">
<title>Flip7 翻转七</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--pri:#6c5ce7;--pri2:#a29bfe;--red:#e74c3c;--grn:#27ae60;--ylw:#f39c12;--bg:#1a1a2e;--bg2:#16213e;--bg3:#0f3460;--txt:#eee;--dim:#aaa;--r:12px}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--bg);color:var(--txt);min-height:100vh;overflow-x:hidden}
.scr{display:none;min-height:100vh;padding:20px;animation:fi .3s}
.scr.act{display:flex;flex-direction:column;align-items:center}
@keyframes fi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes su{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes gl{0%,100%{box-shadow:0 0 5px var(--ylw)}50%{box-shadow:0 0 20px var(--ylw),0 0 40px var(--ylw)}}
.btn{padding:12px 28px;border:none;border-radius:var(--r);font-size:16px;font-weight:600;cursor:pointer;transition:all .2s}
.btn:active{transform:scale(.95)}.btn:disabled{opacity:.4;cursor:not-allowed}
.bp{background:var(--pri);color:#fff}.bp:hover{background:var(--pri2)}
.bd{background:var(--red);color:#fff}.bs{background:var(--grn);color:#fff}
.bw{background:var(--ylw);color:#fff}.bo{background:0 0;border:2px solid var(--pri);color:var(--pri)}
.bl{padding:16px 40px;font-size:18px}
.logo{font-size:48px;font-weight:900;background:linear-gradient(135deg,var(--pri),var(--ylw));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.sub{color:var(--dim);font-size:18px;margin-top:8px}
.rbox{background:var(--bg2);border-radius:var(--r);padding:20px;max-width:500px;text-align:left;max-height:300px;overflow-y:auto}
.rbox h3{color:var(--pri2);margin-bottom:10px}.rbox li{color:var(--dim);font-size:14px;line-height:1.8;margin-left:20px}
#home{justify-content:center;text-align:center;gap:30px}
#setup{justify-content:center;gap:20px;max-width:500px;margin:0 auto;width:100%}
.stit{font-size:24px;font-weight:700}
.pcnt{display:flex;gap:10px;justify-content:center}
.pcnt button{width:48px;height:48px;border-radius:50%;border:2px solid var(--bg3);background:var(--bg2);color:var(--txt);font-size:18px;font-weight:700;cursor:pointer;transition:all .2s}
.pcnt button.sel{border-color:var(--pri);background:var(--pri)}
.ninp{width:100%;display:flex;flex-direction:column;gap:10px}
.ninp input{width:100%;padding:12px 16px;border-radius:var(--r);border:2px solid var(--bg3);background:var(--bg2);color:var(--txt);font-size:16px;outline:none}
.ninp input:focus{border-color:var(--pri)}
#game{padding:10px;gap:10px}
.ghdr{width:100%;max-width:600px;display:flex;justify-content:space-between;align-items:center;background:var(--bg2);border-radius:var(--r);padding:10px 16px;font-size:13px}
.ghdr .gi{display:flex;flex-direction:column;align-items:center;gap:2px}
.ghdr .gl2{color:var(--dim);font-size:11px}.ghdr .gv{font-weight:700}
.sb{width:100%;max-width:600px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.pc{padding:6px 12px;border-radius:20px;font-size:12px;font-weight:600;background:var(--bg3);border:2px solid transparent;transition:all .2s;white-space:nowrap}
.pc.cur{border-color:var(--pri);background:var(--pri);animation:gl 1.5s infinite}
.pc.std{border-color:var(--grn);opacity:.7}.pc.bst{border-color:var(--red);opacity:.5;text-decoration:line-through}
.pc .cs{margin-left:6px;color:var(--ylw)}
.ha{width:100%;max-width:600px;min-height:180px;background:var(--bg2);border-radius:var(--r);padding:16px;display:flex;flex-direction:column;gap:12px}
.hlb{font-size:14px;color:var(--dim)}.hc{display:flex;flex-wrap:wrap;gap:8px;min-height:70px;align-items:center;justify-content:center}
.cd{width:52px;height:74px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,.2);animation:su .3s;transition:transform .2s}
.cd:hover{transform:translateY(-3px)}
.cn{background:#fff;color:#333}.cb{background:linear-gradient(135deg,#f8e71c,#f5a623);color:#333}
.ca{color:#fff;font-size:11px;text-align:center;line-height:1.2;padding:4px}
.ca.fr{background:linear-gradient(135deg,#74b9ff,#0984e3)}
.ca.f3{background:linear-gradient(135deg,#fd79a8,#e84393)}
.ca.sf{background:linear-gradient(135deg,#55efc4,#00b894)}
.ba{display:flex;gap:6px;flex-wrap:wrap}
.bt{padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600;background:rgba(245,166,35,.2);color:var(--ylw)}
.st{padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600;background:rgba(39,174,96,.2);color:var(--grn)}
.aa{width:100%;max-width:600px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.aa .btn{min-width:120px}
.ov{position:fixed;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;z-index:100}
.ov.bg1{background:rgba(0,0,0,.85)}.ov.bg2{background:var(--bg)}
.ov h2{font-size:24px}.ov h3{font-size:20px}.ov p{color:var(--dim);text-align:center;max-width:320px}
.tl{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.tb{padding:16px 24px;border-radius:var(--r);background:var(--bg2);border:2px solid var(--bg3);color:var(--txt);font-size:16px;cursor:pointer;transition:all .2s}
.tb:hover{border-color:var(--pri);background:var(--bg3)}
.glog{width:100%;max-width:600px;background:var(--bg2);border-radius:var(--r);padding:12px;max-height:120px;overflow-y:auto}
.le{font-size:12px;color:var(--dim);padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.le:last-child{border:none}.le.ex{color:var(--red)}.le.ok{color:var(--grn)}.le.ac{color:var(--pri2)}
#roundEnd,#gameEnd{justify-content:center;gap:20px;text-align:center}
.rt{width:100%;max-width:500px;border-collapse:collapse}
.rt th,.rt td{padding:10px 12px;text-align:center;border-bottom:1px solid var(--bg3)}
.rt th{color:var(--dim);font-size:13px;font-weight:600}
.rt .br{color:var(--red);opacity:.7}.rt .wr{color:var(--ylw);font-weight:700}.rt .fr{color:var(--grn);font-weight:700}
.crown{font-size:60px}.ftit{font-size:28px;font-weight:700;color:var(--ylw)}
.bc{font-size:13px}.bc.pos{color:var(--grn)}.bc.neg{color:var(--red)}
@media(max-width:480px){.cd{width:44px;height:64px;font-size:12px}.btn{padding:10px 20px;font-size:14px}.logo{font-size:36px}.ghdr{font-size:11px;padding:8px 10px}}
</style>
</head>
<body>
<div id="home" class="scr act"><div><div class="logo">FLIP 7</div><div class="sub">翻转七 · 推测运气卡牌游戏</div></div><div class="rbox"><h3>游戏规则</h3><ul><li>2-6 人轮流翻牌，收集不同数值卡牌获取积分</li><li>翻到重复数值 → 爆炸出局，本回合 0 分</li><li>集齐 7 张不同数值 → 七连翻 +15 分</li><li>功能牌：冻结、翻三张、安全牌</li><li>庄家可加注（最多3次），增加惩罚风险</li><li>率先累计 200 分获胜！</li></ul></div><button class="btn bp bl" onclick="S('setup')">开始游戏</button></div>
<div id="setup" class="scr"><div class="stit">游戏设置</div><p style="color:var(--dim)">选择玩家人数</p><div class="pcnt" id="pcb"></div><div class="ninp" id="ni"></div><button class="btn bp bl" onclick="startGame()">开始游戏</button><button class="btn bo" onclick="S('home')">返回</button></div>
<div id="game" class="scr"><div class="ghdr" id="gh"></div><div class="sb" id="sb2"></div><div class="ha" id="ha"></div><div class="aa" id="aa"></div><div class="glog" id="glog"></div></div>
<div id="roundEnd" class="scr"><h2 id="ret"></h2><table class="rt" id="rrt"></table><button class="btn bp bl" onclick="nextRound()">下一回合</button></div>
<div id="gameEnd" class="scr"><div class="crown">👑</div><div class="ftit" id="wn"></div><p style="color:var(--dim)" id="ws"></p><table class="rt" id="frt"></table><div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><button class="btn bp bl" onclick="restartSame()">再来一局</button><button class="btn bo" onclick="S('home')">返回首页</button></div></div>
<script>
const WIN=200,BEANS=5000,ANTE=100,MAXR=3;
const PR={2:[1],3:[.6,.4],4:[.5,.3,.2],5:[.4,.3,.2,.1],6:[.4,.3,.2,.07,.03]};
let G={players:[],deck:[],disc:[],round:0,cur:0,dealer:0,raise:0,totalR:0,phase:'setup',log:[],pending:[],f3r:0,f3t:-1};
let pcount=4;

function mkDeck(){let d=[];for(let v=0;v<=12;v++){let n=Math.max(1,v);for(let i=0;i<n;i++)d.push({t:'n',v})}
d.push({t:'b',v:'+2'},{t:'b',v:'+4'},{t:'b',v:'+6'},{t:'b',v:'+8'},{t:'b',v:'+10'},{t:'b',v:'x2'});
for(let i=0;i<3;i++){d.push({t:'a',v:'freeze'});d.push({t:'a',v:'flip3'});d.push({t:'a',v:'safety'})}return d}

function shuf(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function draw(){if(!G.deck.length){if(!G.disc.length)return null;G.deck=shuf([...G.disc]);G.disc=[];log('牌堆耗尽，弃牌堆重新洗入')}return G.deck.pop()}
function S(id){document.querySelectorAll('.scr').forEach(s=>s.classList.remove('act'));document.getElementById(id).classList.add('act')}
function cname(c){if(c.t==='n')return c.v.toString();if(c.t==='b')return c.v;return{freeze:'冻结',flip3:'翻三张',safety:'安全牌'}[c.v]}
function cdisp(c){return'['+cname(c)+']'}
function log(t,cls=''){G.log.push({t,cls})}

function initSetup(){let h='';for(let i=2;i<=6;i++)h+='<button class="'+(i===pcount?'sel':'')+'" onclick="setPc('+i+')">'+i+'</button>';
document.getElementById('pcb').innerHTML=h;updNI()}
function setPc(n){pcount=n;initSetup()}
function updNI(){let h='';for(let i=0;i<pcount;i++)h+='<input placeholder="玩家'+(i+1)+'的名称" id="pn'+i+'" maxlength="10">';document.getElementById('ni').innerHTML=h}

function startGame(){G.players=[];for(let i=0;i<pcount;i++){let n=(document.getElementById('pn'+i).value||'').trim()||('玩家'+(i+1));
G.players.push({name:n,hand:[],bonus:[],total:0,rscore:0,beans:BEANS-ANTE,status:'active',safe:false})}
G.deck=shuf(mkDeck());G.disc=[];G.round=0;G.dealer=0;G.totalR=0;G.log=[];G.pending=[];newRound()}

function newRound(){G.round++;G.raise=0;G.f3r=0;G.f3t=-1;G.pending=[];
G.players.forEach(p=>{p.hand=[];p.bonus=[];p.rscore=0;p.status='active';p.safe=false});
G.log=[];log('=== 第'+G.round+'回合 ===');log('庄家: '+G.players[G.dealer].name);dealInit()}

function dealInit(){log('发牌...');for(let i=0;i<G.players.length;i++){let idx=(G.dealer+i)%G.players.length;let c=draw();
if(!c){endRound();return}if(c.t==='a'){G.pending.push({c,pi:idx});log(G.players[idx].name+'发牌得到【'+cname(c)+'】待结算','ac')}
else{addCard(idx,c);log(G.players[idx].name+'初始牌: '+cdisp(c))}}
if(G.pending.length)procPend();else chkRaise()}

function procPend(){if(!G.pending.length){chkRaise();return}let a=G.pending.shift();handleAction(a.c,a.pi)}
function chkRaise(){if(G.totalR<MAXR)showRaise();else startTurns()}

function showRaise(){let d=G.players[G.dealer],m=Math.pow(2,G.raise),nm=m*2;
let ov=document.createElement('div');ov.className='ov bg1';ov.id='rov';
ov.innerHTML='<h3>'+d.name+'（庄家）</h3><p>当前底注倍率: x'+m+'<br>剩余加注次数: '+(MAXR-G.totalR)+'</p><button class="btn bw" onclick="doRaise()">加注 → x'+nm+'</button><button class="btn bo" onclick="skipR()">不加注</button>';
document.body.appendChild(ov);S('game');render()}

function doRaise(){G.raise++;G.totalR++;log('庄家加注！倍率→x'+Math.pow(2,G.raise),'ac');rmOv('rov');if(G.totalR<MAXR)showRaise();else startTurns()}
function skipR(){rmOv('rov');startTurns()}
function startTurns(){G.cur=G.dealer;G.phase='playing';S('game');showPass()}

function showPass(){let p=G.players[G.cur];if(p.status!=='active'){advance();return}
let ov=document.createElement('div');ov.className='ov bg2';ov.id='pov';
ov.innerHTML='<h2>轮到 '+p.name+'</h2><p>请将设备传递给该玩家</p><button class="btn bp bl" onclick="rmOv(\\\"pov\\\");render()">我准备好了</button>';
document.body.appendChild(ov)}

function rmOv(id){let e=document.getElementById(id);if(e)e.remove()}

function render(){let p=G.players[G.cur],m=Math.pow(2,G.raise);
document.getElementById('gh').innerHTML='<div class="gi"><span class="gl2">回合</span><span class="gv">'+G.round+'</span></div><div class="gi"><span class="gl2">牌堆</span><span class="gv">'+G.deck.length+'</span></div><div class="gi"><span class="gl2">倍率</span><span class="gv">x'+m+'</span></div><div class="gi"><span class="gl2">庄家</span><span class="gv">'+G.players[G.dealer].name+'</span></div>';
let sb='';G.players.forEach((pl,i)=>{let cls='pc';if(i===G.cur&&pl.status==='active')cls+=' cur';if(pl.status==='stayed')cls+=' std';if(pl.status==='busted')cls+=' bst';
sb+='<div class="'+cls+'">'+pl.name+'<span class="cs">'+pl.total+'</span></div>'});
document.getElementById('sb2').innerHTML=sb;
let ha='<div class="hlb">'+p.name+' 的手牌 (累计:'+p.total+'分)</div><div class="hc">';
p.hand.forEach(c=>{ha+=rcard(c)});if(!p.hand.length)ha+='<span style="color:var(--dim)">暂无手牌</span>';ha+='</div>';
if(p.bonus.length||p.safe){ha+='<div class="ba">';p.bonus.forEach(b=>{ha+='<span class="bt">'+b.v+'</span>'});if(p.safe)ha+='<span class="st">安全牌</span>';ha+='</div>'}
document.getElementById('ha').innerHTML=ha;
let aa='';if(G.f3r>0&&G.f3t===G.cur){aa='<button class="btn bd" onclick="doF3()">强制翻牌(剩余'+G.f3r+'张)</button>'}
else if(p.status==='active'){let cs=p.hand.length>0;aa='<button class="btn bp" onclick="doHit()">翻牌</button><button class="btn bs" onclick="doStay()"'+(cs?'':' disabled')+'>停牌</button>'}
document.getElementById('aa').innerHTML=aa;
let lg='';G.log.slice(-20).forEach(l=>{lg+='<div class="le '+l.cls+'">'+l.t+'</div>'});
document.getElementById('glog').innerHTML=lg;document.getElementById('glog').scrollTop=99999}

function rcard(c){if(c.t==='n')return'<div class="cd cn">'+c.v+'</div>';if(c.t==='b')return'<div class="cd cb">'+c.v+'</div>';
let sc=c.v==='freeze'?'fr':c.v==='flip3'?'f3':'sf';return'<div class="cd ca '+sc+'">'+cname(c)+'</div>'}

function doHit(){let c=draw();if(!c){log('牌堆空！');endRound();return}let p=G.players[G.cur];log(p.name+' 翻牌: '+cdisp(c));
if(c.t==='n'){if(p.hand.some(x=>x.t==='n'&&x.v===c.v)){if(p.safe){p.safe=false;log(p.name+' 安全牌生效！','ok');render();return}
p.status='busted';log(p.name+' 爆炸！重复['+c.v+']','ex');p.hand=[];p.bonus=[];render();setTimeout(()=>advance(),600);return}
p.hand.push(c);if(uniq(p).length>=7){log(p.name+' 七连翻！+15分！','ok');endRound(G.cur);return}}
else if(c.t==='b'){p.bonus.push(c)}else{handleAction(c,G.cur);return}
render();advance()}

function doStay(){let p=G.players[G.cur];p.status='stayed';log(p.name+' 停牌','ok');advance()}

function doF3(){let c=draw();if(!c){G.f3r=0;log('牌堆空');chkEnd();return}let p=G.players[G.f3t];
log('[翻三张]'+p.name+'翻出:'+cdisp(c));G.f3r--;
if(c.t==='n'){if(p.hand.some(x=>x.t==='n'&&x.v===c.v)){if(p.safe){p.safe=false;log(p.name+'安全牌生效！','ok')}
else{p.status='busted';G.f3r=0;log(p.name+'翻三张中爆炸！','ex');p.hand=[];p.bonus=[];render();setTimeout(()=>advance(),600);return}}
else{p.hand.push(c);if(uniq(p).length>=7){G.f3r=0;log(p.name+'翻三张达成七连翻！','ok');endRound(G.f3t);return}}}
else if(c.t==='b'){p.bonus.push(c)}else{G.pending.push({c,pi:G.f3t});log('【'+cname(c)+'】暂存','ac')}
render();if(G.f3r<=0&&G.pending.length){setTimeout(()=>procPend(),400)}else if(G.f3r<=0){advance()}}

function handleAction(c,from){let act=G.players.filter((p,i)=>p.status==='active').map((p,i)=>({name:p.name,idx:G.players.indexOf(p)}));
if(!act.length){afterAct();return}
if(c.v==='freeze'){if(G.players[from].safe&&c.v==='freeze'){}
showTarget('冻结：选择一名玩家强制停牌',act,(ti)=>{G.players[ti].status='stayed';log(G.players[from].name+'对'+G.players[ti].name+'使用冻结','ac');afterAct()})}
else if(c.v==='flip3'){showTarget('翻三张：选择一名玩家强制翻3张',act,(ti)=>{log(G.players[from].name+'对'+G.players[ti].name+'使用翻三张','ac');G.f3r=3;G.f3t=ti;G.cur=ti;render()})}
else if(c.v==='safety'){showTarget('安全牌：选择一名玩家获得豁免',act,(ti)=>{G.players[ti].safe=true;log(G.players[from].name+'对'+G.players[ti].name+'使用安全牌','ac');afterAct()})}}

function afterAct(){if(G.pending.length){setTimeout(()=>procPend(),300)}else if(G.phase==='playing'){if(!chkEnd())advance()}else{chkRaise()}}

function showTarget(title,targets,cb){let ov=document.createElement('div');ov.className='ov bg1';ov.id='tov';
let b='';targets.forEach(t=>{b+='<button class="tb" data-idx="'+t.idx+'">'+t.name+'</button>'});
ov.innerHTML='<h3>'+title+'</h3><div class="tl">'+b+'</div>';document.body.appendChild(ov);
ov.querySelectorAll('.tb').forEach(btn=>{btn.onclick=()=>{rmOv('tov');cb(parseInt(btn.dataset.idx))}})}

function advance(){if(chkEnd())return;let next=(G.cur+1)%G.players.length,att=0;
while(G.players[next].status!=='active'&&att<G.players.length){next=(next+1)%G.players.length;att++}
if(att>=G.players.length){endRound();return}G.cur=next;showPass()}

function chkEnd(){if(!G.players.some(p=>p.status==='active')){endRound();return true}return false}
function uniq(p){let s=new Set();p.hand.forEach(c=>{if(c.t==='n')s.add(c.v)});return[...s]}

function calcScore(p,f7=false){let ns=0;p.hand.forEach(c=>{if(c.t==='n')ns+=c.v});let mul=1,ba=0;
p.bonus.forEach(b=>{if(b.v==='x2')mul*=2;else ba+=parseInt(b.v)});return ns*mul+ba+(f7?15:0)}

function endRound(f7=-1){G.phase='roundEnd';G.players.forEach((p,i)=>{if(p.status!=='busted'){p.rscore=calcScore(p,i===f7);p.total+=p.rscore}else{p.rscore=0}
p.hand.forEach(c=>G.disc.push(c));p.bonus.forEach(c=>G.disc.push(c))});
if(G.players.some(p=>p.total>=WIN)){showEnd();return}
let best=-1,bi=G.dealer;G.players.forEach((p,i)=>{if(p.rscore>best){best=p.rscore;bi=i}});G.dealer=bi;showRE(f7)}

function showRE(f7){let h='<thead><tr><th>玩家</th><th>状态</th><th>本回合</th><th>总分</th></tr></thead><tbody>';
let sorted=[...G.players].sort((a,b)=>b.rscore-a.rscore);
sorted.forEach(p=>{let cls='',st='停牌';if(p.status==='busted'){cls='br';st='爆炸'}if(G.players.indexOf(p)===f7){cls='fr';st='七连翻!'}
h+='<tr class="'+cls+'"><td>'+p.name+'</td><td>'+st+'</td><td>+'+p.rscore+'</td><td>'+p.total+'</td></tr>'});
h+='</tbody>';document.getElementById('rrt').innerHTML=h;document.getElementById('ret').textContent='第'+G.round+'回合结算';S('roundEnd')}

function nextRound(){newRound();S('game');showPass()}

function showEnd(){let sorted=[...G.players].sort((a,b)=>b.total-a.total);let w=sorted[0];
let m=Math.pow(2,G.raise),pool=G.players.length*ANTE*m,rats=PR[G.players.length];
document.getElementById('wn').textContent=w.name+' 获胜!';document.getElementById('ws').textContent='最终得分: '+w.total+' 分';
let h='<thead><tr><th>#</th><th>玩家</th><th>总分</th><th>欢乐豆</th></tr></thead><tbody>';
sorted.forEach((p,i)=>{let bc=0;if(i===0)bc=pool;else{bc=-Math.round(pool*(rats[i-1]||rats[rats.length-1]))}p.beans+=bc;
let cls=i===0?'wr':'',ct=bc>=0?'+'+bc:''+bc,cc=bc>=0?'pos':'neg';
h+='<tr class="'+cls+'"><td>'+(i+1)+'</td><td>'+p.name+'</td><td>'+p.total+'</td><td><span class="bc '+cc+'">'+ct+'</span></td></tr>'});
h+='</tbody>';document.getElementById('frt').innerHTML=h;S('gameEnd')}

function restartSame(){G.players.forEach(p=>{p.total=0;p.rscore=0;p.hand=[];p.bonus=[];p.beans=BEANS-ANTE;p.status='active';p.safe=false});
G.deck=shuf(mkDeck());G.disc=[];G.round=0;G.dealer=0;G.totalR=0;G.log=[];G.pending=[];newRound()}

function addCard(idx,c){let p=G.players[idx];if(c.t==='n')p.hand.push(c);else if(c.t==='b')p.bonus.push(c)}
initSetup();
</script>
</body></html>`;

fs.writeFileSync(path.join(__dirname, "index.html"), html, "utf8");
console.log("Game built successfully! File: " + path.join(__dirname, "index.html"));