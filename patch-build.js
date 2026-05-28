const fs = require('fs');
let s = fs.readFileSync('server.js','utf8');
// Already good - server.js has all the AI and host logic from gen-server.js
// Just need to regenerate client HTML with proper host controls
// Let's build the client inline
const CSS = fs.readFileSync('gen-client.js','utf8').match(/const css = ([\s\S]*?);/);
console.log('Server size:', s.length);
console.log('Done');
