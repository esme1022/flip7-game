const fs = require("fs");
let h = fs.readFileSync("public/index.html","utf8");
// Change the media query to only hide .aa on <=480px (mobile only)
h = h.replace(
  '@media(max-width:600px){.bottom-row{flex-direction:column}.scoreboard{width:100%;max-height:100px}.aa{display:none!important}}',
  '@media(max-width:600px){.bottom-row{flex-direction:column}.scoreboard{width:100%;max-height:100px}}@media(max-width:480px){.aa{display:none!important}}'
);
fs.writeFileSync("public/index.html", h, "utf8");
console.log("Fixed: .aa only hidden on <=480px");
