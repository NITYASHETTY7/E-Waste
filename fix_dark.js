const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync('apps/web/src');
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Find all className=... blocks
  content = content.replace(/className=(?:"([^"]+)"|`([^`]+)`|'([^']+)')/g, (match, p1, p2, p3) => {
    let classes = p1 || p2 || p3 || '';
    if (!classes) return match;
    
    // Split by spaces, including newlines if in template literals
    const tokens = classes.split(/\s+/);
    
    const applyIfMissing = (target, replacement) => {
      if (tokens.includes(target)) {
         // check if ANY dark variant of this property exists
         const prefixKey = target.split('-')[0]; // 'bg' or 'text' or 'border'
         const hasDark = tokens.some(t => t.startsWith('dark:') && t.split(':')[1].startsWith(prefixKey + '-'));
         if (!hasDark) {
            tokens.push(replacement);
         }
      }
    };

    applyIfMissing('bg-white', 'dark:bg-slate-900');
    applyIfMissing('bg-slate-50', 'dark:bg-slate-950');
    applyIfMissing('bg-slate-100', 'dark:bg-slate-800');
    applyIfMissing('bg-[#F5F7FA]', 'dark:bg-slate-950');
    applyIfMissing('bg-[#ffffff]', 'dark:bg-slate-900');
    
    applyIfMissing('text-slate-900', 'dark:text-white');
    applyIfMissing('text-slate-800', 'dark:text-slate-200');
    applyIfMissing('text-slate-700', 'dark:text-slate-300');
    applyIfMissing('text-slate-600', 'dark:text-slate-400');
    applyIfMissing('text-black', 'dark:text-white');
    
    applyIfMissing('border-slate-200', 'dark:border-slate-700');
    applyIfMissing('border-slate-100', 'dark:border-slate-800');
    applyIfMissing('border-slate-300', 'dark:border-slate-600');
    
    const quote = p1 ? '"' : (p2 ? '`' : "'");
    return 'className=' + quote + tokens.join(' ') + quote;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
  }
});

console.log('Modified ' + changedFiles + ' files.');
