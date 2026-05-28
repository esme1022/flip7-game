const fs = require("fs");

// === Fix server: change 2s to 3s for auto-next round ===
let srv = fs.readFileSync("server.js","utf8");
srv = srv.replace("setTimeout(()=>{if(G.phase==='roundEnd')newRound()},2000)", "setTimeout(()=>{if(G.phase==='roundEnd')newRound()},3000)");
fs.writeFileSync("server.js", srv, "utf8");
console.log("Server: auto-next changed to 3s");

// === Fix client: only show countdown when it's MY turn ===
let h = fs.readFileSync("public/index.html","utf8");

// Desktop: the cdDesktop conditional already checks mySeat===G.cur for playing phase
// But for raise phase it shows to everyone - it should only show to dealer (who is mySeat)
// Line 88: var cdd=cdDesktop();if(cdd&&(G.phase==="raise"||(G.phase==="playing"&&mySeat===G.cur)))ti+=cdd;
// Change to: only show if it's MY action (raise: mySeat===G.dealer, playing: mySeat===G.cur)
let oldCdLogic = 'var cdd=cdDesktop();if(cdd&&(G.phase==="raise"||(G.phase==="playing"&&mySeat===G.cur)))ti+=cdd;';
let newCdLogic = 'var cdd=cdDesktop();if(cdd&&((G.phase==="raise"&&mySeat===G.dealer)||(G.phase==="playing"&&mySeat===G.cur)))ti+=cdd;';
h = h.replace(oldCdLogic, newCdLogic);

// Mobile float: already only shows buttons for your own turn (mySeat===G.dealer / mySeat===G.cur)
// But the interval still updates countdown for everyone - fix it
let oldInterval = 'setInterval(function(){if(G&&G.deadline&&(G.phase==="raise"||G.phase==="playing")){renderFloat();var ti2=$("ti");if(ti2){var old=ti2.querySelector(".countdown");var s=Math.max(0,Math.ceil((G.deadline-Date.now())/1000));if(old){old.textContent=s>0?s+"s":""}}}},1000);';
let newInterval = 'setInterval(function(){if(G&&G.deadline){var myAction=(G.phase==="raise"&&mySeat===G.dealer)||(G.phase==="playing"&&mySeat===G.cur);renderFloat();if(myAction){var ti2=$("ti");if(ti2){var old=ti2.querySelector(".countdown");var s=Math.max(0,Math.ceil((G.deadline-Date.now())/1000));if(old){old.textContent=s>0?s+"s":""}}}}},1000);';
h = h.replace(oldInterval, newInterval);

fs.writeFileSync("public/index.html", h, "utf8");
console.log("Client: countdown only shows on own turn");
