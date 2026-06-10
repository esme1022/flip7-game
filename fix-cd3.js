const fs = require("fs");
let h = fs.readFileSync("public/index.html","utf8");

// Direct string replace - the exact text from the file
let target = '\\u52a0\\u6ce8\uff1f" + cdDesktop() + ""';
let replacement = '\\u52a0\\u6ce8\uff1f"';
if(h.includes(target)){
  h = h.replace(target, replacement);
  console.log("Replaced via target1");
} else {
  // Try the literal form seen in the output
  let t2 = '\u52a0\u6ce8？" + cdDesktop() + ""';
  let r2 = '\u52a0\u6ce8？"';
  if(h.includes(t2)){
    h = h.replace(t2, r2);
    console.log("Replaced via target2");
  } else {
    // Just remove any `+ cdDesktop() + ""` pattern
    let before = h.length;
    h = h.replace(/"\s*\+\s*cdDesktop\(\)\s*\+\s*""/g, '"');
    if(h.length !== before) console.log("Replaced via regex");
    else console.log("NOTHING MATCHED - manual check needed");
  }
}

fs.writeFileSync("public/index.html", h, "utf8");

// Verify
let v = fs.readFileSync("public/index.html","utf8");
let idx = v.indexOf('cdDesktop()');
let firstContext = v.substring(Math.max(0,idx-30), idx+30);
console.log("First cdDesktop context now:", JSON.stringify(firstContext));
