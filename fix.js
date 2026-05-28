const fs = require("fs");
let html = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");

// The bug: onclick="rmOv(\"pov\");render()" - the escaped quotes break HTML attribute parsing
// Fix: use single quotes inside onclick for all rmOv calls and similar patterns
html = html.replace(
  /onclick="rmOv\(\\"([^"\\]*)\\"\);render\(\)"/g,
  "onclick=\"rmOv('$1');render()\""
);

// Also fix the showPass function to use proper quoting
html = html.replace(
  /onclick="rmOv\(\\\\\\?"([^"\\]*)\\\\\\?"\);render\(\)"/g,
  "onclick=\"rmOv('$1');render()\""
);

// Broader fix: replace any broken escaped quotes in onclick handlers
html = html.replace(
  'onclick="rmOv(\\"pov\\");render()"',
  "onclick=\"rmOv('pov');render()\""
);
html = html.replace(
  "onclick=\"rmOv(\\\\\\\"pov\\\\\\\");render()\"",
  "onclick=\"rmOv('pov');render()\""
);

// Check what the actual content looks like around showPass
const idx = html.indexOf("showPass");
const chunk = html.substring(idx, idx + 500);
console.log("showPass context:");
console.log(chunk);
console.log("\n---");

// Direct fix: find the button HTML in showPass and fix it
html = html.replace(
  /rmOv\(\\+"pov\\+"\)/g,
  "rmOv('pov')"
);

fs.writeFileSync("C:/Users/hortor/flip7-game/index.html", html, "utf8");
console.log("\nFile fixed and saved.");