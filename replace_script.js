const fs = require('fs');
let c = fs.readFileSync('src/app/page.tsx', 'utf8');
let s = c.indexOf('{/* 2. MAIN LAYOUT - Hero Section (REDESIGNED) */}');
let e = c.indexOf('{/* 9. FOOTER - Minimal */}');

let rep = fs.readFileSync('replacement.txt', 'utf8');

if (s !== -1 && e !== -1) {
  fs.writeFileSync('src/app/page.tsx', c.substring(0, s) + rep + '\n      {/* 8. FOOTER - Minimal */}\n      ' + c.substring(e));
  console.log('Replaced successfully');
} else {
  console.log('Bounds missing', s, e);
}
