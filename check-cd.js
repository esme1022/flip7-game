const fs = require("fs");
let h = fs.readFileSync("public/index.html","utf8");
// Find the exact text around cdDesktop in the raise phase
let idx = h.indexOf('是否加注');
if(idx>=0){
  let snippet = h.substring(idx, idx+80);
  console.log("SNIPPET:", JSON.stringify(snippet));
}
