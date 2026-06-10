'use strict';
const express=require('express');
const http=require('http');
const {WebSocketServer}=require('ws');
const path=require('path');

const app=express();
const server=http.createServer(app);
const wss=new WebSocketServer({server});
app.use(express.static(path.join(__dirname,'public')));

const WIN=200,BEANS=5000,ANTE=100;
const PR={2:[1],3:[.6,.4],4:[.5,.3,.2],5:[.4,.3,.2,.1],6:[.4,.3,.2,.07,.03],
  7:[.35,.25,.18,.12,.07,.03],8:[.30,.22,.17,.13,.09,.06,.03],
  9:[.28,.20,.16,.13,.10,.07,.04,.02],10:[.26,.19,.15,.12,.10,.08,.05,.03,.02],
  11:[.24,.18,.14,.12,.10,.08,.06,.04,.025,.015],12:[.22,.17,.14,.11,.10,.08,.07,.05,.03,.02,.01]};

let G=null,seats=[],clients=new Set(),roomSize=4,hostSeat=0;
let turnTimer=null,actionLock=false;
const AI=['电脑A','电脑B','电脑C','电脑D','电脑E','电脑F','电脑G','电脑H','电脑I','电脑J','电脑K','电脑L'];

function initState(){
  G={gameMode:'classic',players:[],deck:[],disc:[],round:0,cur:0,dealer:0,
     mult:1,phase:'lobby',log:[],pending:[],f3r:0,f3t:-1,f3type:3,flip1stop:false,
     targetPending:null,raiseChoice:null,raiseCallback:null,
     roomSize,hostSeat:0,deadline:0,f7winner:-1,finalRanking:null};
  seats=[];
}
initState();

// ===== DECKS =====
function mkClassicDeck(){
  let d=[];
  for(let v=0;v<=12;v++){let n=v<1?1:v;for(let i=0;i<n;i++)d.push({t:'n',v})}
  ['+2','+4','+6','+8','+10','x2'].forEach(v=>d.push({t:'b',v}));
  for(let i=0;i<3;i++)['freeze','flip3','safety'].forEach(v=>d.push({t:'a',v}));
  return d;
}
function mkBerserkDeck(){
  let d=[];
  // 0→1, 1→1, 2→2, ..., 13→13 = 92 regular + 3 special = 95 number cards
  for(let v=0;v<=13;v++){let n=v<=1?1:v;for(let i=0;i<n;i++)d.push({t:'n',v,sp:0})}
  d.push({t:'n',v:0,sp:'c0'},{t:'n',v:7,sp:'b7'},{t:'n',v:13,sp:'c13'});
  // 12 score-change cards
  ['+2','+4','+6','+8','+10','x2','÷2','-2','-4','-6','-8','-10'].forEach(v=>d.push({t:'sc',v}));
  // 14 function cards
  for(let i=0;i<3;i++)['freeze','flip3','safety'].forEach(v=>d.push({t:'fn',v}));
  ['flip4','steal','swap','flip1stop','discard'].forEach(v=>d.push({t:'fn',v}));
  return d;
}

function shuf(a){for(let i=a.length-1;i>0;i--){let j=0|Math.random()*(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function draw(){
  if(!G.deck.length){if(!G.disc.length)return null;G.deck=shuf([...G.disc]);G.disc=[];log('牌堆洗入('+G.deck.length+'张)')}
  return G.deck.pop();
}
function cname(c){
  if(c.t==='n'){if(c.sp==='c0')return'彩色0';if(c.sp==='b7')return'霉运7';if(c.sp==='c13')return'彩色13';return''+c.v}
  if(c.t==='b'||c.t==='sc')return c.v;
  return{freeze:'冻结',flip3:'翻三张',safety:'安全牌',flip4:'翻四张',steal:'偷牌',swap:'换牌',flip1stop:'摸一张停',discard:'弃牌'}[c.v]||c.v;
}
function log(t,cls){G.log.push({t,cls:cls||''})}
function uniqNums(p){let s=new Set();p.hand.forEach(c=>{if(c.t==='n')s.add(c.v)});return[...s]}

function calcScore(p,f7){
  if(G.gameMode==='berserk'){
    let hasC0=p.hand.some(c=>c.t==='n'&&c.sp==='c0')&&uniqNums(p).length<7;
    let ns=hasC0?0:p.hand.reduce((s,c)=>c.t==='n'?s+c.v:s,0);
    let mul=1,add=0;
    p.bonus.forEach(b=>{if(b.v==='x2')mul*=2;else if(b.v==='÷2')mul/=2;else{let n=parseInt(b.v);if(!isNaN(n))add+=n}});
    return Math.max(0,Math.floor(ns*mul+add))+(f7?15:0);
  }
  let ns=p.hand.reduce((s,c)=>c.t==='n'?s+c.v:s,0),mul=1,ba=0;
  p.bonus.forEach(b=>{if(b.v==='x2')mul*=2;else ba+=parseInt(b.v)});
  return ns*mul+ba+(f7?15:0);
}
function csLive(p){return p.status==='busted'?0:calcScore(p,false)}

function broadcast(){
  actionLock=false;
  const s=JSON.stringify({type:'state',G,seats,roomSize,hostSeat});
  clients.forEach(w=>{if(w.readyState===1)w.send(s)});
}
function isAI(i){return seats[i]&&(seats[i].ai||seats[i].dc)}

function setTurnTimer(sec){
  if(turnTimer)clearTimeout(turnTimer);
  G.deadline=Date.now()+sec*1000;
  turnTimer=setTimeout(()=>{
    turnTimer=null;
    if(G.phase==='raiseChoice'){doSkipRaise();return}
    if(G.phase==='playing'&&G.f3r<=0&&!G.targetPending){
      let p=G.players[G.cur];
      if(p&&p.status==='active'){if(G.gameMode==='berserk'||!p.hand.length)doHit();else doStay()}
    }
  },sec*1000);
}
function clearTimer(){if(turnTimer){clearTimeout(turnTimer);turnTimer=null;G.deadline=0}}

function mkPlayer(s){return{name:s.name,hand:[],bonus:[],total:0,rscore:0,beans:BEANS-ANTE,status:'active',safe:false,ai:!!s.ai}}

function startGame(){
  let ai=0;
  while(seats.length<roomSize){while(seats.some(s=>s.name===AI[ai]))ai++;seats.push({name:AI[ai],ai:true,id:'ai_'+ai});ai++}
  G.players=seats.map(mkPlayer);
  G.deck=shuf(G.gameMode==='berserk'?mkBerserkDeck():mkClassicDeck());
  G.disc=[];G.round=0;G.dealer=0;G.mult=1;G.log=[];G.pending=[];
  G.targetPending=null;G.raiseChoice=null;G.raiseCallback=null;G.flip1stop=false;
  newRound();
}

function newRound(){
  G.round++;G.f3r=0;G.f3t=-1;G.f3type=3;G.flip1stop=false;
  G.pending=[];G.targetPending=null;G.raiseChoice=null;G.raiseCallback=null;
  G.players.forEach(p=>{p.hand=[];p.bonus=[];p.rscore=0;p.status='active';p.safe=false});
  log('');log('=== 第'+G.round+'回合 ('+(G.gameMode==='berserk'?'狂暴':'经典')+') ===');
  log('庄家: '+G.players[G.dealer].name);
  G.cur=G.dealer;G.phase='playing';setTurnTimer(7);broadcast();aiCheckTurn();
}

function aiCheckTurn(){
  if(G.phase!=='playing'||G.f3r>0||G.targetPending)return;
  if(!isAI(G.cur))return;
  let p=G.players[G.cur];if(p.status!=='active')return;
  let ci=G.cur,sc=csLive(p),cnt=p.hand.length;
  setTimeout(()=>{
    if(G.phase!=='playing'||G.cur!==ci||G.f3r>0||G.targetPending)return;
    if(G.gameMode==='berserk')doHit();
    else if(cnt>=5&&sc>=15)doStay();
    else if(sc>=(12+(0|Math.random()*14))&&cnt>=2)doStay();
    else doHit();
  },1000+Math.random()*1500);
}

function advance(){
  if(chkEnd())return;
  let n=(G.cur+1)%G.players.length,a=0;
  while(G.players[n].status!=='active'&&a<G.players.length){n=(n+1)%G.players.length;a++}
  if(a>=G.players.length){endRound();return}
  G.cur=n;setTurnTimer(7);broadcast();aiCheckTurn();
}
function chkEnd(){if(!G.players.some(p=>p.status==='active')){endRound();return true}return false}

// ===== RAISE CHOICE SYSTEM =====
function triggerRaise(pi,reason,cb){
  G.raiseChoice={playerIdx:pi,reason,x2:true,x4:true};
  G.raiseCallback=cb;G.phase='raiseChoice';
  clearTimer();setTurnTimer(10);broadcast();
  if(isAI(pi)){
    setTimeout(()=>{
      if(G.phase!=='raiseChoice')return;
      if(Math.random()<.5)applyOpt('x2');
      if(G.phase==='raiseChoice'&&Math.random()<.3)applyOpt('x4');
      if(G.phase==='raiseChoice')doSkipRaise();
    },1500+Math.random()*1000);
  }
}
function applyOpt(opt){
  if(!G.raiseChoice)return;
  if(opt==='x2'&&G.raiseChoice.x2){G.mult*=2;G.raiseChoice.x2=false;log('加注 ×2 → x'+G.mult,'ac');broadcast()}
  else if(opt==='x4'&&G.raiseChoice.x4){G.mult*=4;G.raiseChoice.x4=false;log('加注 ×4 → x'+G.mult,'ac');broadcast()}
  if(G.raiseChoice&&!G.raiseChoice.x2&&!G.raiseChoice.x4)doSkipRaise();
}
function doSkipRaise(){
  if(!G.raiseChoice)return;
  clearTimer();let cb=G.raiseCallback;
  G.raiseChoice=null;G.raiseCallback=null;G.phase='playing';broadcast();
  if(cb==='autoF3')setTimeout(autoF3,100);else setTimeout(()=>{if(!chkEnd())advance()},100);
}

// ===== CARD PROCESSING =====
function doHit(){
  if(actionLock)return;actionLock=true;clearTimer();
  let c=draw();if(!c){log('牌堆空！');endRound();return}
  let p=G.players[G.cur];log(p.name+' 翻牌: '+cname(c));
  processCard(c,G.cur,'advance');
}
function doStay(){
  if(actionLock)return;actionLock=true;clearTimer();
  let p=G.players[G.cur];p.status='stayed';log(p.name+' 停牌','ok');broadcast();advance();
}

function processCard(c,pi,cb){
  let p=G.players[pi];
  if(c.t==='n'){
    // Berserk special cards
    if(c.sp==='b7'){
      [...p.hand,...p.bonus].forEach(x=>G.disc.push(x));p.hand=[c];p.bonus=[];
      log(p.name+' 霉运7！所有牌作废','ex');broadcast();cont(cb);return;
    }
    if(c.sp==='c0'){
      p.hand.push(c);log(p.name+' 彩色0！积分归零','ac');broadcast();cont(cb);return;
    }
    // Dup check: c13 only dups with c13; regular dups with same-value regular
    let dup=c.sp==='c13'
      ?p.hand.find(x=>x.t==='n'&&x.sp==='c13')
      :p.hand.find(x=>x.t==='n'&&x.v===c.v&&!x.sp);
    if(dup){
      dup.xx=true;p.hand.push({...c,xx:true});log(p.name+' 重复['+cname(c)+']！','ex');
      if(p.safe){
        broadcast();setTimeout(()=>{
          p.hand=p.hand.filter(x=>!x.xx);p.safe=false;log('✔ 安全牌生效！','ok');
          triggerRaise(pi,'safety_saved',cb);
        },1000);
      }else{
        broadcast();setTimeout(()=>{
          p.status='busted';log(p.name+' 💥 爆炸！','ex');p.hand=[];p.bonus=[];
          if(cb==='autoF3')G.f3r=0;
          broadcast();setTimeout(()=>{if(G.pending.length)setTimeout(()=>procPend('advance'),300);else if(!chkEnd())advance()},600);
        },1200);
      }
      return;
    }
    p.hand.push(c);
    if(uniqNums(p).length>=7){
      log(p.name+' 七连翻！+15分','ok');G.mult*=2;log('七连翻 ×2 → x'+G.mult,'ac');
      broadcast();setTimeout(()=>endRound(pi),600);return;
    }
    broadcast();cont(cb);
  }else if(c.t==='b'||c.t==='sc'){
    p.bonus.push(c);
    if(c.v==='x2'){broadcast();triggerRaise(pi,'x2card',cb);return}
    broadcast();cont(cb);
  }else if(c.t==='a'||c.t==='fn'){
    if(cb==='autoF3'){
      // Defer action/fn cards during forced flip sequence
      G.pending.push({c,pi});log('['+cname(c)+'] 暂存','ac');broadcast();setTimeout(autoF3,800);
    }else{
      handleFnCard(c,pi,cb);
    }
  }
}
function cont(cb){if(cb==='autoF3')setTimeout(autoF3,800);else advance()}

function handleFnCard(c,from,cb){
  let act=G.players.map((p,i)=>({name:p.name,idx:i})).filter(x=>G.players[x.idx].status==='active');
  if(c.v==='safety')act=act.filter(x=>!G.players[x.idx].safe);
  if(!act.length){log('['+cname(c)+'] 无目标，作废','ac');G.disc.push(c);cont(cb);return}
  G.targetPending={card:c,from,targets:act,cb};broadcast();aiCheckTarget();
}
function aiCheckTarget(){
  if(!G.targetPending)return;
  let from=G.targetPending.from;if(!isAI(from))return;
  let{targets,card:c}=G.targetPending;
  setTimeout(()=>{
    if(!G.targetPending||G.targetPending.from!==from)return;
    let o=targets.filter(t=>t.idx!==from);
    let ti=c.v==='safety'?(targets.find(t=>t.idx===from)?from:targets[0].idx):(o.length?o[0|Math.random()*o.length].idx:targets[0].idx);
    selectTarget(ti);
  },1000+Math.random()*1000);
}
// Check if player pi has a duplicate of addedCard after a steal/swap transfer
function checkDupAfterTransfer(pi,addedCard,cb){
  if(!addedCard||addedCard.t!=='n'||addedCard.sp)return false; // special cards don't dup normally
  let p=G.players[pi];
  // Count how many of this value are now in hand
  let dups=p.hand.filter(x=>x.t==='n'&&x.v===addedCard.v&&!x.sp);
  if(dups.length<2)return false;
  // Mark duplicates
  dups.forEach(x=>x.xx=true);
  log(p.name+' 因换牌重复['+addedCard.v+']！','ex');
  if(p.safe){
    broadcast();setTimeout(()=>{
      p.hand=p.hand.filter(x=>!x.xx);p.safe=false;log('✔ 安全牌生效！','ok');
      triggerRaise(pi,'safety_saved',cb);
    },1000);
  }else{
    broadcast();setTimeout(()=>{
      p.status='busted';log(p.name+' 💥 换牌触发爆炸！','ex');p.hand=[];p.bonus=[];
      broadcast();setTimeout(()=>{if(!chkEnd())advance()},600);
    },1200);
  }
  return true;
}

function selectTarget(ti){
  if(!G.targetPending)return;
  let{card:c,from,cb}=G.targetPending;
  if(!G.targetPending.targets.some(t=>t.idx===ti))return;
  G.targetPending=null;
  let who=G.players[from].name,whom=G.players[ti].name;
  if(c.v==='freeze'){
    G.players[ti].status='stayed';log(who+' 冻结 '+whom,'ac');broadcast();setTimeout(()=>afterAct(cb),100);
  }else if(c.v==='flip3'||c.v==='flip4'){
    let n=c.v==='flip4'?4:3;G.f3r=n;G.f3t=ti;G.f3type=n;
    log(who+' 对'+whom+' 使用'+cname(c),'ac');broadcast();setTimeout(autoF3,800);
  }else if(c.v==='safety'){
    G.players[ti].safe=true;log(who+' 给'+whom+' 安全牌','ac');broadcast();setTimeout(()=>afterAct(cb),100);
  }else if(c.v==='flip1stop'){
    G.f3r=1;G.f3t=ti;G.f3type=1;G.flip1stop=true;
    log(who+' 对'+whom+' 摸一张停','ac');broadcast();setTimeout(autoF3,800);
  }else if(c.v==='steal'){
    let cards=G.players[ti].hand.filter(x=>x.t==='n');
    if(cards.length){
      let s=cards[0|Math.random()*cards.length];
      G.players[ti].hand=G.players[ti].hand.filter(x=>x!==s);
      G.players[from].hand.push(s);
      log(who+' 偷['+cname(s)+']自'+whom,'ac');
      broadcast();
      if(checkDupAfterTransfer(from,s,cb))return;
    }else log(who+' 偷牌失败','ac');
    broadcast();setTimeout(()=>afterAct(cb),100);
  }else if(c.v==='swap'){
    let fc=G.players[from].hand.filter(x=>x.t==='n'),tc=G.players[ti].hand.filter(x=>x.t==='n');
    if(fc.length&&tc.length){
      let f=fc[0|Math.random()*fc.length],t2=tc[0|Math.random()*tc.length];
      G.players[from].hand=G.players[from].hand.filter(x=>x!==f);
      G.players[ti].hand=G.players[ti].hand.filter(x=>x!==t2);
      G.players[from].hand.push(t2);
      G.players[ti].hand.push(f);
      log(who+' 用['+cname(f)+']换'+whom+'的['+cname(t2)+']','ac');
      broadcast();
      // Check explosion for both sides after swap
      if(checkDupAfterTransfer(from,t2,cb))return;
      if(checkDupAfterTransfer(ti,f,cb))return;
    }else log(who+' 换牌失败','ac');
    broadcast();setTimeout(()=>afterAct(cb),100);
  }else if(c.v==='discard'){
    let cards=G.players[ti].hand.filter(x=>x.t==='n');
    if(cards.length){let d=cards[0|Math.random()*cards.length];G.players[ti].hand=G.players[ti].hand.filter(x=>x!==d);G.disc.push(d);log(who+' 迫'+whom+'弃['+cname(d)+']','ac')}
    else log(who+' 弃牌失败','ac');
    broadcast();setTimeout(()=>afterAct(cb),100);
  }
}
function afterAct(cb){
  if(G.pending.length)setTimeout(()=>procPend(cb),300);
  else if(cb==='autoF3')setTimeout(autoF3,200);
  else if(!chkEnd())advance();
}
function procPend(cb){
  if(!G.pending.length){if(!chkEnd())advance();return}
  let a=G.pending.shift();handleFnCard(a.c,a.pi,cb||'advance');
}

function autoF3(){
  if(G.f3r<=0){
    // Auto-raise for berserk flip3/flip4 if target survived
    if(G.gameMode==='berserk'&&G.f3type>=3&&G.f3t>=0&&G.players[G.f3t]&&G.players[G.f3t].status!=='busted'){
      let m=G.f3type===4?4:3;G.mult*=m;log('翻'+G.f3type+'张成功！×'+m+' → x'+G.mult,'ac');broadcast();
    }
    if(G.flip1stop&&G.f3t>=0){
      let p=G.players[G.f3t];if(p&&p.status==='active'){p.status='stayed';log(p.name+' 摸一张停冻结','ac')}
      G.flip1stop=false;broadcast();
    }
    G.f3t=-1;
    if(G.pending.length)setTimeout(()=>procPend('advance'),300);else if(!chkEnd())advance();
    return;
  }
  let c=draw();if(!c){G.f3r=0;log('牌堆空');broadcast();if(!chkEnd())advance();return}
  let p=G.players[G.f3t];
  let tag=G.f3type===1?'摸一张停':G.f3type===4?'翻四张':'翻三张';
  log('['+tag+'] '+p.name+' 翻出: '+cname(c));G.f3r--;
  processCard(c,G.f3t,'autoF3');
}

function endRound(f7){
  clearTimer();if(f7===undefined)f7=-1;G.phase='roundEnd';
  G.players.forEach((p,i)=>{
    if(p.status!=='busted'){p.rscore=calcScore(p,i===f7);p.total+=p.rscore}else p.rscore=0;
    p.hand.forEach(c=>G.disc.push(c));p.bonus.forEach(c=>G.disc.push(c));
  });
  if(G.players.some(p=>p.total>=WIN)){showEnd();return}
  let best=-1,bi=G.dealer;G.players.forEach((p,i)=>{if(p.rscore>best){best=p.rscore;bi=i}});
  G.dealer=bi;G.f7winner=f7;broadcast();setTimeout(()=>{if(G.phase==='roundEnd')newRound()},3000);
}

function showEnd(){
  let sorted=[...G.players].sort((a,b)=>b.total-a.total);
  let n=G.players.length,pool=n*ANTE*G.mult,sysA=Math.round(n*ANTE*.03);
  let rats=PR[n]||PR[6];
  sorted.forEach((p,i)=>{
    if(i===0)return;
    let coeff=rats[i-1]||rats[rats.length-1],owe=Math.round(ANTE*G.mult*coeff);
    if(p.beans<owe){p._bk=true;p._bc=-p.beans;p.beans=0}
    else{p._bk=false;p._bc=-owe;p.beans-=owe}
  });
  sorted[0]._bc=pool-sysA;sorted[0].beans+=pool-sysA;sorted[0]._bk=false;
  G.phase='gameEnd';G.finalRanking=sorted;broadcast();
}

function restartGame(){
  seats=seats.filter(s=>!s.ai);
  let ai=0;while(seats.length<roomSize){while(seats.some(s=>s.name===AI[ai]))ai++;seats.push({name:AI[ai],ai:true,id:'ai_'+ai});ai++}
  G.players=seats.map(mkPlayer);
  G.deck=shuf(G.gameMode==='berserk'?mkBerserkDeck():mkClassicDeck());
  G.disc=[];G.round=0;G.dealer=0;G.mult=1;G.log=[];G.pending=[];
  G.targetPending=null;G.raiseChoice=null;G.raiseCallback=null;G.flip1stop=false;
  newRound();
}
function backToLobby(){seats=seats.filter(s=>!s.ai);G.phase='lobby';G.log=[];G.targetPending=null;G.raiseChoice=null;broadcast()}

// ===== WEBSOCKET =====
wss.on('connection',ws=>{
  clients.add(ws);ws.seat=-1;
  ws.send(JSON.stringify({type:'state',G,seats,roomSize,hostSeat}));
  ws.on('message',raw=>{
    let msg;try{msg=JSON.parse(raw)}catch(e){return}
    const t=msg.type;
    if(t==='rejoin'){
      let i=seats.findIndex(x=>x.name===msg.name&&!x.ai);
      if(i>=0){ws.seat=i;seats[i].dc=false;ws.send(JSON.stringify({type:'seated',seat:i}));ws.send(JSON.stringify({type:'state',G,seats,roomSize,hostSeat}));broadcast()}
      return;
    }
    if(t==='join'){
      if(G.phase!=='lobby'){ws.send(JSON.stringify({type:'info',text:'游戏进行中'}));return}
      if(seats.length>=12){ws.send(JSON.stringify({type:'info',text:'房间已满'}));return}
      if(seats.some(x=>x.name===msg.name)){ws.send(JSON.stringify({type:'info',text:'名称已存在'}));return}
      seats.push({name:msg.name,ai:false,id:Date.now()+''+Math.random()});ws.seat=seats.length-1;
      ws.send(JSON.stringify({type:'seated',seat:ws.seat}));broadcast();
    }else if(t==='setRoomSize'){
      if(ws.seat!==hostSeat)return;let sz=parseInt(msg.size);if(sz>=2&&sz<=12){roomSize=sz;G.roomSize=sz}broadcast();
    }else if(t==='setMode'){
      if(ws.seat!==hostSeat||G.phase!=='lobby')return;
      if(msg.mode==='classic'||msg.mode==='berserk'){G.gameMode=msg.mode;broadcast()}
    }else if(t==='start'){
      if(ws.seat!==hostSeat||G.phase!=='lobby'||!seats.length)return;startGame();
    }else if(t==='hit'){
      if(G.phase!=='playing'||G.f3r>0||ws.seat!==G.cur||G.targetPending)return;doHit();
    }else if(t==='stay'){
      if(G.phase!=='playing'||G.f3r>0||ws.seat!==G.cur)return;
      if(G.gameMode==='berserk'){ws.send(JSON.stringify({type:'info',text:'狂暴模式不能主动停牌！'}));return}
      doStay();
    }else if(t==='raiseOpt'){
      if(G.phase!=='raiseChoice'||!G.raiseChoice||ws.seat!==G.raiseChoice.playerIdx)return;applyOpt(msg.opt);
    }else if(t==='skipRaise'){
      if(G.phase!=='raiseChoice'||!G.raiseChoice||ws.seat!==G.raiseChoice.playerIdx)return;doSkipRaise();
    }else if(t==='target'){
      if(!G.targetPending||ws.seat!==G.targetPending.from)return;selectTarget(msg.idx);
    }else if(t==='nextRound'){
      if(ws.seat!==hostSeat||G.phase!=='roundEnd')return;newRound();
    }else if(t==='restart'){
      if(ws.seat!==hostSeat)return;restartGame();
    }else if(t==='kick'){
      if(ws.seat!==hostSeat||G.phase!=='lobby')return;
      let ki=msg.seat;if(ki<0||ki>=seats.length||ki===hostSeat||seats[ki].ai)return;
      clients.forEach(c=>{if(c.seat===ki){c.send(JSON.stringify({type:'kicked'}));c.seat=-1}});
      seats.splice(ki,1);clients.forEach(c=>{if(c.seat>ki)c.seat--});if(hostSeat>ki)hostSeat--;broadcast();
    }else if(t==='backToLobby'){
      if(ws.seat!==hostSeat)return;backToLobby();
    }
  });
  ws.on('close',()=>{
    clients.delete(ws);
    if(ws.seat>=0&&ws.seat<seats.length&&!seats[ws.seat].ai){
      let si=ws.seat;
      if(G.phase==='lobby'){seats.splice(si,1);clients.forEach(c=>{if(c.seat>si)c.seat--});if(hostSeat>=seats.length)hostSeat=0;broadcast()}
      else{seats[si].dc=true;broadcast()}
    }
  });
});

const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log('Flip7 server running on port '+PORT));
