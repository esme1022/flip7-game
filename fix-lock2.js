const fs = require("fs");
let h = fs.readFileSync("public/index.html","utf8");

// Add a global client lock variable
let oldVars = "var ws,mySeat=-1,hostSeat=0,roomSize=4,seats=[],G=null;";
let newVars = "var ws,mySeat=-1,hostSeat=0,roomSize=4,seats=[],G=null,actionSent=false;";
h = h.replace(oldVars, newVars);

// Reset lock when new state arrives
let oldOnState = "function onState(msg){G=msg.G;";
let newOnState = "function onState(msg){actionSent=false;G=msg.G;";
h = h.replace(oldOnState, newOnState);

// Wrap send for action types to set lock
let oldSendFn = "function send(o){";
if(!h.includes("function send(o){")){
  // send might be inline, find it
  let idx = h.indexOf("ws.send(JSON.stringify(o))");
}
// Actually let me check how send is defined
let hasSend = h.includes("function send(");
console.log("has send function:", hasSend);

// Add actionSent guard before button rendering in both desktop and mobile
// Desktop: don't show action buttons if actionSent
let oldDesktopHit = 'else if(G.phase==="playing"&&mySeat===G.cur&&G.players[G.cur].status==="active"){';
let newDesktopHit = 'else if(G.phase==="playing"&&mySeat===G.cur&&G.players[G.cur].status==="active"&&!actionSent){';
h = h.replace(oldDesktopHit, newDesktopHit);

let oldDesktopRaise = 'if(G.phase==="raise"&&mySeat===G.dealer){aa=';
let newDesktopRaise = 'if(G.phase==="raise"&&mySeat===G.dealer&&!actionSent){aa=';
h = h.replace(oldDesktopRaise, newDesktopRaise);

// Mobile float: don't show buttons if actionSent
let oldFloatRaise = 'if(G.phase==="raise"&&mySeat===G.dealer){btns=';
let newFloatRaise = 'if(G.phase==="raise"&&mySeat===G.dealer&&!actionSent){btns=';
h = h.replace(oldFloatRaise, newFloatRaise);

let oldFloatHit = 'else if(G.phase==="playing"&&mySeat===G.cur&&G.players[G.cur].status==="active"&&G.f3r<=0&&!G.targetPending){';
let newFloatHit = 'else if(G.phase==="playing"&&mySeat===G.cur&&G.players[G.cur].status==="active"&&G.f3r<=0&&!G.targetPending&&!actionSent){';
h = h.replace(oldFloatHit, newFloatHit);

// Set actionSent=true in all click handlers (desktop)
h = h.replace(
  'if(hi)hi.onclick=function(){this.disabled=true;send({type:"hit"})}',
  'if(hi)hi.onclick=function(){if(actionSent)return;actionSent=true;this.disabled=true;send({type:"hit"})}'
);
h = h.replace(
  'if(st)st.onclick=function(){this.disabled=true;send({type:"stay"})}',
  'if(st)st.onclick=function(){if(actionSent)return;actionSent=true;this.disabled=true;send({type:"stay"})}'
);
h = h.replace(
  'if(rh)rh.onclick=function(){this.disabled=true;send({type:"raise"})}',
  'if(rh)rh.onclick=function(){if(actionSent)return;actionSent=true;this.disabled=true;send({type:"raise"})}'
);
h = h.replace(
  'if(sk)sk.onclick=function(){this.disabled=true;send({type:"skip"})}',
  'if(sk)sk.onclick=function(){if(actionSent)return;actionSent=true;this.disabled=true;send({type:"skip"})}'
);

// Mobile float handlers
h = h.replace(
  'if(fh)fh.ontouchend=fh.onclick=function(e){e.preventDefault();this.disabled=true;send({type:"hit"})}',
  'if(fh)fh.ontouchend=fh.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;this.disabled=true;send({type:"hit"})}'
);
h = h.replace(
  'if(fst)fst.ontouchend=fst.onclick=function(e){e.preventDefault();this.disabled=true;send({type:"stay"})}',
  'if(fst)fst.ontouchend=fst.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;this.disabled=true;send({type:"stay"})}'
);
h = h.replace(
  'if(fr)fr.ontouchend=fr.onclick=function(e){e.preventDefault();this.disabled=true;send({type:"raise"})}',
  'if(fr)fr.ontouchend=fr.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;this.disabled=true;send({type:"raise"})}'
);
h = h.replace(
  'if(fs2)fs2.ontouchend=fs2.onclick=function(e){e.preventDefault();this.disabled=true;send({type:"skip"})}',
  'if(fs2)fs2.ontouchend=fs2.onclick=function(e){e.preventDefault();if(actionSent)return;actionSent=true;this.disabled=true;send({type:"skip"})}'
);

fs.writeFileSync("public/index.html", h, "utf8");
console.log("Client: actionSent lock applied everywhere");
