const fs = require("fs");
let h = fs.readFileSync("public/index.html","utf8");

// Fix broken line 96: stray quote after aStay"
let broken = `aa='<button class="btn bp" id="aHit">\\u7ffb\\u724c</button><button class="btn bs" id="aStay"'>\\u505c\\u724c</button>'`;
let fixed = `aa='<button class="btn bp" id="aHit">\\u7ffb\\u724c</button><button class="btn bs" id="aStay">\\u505c\\u724c</button>'`;
if(h.includes(broken)){
  h = h.replace(broken, fixed);
  console.log("Fixed broken quote on line 96");
} else {
  // try to find the actual broken pattern
  let idx = h.indexOf('id="aStay"');
  if(idx>=0){
    let ctx = h.substring(idx-5, idx+40);
    console.log("Context around aStay:", JSON.stringify(ctx));
    // Fix: replace aStay"' with aStay"
    h = h.replace(/id="aStay"'>/g, 'id="aStay">');
    console.log("Fixed via regex");
  }
}

// Also fix mobile float: always show 停牌 (remove cs condition)
let oldMobileStay = `btns='<button class="btn bp" id="fHit">\u7ffb\u724c</button>'+(cs?'<button class="btn bs" id="fStay">\u505c\u724c</button>':'')`;
let newMobileStay = `btns='<button class="btn bp" id="fHit">\u7ffb\u724c</button><button class="btn bs" id="fStay">\u505c\u724c</button>'`;
if(h.includes(oldMobileStay)){
  h = h.replace(oldMobileStay, newMobileStay);
  console.log("Fixed mobile float stay button");
}

fs.writeFileSync("public/index.html", h, "utf8");
console.log("Done");
