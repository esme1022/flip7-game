const fs = require("fs");
let h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");

// FIX 1: doHit - safety triggers should show conflicting card, then advance
// Old: safety triggers, stays on same player (render();return)
// New: show duplicate info, then advance after delay
h = h.replace(
  "if(p.safe){p.safe=false;log(p.name+' \u5b89\u5168\u724c\u751f\u6548\uff01\u907f\u514d\u7206\u70b8','ok');render();return}",
  "if(p.safe){p.safe=false;log(p.name+' \u7ffb\u51fa\u91cd\u590d['+c.v+']\uff01\u5b89\u5168\u724c\u751f\u6548\uff0c\u907f\u514d\u7206\u70b8','ok');render();setTimeout(()=>advance(),800);return}"
);

// FIX 2: autoF3 - safety triggers should also show the conflicting card number
h = h.replace(
  "if(p.safe){p.safe=false;log(p.name+' \u5b89\u5168\u724c\u751f\u6548\uff01','ok');render();setTimeout(autoF3,800)}",
  "if(p.safe){p.safe=false;log(p.name+' \u7ffb\u51fa\u91cd\u590d['+c.v+']\uff01\u5b89\u5168\u724c\u751f\u6548\uff0c\u907f\u514d\u7206\u70b8','ok');render();setTimeout(autoF3,800)}"
);

fs.writeFileSync("C:/Users/hortor/flip7-game/index.html", h, "utf8");
console.log("Safety card fixes applied:");
console.log("1. After safety triggers in normal flip -> advance to next player");
console.log("2. Shows conflicting card number before safety effect");

// Verify
h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");
let i = h.indexOf("if(p.safe){p.safe");
console.log("\n=== doHit safety ===");
console.log(h.substring(i, i+150));
i = h.indexOf("if(p.safe){p.safe", i+50);
console.log("\n=== autoF3 safety ===");
console.log(h.substring(i, i+150));