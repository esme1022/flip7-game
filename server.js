const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
app.use(express.static(path.join(__dirname, 'public')));

const WIN=200, BEANS=5000, ANTE=100, MAXR=3;
const PR={2:[1],3:[.6,.4],4:[.5,.3,.2],5:[.4,.3,.2,.1],6:[.4,.3,.2,.07,.03],
  7:[.35,.25,.18,.12,.07,.03],8:[.30,.22,.17,.13,.09,.06,.03],
  9:[.28,.20,.16,.13,.10,.07,.04,.02],10:[.26,.19,.15,.12,.10,.08,.05,.03,.02],
  11:[.24,.18,.14,.12,.10,.08,.06,.04,.025,.015],12:[.22,.17,.14,.11,.10,.08,.07,.05,.03,.02,.01]};

let G=null, seats=[], clients=new Set(), roomSize=4, hostSeat=0;
let turnTimer=null, turnDeadline=0, actionLock=false;
const AI_NAMES=['电脑A','电脑B','电脑C','电脑D','电脑E','电脑F','电脑G','电脑H','电脑I','电脑J','电脑K','电脑L'];

function initState(){
  G={players:[],deck:[],disc:[],round:0,cur:0,dealer:0,roundRaised:false,totalR:0,mult:1,phase:'lobby',log:[],pending:[],f3r:0,f3t:-1,targetPending:null,roomSize:roomSize,hostSeat:0};
  seats=[];
}
initState();

function mkDeck(){let d=[];for(let v=0;v<=12;v++){let n=Math.max(1,v);for(let i=0;i<n;i++)d.push({t:'n',v})}
d.push({t:'b',v:'+2'},{t:'b',v:'+4'},{t:'b',v:'+6'},{t:'b',v:'+8'},{t:'b',v:'+10'},{t:'b',v:'x2'});
for(let i=0;i<3;i++){d.push({t:'a',v:'freeze'});d.push({t:'a',v:'flip3'});d.push({t:'a',v:'safety'})}return d}
function shuf(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function draw(){if(!G.deck.length){if(G.disc.length){G.deck=shuf([...G.disc]);G.disc=[];log('牌堆耗尽，弃牌堆重新洗入（'+G.deck.length+'张）')}else return null}return G.deck.pop()}
function cname(c){if(c.t==='n')return String(c.v);if(c.t==='b')return c.v;return{freeze:'冻结',flip3:'翻三张',safety:'安全牌'}[c.v]}
function cdisp(c){return'['+cname(c)+']'}
function log(t,cls){G.log.push({t,cls:cls||''})}
function uniq(p){let s=new Set();p.hand.forEach(c=>{if(c.t==='n')s.add(c.v)});return[...s]}
function calcScore(p,f7){let ns=0;p.hand.forEach(c=>{if(c.t==='n')ns+=c.v});let mul=1,ba=0;p.bonus.forEach(b=>{if(b.v==='x2')mul*=2;else ba+=parseInt(b.v)});return ns*mul+ba+(f7?15:0)}
function csLive(p){if(p.status==='busted')return 0;let ns=0;p.hand.forEach(c=>{if(c.t==='n')ns+=c.v});let mul=1,ba=0;p.bonus.forEach(b=>{if(b.v==='x2')mul*=2;else ba+=parseInt(b.v)});return ns*mul+ba}

function broadcast(){actionLock=false;
  const state=JSON.stringify({type:'state',G,seats,roomSize,hostSeat});
  clients.forEach(ws=>{if(ws.readyState===1)ws.send(state)});
}

function isAI(idx){return seats[idx]&&(seats[idx].ai||seats[idx].dc)}


function setTurnTimer(sec){
  if(turnTimer)clearTimeout(turnTimer);
  turnDeadline=Date.now()+sec*1000;
  G.deadline=turnDeadline;
  turnTimer=setTimeout(()=>{
    turnTimer=null;
    if(G.phase==='raise'){skipRaise()}
    else if(G.phase==='playing'&&G.f3r<=0&&!G.targetPending){
      let p=G.players[G.cur];
      if(p&&p.status==='active'){if(p.hand.length>0){doStay()}else{doHit()}}
    }
  },sec*1000);
}
function clearTurnTimer(){if(turnTimer){clearTimeout(turnTimer);turnTimer=null;G.deadline=0}}

function startGame(){
  let aiNeeded=roomSize-seats.length;
  let aiIdx=0;
  for(let i=0;i<aiNeeded;i++){
    while(seats.some(s=>s.name===AI_NAMES[aiIdx]))aiIdx++;
    seats.push({name:AI_NAMES[aiIdx],ai:true,id:'ai_'+aiIdx});aiIdx++;
  }
  G.players=seats.map(s=>({name:s.name,hand:[],bonus:[],total:0,rscore:0,beans:BEANS-ANTE,status:'active',safe:false,ai:!!s.ai}));
  G.deck=shuf(mkDeck());G.disc=[];G.round=0;G.dealer=0;G.totalR=0;G.mult=1;G.log=[];G.pending=[];G.targetPending=null;
  newRound();
}

function newRound(){
  G.round++;G.roundRaised=false;G.f3r=0;G.f3t=-1;G.pending=[];G.targetPending=null;
  G.players.forEach(p=>{p.hand=[];p.bonus=[];p.rscore=0;p.status='active';p.safe=false});
  log('');log('=== 第'+G.round+'回合开始 ===');log('庄家: '+G.players[G.dealer].name);
  G.phase='raise';
  if(G.totalR>=MAXR){startTurns();return}
  setTurnTimer(5);broadcast();aiCheckRaise();
}

function aiCheckRaise(){
  if(G.phase!=='raise')return;
  if(!isAI(G.dealer))return;
  setTimeout(()=>{
    if(G.phase!=='raise')return;
    if(Math.random()<0.35&&G.totalR<MAXR){doRaise()}else{skipRaise()}
  },1200+Math.random()*800);
}

function startTurns(){G.cur=G.dealer;G.phase='playing';setTurnTimer(7);broadcast();aiCheckTurn()}

function aiCheckTurn(){
  if(G.phase!=='playing'||G.f3r>0||G.targetPending)return;
  if(!isAI(G.cur))return;
  let p=G.players[G.cur];
  if(p.status!=='active')return;
  let score=csLive(p);
  let threshold=12+Math.floor(Math.random()*14);
  let cardCount=p.hand.length;
  let curIdx=G.cur;
  setTimeout(()=>{
    if(G.phase!=='playing'||G.cur!==curIdx)return;
    if(cardCount>=5&&score>=15){doStay()}
    else if(score>=threshold&&cardCount>=2){doStay()}
    else{doHit()}
  },1000+Math.random()*1500);
}

function advance(){
  if(chkEnd())return;
  let next=(G.cur+1)%G.players.length,att=0;
  while(G.players[next].status!=='active'&&att<G.players.length){next=(next+1)%G.players.length;att++}
  if(att>=G.players.length){endRound();return}
  G.cur=next;setTurnTimer(7);broadcast();aiCheckTurn();
}

function chkEnd(){if(!G.players.some(p=>p.status==='active')){endRound();return true}return false}

function doRaise(){if(actionLock)return;actionLock=true;clearTurnTimer();G.roundRaised=true;G.totalR++;G.mult*=2;log('庄家加注！底注倍率→x'+G.mult,'ac');startTurns()}
function skipRaise(){if(actionLock)return;actionLock=true;clearTurnTimer();startTurns()}

function doHit(){if(actionLock)return;actionLock=true;clearTurnTimer();
  let c=draw();if(!c){log('牌堆空！');endRound();return}
  let p=G.players[G.cur];log(p.name+' 翻牌: '+cdisp(c));
  if(c.t==='n'){
    if(p.hand.some(x=>x.t==='n'&&x.v===c.v)){
      if(p.safe){
        p.hand.push({t:'n',v:c.v,xx:true});log(p.name+' 翻出重复['+c.v+']！','ex');
        broadcast();setTimeout(()=>{p.hand.pop();p.safe=false;log('✔ 安全牌生效，避免爆炸！','ok');broadcast();setTimeout(()=>advance(),600)},1000);return;
      }
      p.hand.forEach(x=>{if(x.t==='n'&&x.v===c.v)x.xx=true});
      p.hand.push({t:'n',v:c.v,xx:true});log(p.name+' 翻出重复['+c.v+']！','ex');
      broadcast();setTimeout(()=>{p.status='busted';log(p.name+' 💥 爆炸！','ex');p.hand=[];p.bonus=[];broadcast();setTimeout(()=>advance(),600)},1200);return;
    }
    p.hand.push(c);
    if(uniq(p).length>=7){log(p.name+' 七连翻！+15分！','ok');broadcast();setTimeout(()=>endRound(G.cur),600);return}
  }else if(c.t==='b'){p.bonus.push(c)}
  else{handleAction(c,G.cur);return}
  broadcast();advance();
}

function doStay(){if(actionLock)return;actionLock=true;clearTurnTimer();let p=G.players[G.cur];p.status='stayed';log(p.name+' 停牌','ok');broadcast();advance()}

function autoF3(){
  if(G.f3r<=0){if(G.pending.length){setTimeout(procPend,300)}else{advance()}return}
  let c=draw();if(!c){G.f3r=0;log('牌堆空');broadcast();advance();return}
  let p=G.players[G.f3t];
  log('[翻三张] '+p.name+' 翻出: '+cdisp(c));G.f3r--;
  if(c.t==='n'){
    if(p.hand.some(x=>x.t==='n'&&x.v===c.v)){
      if(p.safe){
        p.hand.push({t:'n',v:c.v,xx:true});log(p.name+' 翻出重复['+c.v+']！','ex');
        broadcast();setTimeout(()=>{p.hand.pop();p.safe=false;log('✔ 安全牌生效，避免爆炸！','ok');broadcast();setTimeout(autoF3,800)},1000);return;
      }else{
        p.hand.forEach(x=>{if(x.t==='n'&&x.v===c.v)x.xx=true});
        p.hand.push({t:'n',v:c.v,xx:true});log(p.name+' 翻出重复['+c.v+']！','ex');G.f3r=0;
        broadcast();setTimeout(()=>{p.status='busted';log(p.name+' 💥 翻三张中爆炸！','ex');p.hand=[];p.bonus=[];broadcast();setTimeout(()=>advance(),600)},1200);return;
      }
    }else{
      p.hand.push(c);
      if(uniq(p).length>=7){G.f3r=0;log(p.name+' 翻三张达成七连翻！','ok');broadcast();setTimeout(()=>endRound(G.f3t),600);return}
    }
  }else if(c.t==='b'){p.bonus.push(c)}
  else{G.pending.push({c,pi:G.f3t});log('【'+cname(c)+'】暂存','ac')}
  broadcast();setTimeout(autoF3,800);
}

function handleAction(c,from){
  let act=G.players.map((p,i)=>({name:p.name,idx:i})).filter(x=>G.players[x.idx].status==='active');
  if(!act.length){afterAct();return}
  G.targetPending={card:c,from,targets:act};
  broadcast();aiCheckTarget();
}

function aiCheckTarget(){
  if(!G.targetPending)return;
  let from=G.targetPending.from;
  if(!isAI(from))return;
  let targets=G.targetPending.targets;
  setTimeout(()=>{
    if(!G.targetPending||G.targetPending.from!==from)return;
    let card=G.targetPending.card;let ti;
    if(card.v==='safety'){ti=from}
    else{let others=targets.filter(t=>t.idx!==from);ti=others.length?others[Math.floor(Math.random()*others.length)].idx:targets[0].idx}
    selectTarget(ti);
  },1000+Math.random()*1000);
}

function selectTarget(ti){
  if(!G.targetPending)return;
  let{card:c,from}=G.targetPending;let who=G.players[from].name;
  G.targetPending=null;
  if(c.v==='freeze'){G.players[ti].status='stayed';log(who+' 对 '+G.players[ti].name+' 使用冻结','ac');broadcast();setTimeout(afterAct,100)}
  else if(c.v==='flip3'){log(who+' 对 '+G.players[ti].name+' 使用翻三张','ac');G.f3r=3;G.f3t=ti;broadcast();setTimeout(autoF3,800)}
  else if(c.v==='safety'){G.players[ti].safe=true;log(who+' 对 '+G.players[ti].name+' 使用安全牌','ac');broadcast();setTimeout(afterAct,100)}
}

function afterAct(){if(G.pending.length){setTimeout(procPend,300)}else if(G.phase==='playing'){if(!chkEnd())advance()}else{startTurns()}}
function procPend(){if(!G.pending.length){if(!chkEnd())advance();return}let a=G.pending.shift();handleAction(a.c,a.pi)}

function endRound(f7){clearTurnTimer();
  if(f7===undefined)f7=-1;G.phase='roundEnd';
  G.players.forEach((p,i)=>{if(p.status!=='busted'){p.rscore=calcScore(p,i===f7);p.total+=p.rscore}else{p.rscore=0}
  p.hand.forEach(c=>G.disc.push(c));p.bonus.forEach(c=>G.disc.push(c))});
  if(G.players.some(p=>p.total>=WIN)){showEnd();return}
  let best=-1,bi=G.dealer;G.players.forEach((p,i)=>{if(p.rscore>best){best=p.rscore;bi=i}});G.dealer=bi;
  G.f7winner=f7;broadcast();setTimeout(()=>{if(G.phase==='roundEnd')newRound()},3000);
}

function showEnd(){
  let sorted=[...G.players].sort((a,b)=>b.total-a.total);
  let pool=G.players.length*ANTE*G.mult;
  let n=G.players.length;let rats=PR[n]||PR[6];
  let totalPaid=0;
  sorted.forEach((p,i)=>{if(i===0)return;let r=rats[i-1]||rats[rats.length-1];let owe=Math.round(pool*r);
    if(p.beans<owe){p._bk=true;p._bc=-p.beans;totalPaid+=p.beans;p.beans=0}
    else{p._bk=false;p._bc=-owe;totalPaid+=owe;p.beans-=owe}});
  sorted[0]._bc=totalPaid;sorted[0].beans+=totalPaid;sorted[0]._bk=false;
  G.phase='gameEnd';G.finalRanking=sorted;broadcast();
}

function restartGame(){
  seats=seats.filter(s=>!s.ai);
  let aiNeeded=roomSize-seats.length;let aiIdx=0;
  for(let i=0;i<aiNeeded;i++){while(seats.some(s=>s.name===AI_NAMES[aiIdx]))aiIdx++;seats.push({name:AI_NAMES[aiIdx],ai:true,id:'ai_'+aiIdx});aiIdx++}
  G.players=seats.map(s=>({name:s.name,hand:[],bonus:[],total:0,rscore:0,beans:BEANS-ANTE,status:'active',safe:false,ai:!!s.ai}));
  G.deck=shuf(mkDeck());G.disc=[];G.round=0;G.dealer=0;G.totalR=0;G.mult=1;G.log=[];G.pending=[];G.targetPending=null;
  newRound();
}

function backToLobby(){seats=seats.filter(s=>!s.ai);G.phase='lobby';G.log=[];G.targetPending=null;broadcast()}

wss.on('connection',(ws)=>{
  clients.add(ws);ws.seat=-1;
  ws.send(JSON.stringify({type:'state',G,seats,roomSize,hostSeat}));
  ws.on('message',(raw)=>{
    let msg;try{msg=JSON.parse(raw)}catch(e){return}
    if(msg.type==='rejoin'){
      let idx=seats.findIndex(s=>s.name===msg.name&&!s.ai);
      if(idx>=0){ws.seat=idx;seats[idx].dc=false;ws.send(JSON.stringify({type:'seated',seat:idx}));ws.send(JSON.stringify({type:'state',G,seats,roomSize,hostSeat}));broadcast()}
      return;
    }if(msg.type==='join'){
      if(G.phase!=='lobby'){ws.send(JSON.stringify({type:'info',text:'游戏进行中，请等待本局结束'}));return}
      if(seats.length>=12){ws.send(JSON.stringify({type:'info',text:'房间已满'}));return}
      if(seats.some(s=>s.name===msg.name)){ws.send(JSON.stringify({type:'info',text:'名称已存在'}));return}
      seats.push({name:msg.name,ai:false,id:Date.now()+''+Math.random()});
      ws.seat=seats.length-1;
      ws.send(JSON.stringify({type:'seated',seat:ws.seat}));
      broadcast();
    }else if(msg.type==='setRoomSize'){
      if(ws.seat!==hostSeat)return;
      let s=parseInt(msg.size);if(s>=2&&s<=12){roomSize=s;G.roomSize=roomSize}broadcast();
    }else if(msg.type==='start'){
      if(ws.seat!==hostSeat||G.phase!=='lobby'||seats.length<1)return;startGame();
    }else if(msg.type==='hit'){
      if(G.phase!=='playing'||G.f3r>0||ws.seat!==G.cur)return;doHit();
    }else if(msg.type==='stay'){
      if(G.phase!=='playing'||G.f3r>0||ws.seat!==G.cur)return;doStay();
    }else if(msg.type==='raise'){
      if(G.phase!=='raise'||ws.seat!==G.dealer)return;doRaise();
    }else if(msg.type==='skip'){
      if(G.phase!=='raise'||ws.seat!==G.dealer)return;skipRaise();
    }else if(msg.type==='target'){
      if(!G.targetPending||ws.seat!==G.targetPending.from)return;selectTarget(msg.idx);
    }else if(msg.type==='nextRound'){
      if(ws.seat!==hostSeat||G.phase!=='roundEnd')return;newRound();
    }else if(msg.type==='restart'){
      if(ws.seat!==hostSeat)return;restartGame();
    }else if(msg.type==='kick'){
      if(ws.seat!==hostSeat||G.phase!=='lobby')return;
      let ki=msg.seat;
      if(ki<0||ki>=seats.length||ki===hostSeat||seats[ki].ai)return;
      // Notify kicked player
      clients.forEach(c=>{if(c.seat===ki){c.send(JSON.stringify({type:'kicked'}));c.seat=-1}});
      seats.splice(ki,1);
      clients.forEach(c=>{if(c.seat>ki)c.seat--});
      if(hostSeat>ki)hostSeat--;
      broadcast();
    }else if(msg.type==='backToLobby'){
      if(ws.seat!==hostSeat)return;backToLobby();
    }
  });
  ws.on('close',()=>{
    clients.delete(ws);
    if(ws.seat>=0&&ws.seat<seats.length&&!seats[ws.seat].ai){
      let si=ws.seat;
      if(G.phase==='lobby'){
        seats.splice(si,1);
        clients.forEach(c=>{if(c.seat>si)c.seat--});
        if(hostSeat>=seats.length)hostSeat=0;
        broadcast();
      } else {
        seats[si].dc=true;
        broadcast();
      }
    }
  });
});

const PORT=process.env.PORT||3000;
server.listen(PORT,()=>{console.log('Flip7 server running on port '+PORT)});