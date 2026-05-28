const fs = require("fs");
let h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");

// Add restart and back buttons after glog div
h = h.replace(
  '"></div><div class="glog" id="glog"></div></div>',
  '"></div><div class="glog" id="glog"></div><div style="display:flex;gap:10px;margin-top:8px;opacity:.6"><button class="btn bo" style="font-size:12px;padding:6px 14px" onclick="restartSame()">\u91cd\u5f00\u672c\u5c40</button><button class="btn bo" style="font-size:12px;padding:6px 14px" onclick="backToSetup()">\u8fd4\u56de\u623f\u95f4</button></div></div>'
);

// Add backToSetup function
h = h.replace(
  "function restartSame(){",
  "function backToSetup(){G.locked=false;S('setup')}\nfunction restartSame(){"
);

fs.writeFileSync("C:/Users/hortor/flip7-game/index.html", h, "utf8");
console.log("Debug buttons added!");

// Verify
h = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");
let i = h.indexOf("glog");
i = h.indexOf("glog", i+4);
console.log(h.substring(i-5, i+250));
console.log();
i = h.indexOf("function backToSetup");
console.log(h.substring(i, i+80));