const fs = require("fs");
let h = fs.readFileSync("public/index.html","utf8");

// === Fix 1: Remove duplicate countdown in raise phase ===
// Line 86 already adds cdDesktop(), then line 88 adds it again
// Remove the first one from the raise line
let oldRaiseTi = 'ti="\\ud83c\\udccf <span class=\\"highlight\\">"+esc(G.players[G.dealer].name)+"</span> \\u662f\\u5e84\\u5bb6\\uff0c\\u662f\\u5426\\u52a0\\u6ce8\\uff1f" + cdDesktop() + ""';
let newRaiseTi = 'ti="\\ud83c\\udccf <span class=\\"highlight\\">"+esc(G.players[G.dealer].name)+"</span> \\u662f\\u5e84\\u5bb6\\uff0c\\u662f\\u5426\\u52a0\\u6ce8\\uff1f"';
h = h.replace(oldRaiseTi, newRaiseTi);

// === Fix 2: Stop full renderGame every second, only update countdown text ===
let oldInterval = `setInterval(function(){if(G&&G.deadline&&(G.phase==="raise"||G.phase==="playing")){renderFloat();var ti2=$('ti');if(ti2){renderGame()}}},1000);`;
let newInterval = `setInterval(function(){if(G&&G.deadline&&(G.phase==="raise"||G.phase==="playing")){renderFloat();var ti=$("ti");if(ti){var old=ti.querySelector(".countdown");var s=Math.max(0,Math.ceil((G.deadline-Date.now())/1000));if(s>0){if(old)old.textContent=s+"s";else{var sp=document.createElement("span");sp.className="countdown";sp.textContent=s+"s";ti.appendChild(sp)}}else if(old)old.remove()}}},1000);`;
h = h.replace(oldInterval, newInterval);

fs.writeFileSync("public/index.html", h, "utf8");
console.log("Fixed: duplicate countdown + flickering");
