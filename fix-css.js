const fs = require("fs");
let h = fs.readFileSync("public/index.html","utf8");

// Add CSS right before </style>
let css = `.action-float{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:80;display:flex;gap:12px;background:rgba(26,26,46,.95);padding:14px 20px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,.5);border:1px solid var(--pri)}.action-float .btn{min-width:80px}
.countdown{display:inline-block;margin-left:8px;padding:2px 8px;border-radius:10px;background:var(--red);color:#fff;font-size:12px;font-weight:700;animation:pulse 1s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
.bottom-row{width:100%;max-width:700px;display:flex;gap:8px;margin-top:8px}.bottom-row .glog{flex:1;min-width:0}
.scoreboard{width:200px;flex-shrink:0;background:var(--bg2);border-radius:var(--r);padding:10px;max-height:160px;overflow-y:auto;font-size:11px}
.scoreboard h4{font-size:11px;color:var(--pri2);margin-bottom:6px}
.sb-row{display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid rgba(255,255,255,.05)}.sb-row:last-child{border:none}
.sb-name{color:var(--txt);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sb-score{color:var(--ylw);font-weight:700}.sb-total{color:var(--dim)}
@media(max-width:600px){.bottom-row{flex-direction:column}.scoreboard{width:100%;max-height:100px}}`;

h = h.replace("</style>", css + "\n</style>");
fs.writeFileSync("public/index.html", h, "utf8");
console.log("CSS injected successfully");
