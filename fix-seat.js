const fs = require("fs");
let h = fs.readFileSync("public/index.html","utf8");

// === Fix 1: Reset mySeat if seat is invalid after reconnect ===
// In onState, after setting seats, validate mySeat
let oldOnState = "function onState(msg){G=msg.G;seats=msg.seats||[];roomSize=msg.roomSize||4;hostSeat=msg.hostSeat!=null?msg.hostSeat:0;selRoom=roomSize;";
let newOnState = "function onState(msg){G=msg.G;seats=msg.seats||[];roomSize=msg.roomSize||4;hostSeat=msg.hostSeat!=null?msg.hostSeat:0;if(mySeat>=0&&(mySeat>=seats.length||!seats[mySeat]||seats[mySeat].ai))mySeat=-1;selRoom=roomSize;";
h = h.replace(oldOnState, newOnState);

// === Fix 2: Add rejoin on connect ===
let oldOnOpen = 'ws.onopen=function(){$("connSt").textContent="\\u5df2\\u8fde\\u63a5"}';
let newOnOpen = 'ws.onopen=function(){$("connSt").textContent="\\u5df2\\u8fde\\u63a5";var sn=localStorage.getItem("flip7name");if(sn)send({type:"rejoin",name:sn})}';
h = h.replace(oldOnOpen, newOnOpen);

// === Fix 3: Desktop buttons - replace unicode escapes for 要牌 -> 翻牌 ===
// The desktop button text uses \u8981\u724c which renders as 要牌
h = h.replace(/\\u8981\\u724c/g, "\\u7ffb\\u724c");  // 要牌 -> 翻牌 in escape form
// Also replace any literal 要牌 that might exist
h = h.replace(/要牌/g, "翻牌");

fs.writeFileSync("public/index.html", h, "utf8");
console.log("Fixed: mySeat validation, rejoin on connect, desktop button text");
