const fs = require("fs");
let html = fs.readFileSync("C:/Users/hortor/flip7-game/index.html", "utf8");

// The real issue: inside a JS single-quoted string, we can't have unescaped single quotes
// Fix showPass: replace the inline onclick approach with addEventListener
const oldShowPass = `function showPass(){let p=G.players[G.cur];if(p.status!=='active'){advance();return}
let ov=document.createElement('div');ov.className='ov bg2';ov.id='pov';
ov.innerHTML='<h2>\u8F6E\u5230 '+p.name+'</h2><p>\u8BF7\u5C06\u8BBE\u5907\u4F20\u9012\u7ED9\u8BE5\u73A9\u5BB6</p><button class="btn bp bl" onclick="rmOv(\'pov\');render()">\u6211\u51C6\u5907\u597D\u4E86</button>';
document.body.appendChild(ov)}`;

// Try to find what's actually in the file
const showPassIdx = html.indexOf("function showPass()");
const showPassEnd = html.indexOf("function rmOv", showPassIdx);
const actualShowPass = html.substring(showPassIdx, showPassEnd);
console.log("ACTUAL showPass:");
console.log(actualShowPass);
console.log("---");

// New approach: use addEventListener instead of onclick in innerHTML
const newShowPass = `function showPass(){let p=G.players[G.cur];if(p.status!=='active'){advance();return}
let ov=document.createElement('div');ov.className='ov bg2';ov.id='pov';
ov.innerHTML='<h2>\u8F6E\u5230 '+p.name+'</h2><p>\u8BF7\u5C06\u8BBE\u5907\u4F20\u9012\u7ED9\u8BE5\u73A9\u5BB6</p><button class="btn bp bl" id="passBtn">\u6211\u51C6\u5907\u597D\u4E86</button>';
document.body.appendChild(ov);document.getElementById('passBtn').onclick=function(){rmOv('pov');render()}}`;

html = html.substring(0, showPassIdx) + newShowPass + html.substring(showPassEnd);

fs.writeFileSync("C:/Users/hortor/flip7-game/index.html", html, "utf8");
console.log("\nFixed showPass - now uses addEventListener. File saved.");