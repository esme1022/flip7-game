const fs = require("fs");
let srv = fs.readFileSync("server.js","utf8");

// Server-side: add a lock to prevent duplicate actions in the same turn
// Add actionLock variable
let oldVars = "let turnTimer=null, turnDeadline=0;";
let newVars = "let turnTimer=null, turnDeadline=0, actionLock=false;";
srv = srv.replace(oldVars, newVars);

// Lock on doHit, doStay, doRaise, skipRaise - reject if locked
let oldDoHit = "function doHit(){clearTurnTimer();";
let newDoHit = "function doHit(){if(actionLock)return;actionLock=true;clearTurnTimer();";
srv = srv.replace(oldDoHit, newDoHit);

let oldDoStay = "function doStay(){clearTurnTimer();";
let newDoStay = "function doStay(){if(actionLock)return;actionLock=true;clearTurnTimer();";
srv = srv.replace(oldDoStay, newDoStay);

let oldDoRaise = "function doRaise(){clearTurnTimer();";
let newDoRaise = "function doRaise(){if(actionLock)return;actionLock=true;clearTurnTimer();";
srv = srv.replace(oldDoRaise, newDoRaise);

let oldSkipRaise = "function skipRaise(){clearTurnTimer();";
let newSkipRaise = "function skipRaise(){if(actionLock)return;actionLock=true;clearTurnTimer();";
srv = srv.replace(oldSkipRaise, newSkipRaise);

// Unlock actionLock in broadcast (after state is sent, next turn is ready)
let oldBroadcast = "function broadcast(){";
let newBroadcast = "function broadcast(){actionLock=false;";
srv = srv.replace(oldBroadcast, newBroadcast);

fs.writeFileSync("server.js", srv, "utf8");
console.log("Server: action lock added");

// Client-side: disable buttons immediately on click
let h = fs.readFileSync("public/index.html","utf8");

// For desktop buttons: after onclick fires, disable all action buttons
let oldHitBind = "var hi=$(\"aHit\");if(hi)hi.onclick=function(){send({type:\"hit\"})}";
let newHitBind = "var hi=$(\"aHit\");if(hi)hi.onclick=function(){this.disabled=true;send({type:\"hit\"})}";
h = h.replace(oldHitBind, newHitBind);

let oldStayBind = "var st=$(\"aStay\");if(st)st.onclick=function(){send({type:\"stay\"})}";
let newStayBind = "var st=$(\"aStay\");if(st)st.onclick=function(){this.disabled=true;send({type:\"stay\"})}";
h = h.replace(oldStayBind, newStayBind);

let oldRaiseBind = "var rh=$(\"aRaise\");if(rh)rh.onclick=function(){send({type:\"raise\"})}";
let newRaiseBind = "var rh=$(\"aRaise\");if(rh)rh.onclick=function(){this.disabled=true;send({type:\"raise\"})}";
h = h.replace(oldRaiseBind, newRaiseBind);

let oldSkipBind = "var sk=$(\"aSkip\");if(sk)sk.onclick=function(){send({type:\"skip\"})}";
let newSkipBind = "var sk=$(\"aSkip\");if(sk)sk.onclick=function(){this.disabled=true;send({type:\"skip\"})}";
h = h.replace(oldSkipBind, newSkipBind);

// For mobile float buttons: disable on touch/click
let oldFHit = "var fh=$(\"fHit\");if(fh)fh.ontouchend=fh.onclick=function(e){e.preventDefault();send({type:\"hit\"})}";
let newFHit = "var fh=$(\"fHit\");if(fh)fh.ontouchend=fh.onclick=function(e){e.preventDefault();this.disabled=true;send({type:\"hit\"})}";
h = h.replace(oldFHit, newFHit);

let oldFStay = "var fst=$(\"fStay\");if(fst)fst.ontouchend=fst.onclick=function(e){e.preventDefault();send({type:\"stay\"})}";
let newFStay = "var fst=$(\"fStay\");if(fst)fst.ontouchend=fst.onclick=function(e){e.preventDefault();this.disabled=true;send({type:\"stay\"})}";
h = h.replace(oldFStay, newFStay);

let oldFRaise = "var fr=$(\"fRaise\");if(fr)fr.ontouchend=fr.onclick=function(e){e.preventDefault();send({type:\"raise\"})}";
let newFRaise = "var fr=$(\"fRaise\");if(fr)fr.ontouchend=fr.onclick=function(e){e.preventDefault();this.disabled=true;send({type:\"raise\"})}";
h = h.replace(oldFRaise, newFRaise);

let oldFSkip = "var fs2=$(\"fSkip\");if(fs2)fs2.ontouchend=fs2.onclick=function(e){e.preventDefault();send({type:\"skip\"})}";
let newFSkip = "var fs2=$(\"fSkip\");if(fs2)fs2.ontouchend=fs2.onclick=function(e){e.preventDefault();this.disabled=true;send({type:\"skip\"})}";
h = h.replace(oldFSkip, newFSkip);

fs.writeFileSync("public/index.html", h, "utf8");
console.log("Client: buttons disable on click");
