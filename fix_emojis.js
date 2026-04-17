const fs = require('fs');
['src/app/admin-login/page.tsx', 'src/app/client/listings/page.tsx', 'src/app/vendor-login/page.tsx'].forEach(p => {
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/🛡️/g, '<span className="material-symbols-outlined text-[16px]">shield</span>');
  c = c.replace(/🧪/g, '<span className="material-symbols-outlined text-[16px]">science</span>');
  c = c.replace(/✅/g, '<span className="material-symbols-outlined text-[16px]">check_circle</span>');
  c = c.replace(/👉/g, '');
  fs.writeFileSync(p, c);
});
console.log('Emojis replaced');