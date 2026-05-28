const fs = require("fs");
let h = fs.readFileSync("public/index.html","utf8");
let lines = h.split("\n");
console.log("Line 93:", lines[92]);
console.log("Line 94:", lines[93]);
console.log("Line 95:", lines[94]);
console.log("Line 96:", lines[95]);
console.log("Line 97:", lines[96]);
