const fs = require("fs");
const p = "C:\\Users\\hortor\\.cursor\\projects\\C-Users-hortor-AppData-Local-Temp-780eef6a-b1f5-4201-8ef4-71ad9775279d\\canvases\\game-data-comparison.canvas.tsx";
let c = fs.readFileSync(p, "utf8");
// The issue: Chinese left/right quotes inside JS double-quoted strings look like closing quotes to the parser
// Replace the problematic line with backtick template literal or escaped quotes
c = c.replace(
  '"长期Top 50以内（国金证券\u201c长青手游\u201d标准）"',
  '"\u957F\u671FTop 50\u4EE5\u5185\uFF08\u56FD\u91D1\u8BC1\u5238\u300E\u957F\u9752\u624B\u6E38\u300F\u6807\u51C6\uFF09"'
);
// Also check for the "长青手游" definition line
c = c.replace(
  '"符合\u201c长青手游\u201d（畅销榜年均Top50内）"',
  '"\u7B26\u5408\u300E\u957F\u9752\u624B\u6E38\u300F\uFF08\u7545\u9500\u699C\u5E74\u5747Top50\u5185\uFF09"'
);
fs.writeFileSync(p, c, "utf8");
console.log("Fixed. Checking for remaining curly quotes...");
const remaining = c.match(/[\u201c\u201d]/g);
console.log("Remaining curly quotes:", remaining ? remaining.length : 0);