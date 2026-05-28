const fs = require("fs");
let html = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");

// Replace all \uXXXX sequences with actual unicode characters
html = html.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
  return String.fromCharCode(parseInt(hex, 16));
});

fs.writeFileSync("C:/Users/hortor/flip7-game/index.html", html, "utf8");
console.log("Fixed unicode escapes. Sample:");
const idx = html.indexOf("btn bp bl");
console.log(html.substring(idx, idx+80));