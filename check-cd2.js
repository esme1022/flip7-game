const fs = require("fs");
let h = fs.readFileSync("public/index.html","utf8");
// Find cdDesktop near raise
let idx = h.indexOf('cdDesktop()');
while(idx>=0){
  let start = Math.max(0, idx-40);
  let end = Math.min(h.length, idx+40);
  console.log("Found at", idx, "context:", JSON.stringify(h.substring(start, end)));
  idx = h.indexOf('cdDesktop()', idx+1);
}
