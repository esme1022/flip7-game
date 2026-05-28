const fs = require("fs");
let h = fs.readFileSync("public/index.html","utf8");

// Find the raise line that has cdDesktop() duplicated
// The pattern: ？" + cdDesktop() + ""  at end of raise ti assignment
// Replace it by removing the + cdDesktop() + "" part
h = h.replace(/\u662f\u5426\u52a0\u6ce8\uff1f" \+ cdDesktop\(\) \+ ""/,
              '\u662f\u5426\u52a0\u6ce8\uff1f"');

// Also the interval should NOT create new countdown spans (causes duplication)
// It should only update existing ones
let oldInterval = `setInterval(function(){if(G&&G.deadline&&(G.phase==="raise"||G.phase==="playing")){renderFloat();var ti=$("ti");if(ti){var old=ti.querySelector(".countdown");var s=Math.max(0,Math.ceil((G.deadline-Date.now())/1000));if(s>0){if(old)old.textContent=s+"s";else{var sp=document.createElement("span");sp.className="countdown";sp.textContent=s+"s";ti.appendChild(sp)}}else if(old)old.remove()}}},1000);`;
let newInterval = `setInterval(function(){if(G&&G.deadline&&(G.phase==="raise"||G.phase==="playing")){renderFloat();var ti2=$("ti");if(ti2){var old=ti2.querySelector(".countdown");var s=Math.max(0,Math.ceil((G.deadline-Date.now())/1000));if(old){old.textContent=s>0?s+"s":""}}}},1000);`;
h = h.replace(oldInterval, newInterval);

fs.writeFileSync("public/index.html", h, "utf8");

// verify
let check = fs.readFileSync("public/index.html","utf8");
let count = (check.match(/cdDesktop/g)||[]).length;
console.log("cdDesktop occurrences:", count);
let lines = check.split("\n");
for(let i=0;i<lines.length;i++){
  if(lines[i].includes("raise")&&lines[i].includes("cdDesktop")){
    console.log("STILL HAS cdDesktop in raise line:", i+1);
  }
}
if(!check.includes("appendChild")){
  console.log("OK: no more appendChild in interval");
}
console.log("Done");
