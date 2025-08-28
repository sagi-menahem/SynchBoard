const fs = require('fs');
const path = require('path');

function removeComments(content) {
  // Remove single-line comments
  content = content.replace(/\/\/.*$/gm, '');
  
  // Remove multi-line comments including JSDoc
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove TODO, FIXME, NOTE, HACK comments
  content = content.replace(/\/\/\s*(TODO|FIXME|NOTE|HACK|XXX).*$/gmi, '');
  
  // Clean up empty lines that were left after comment removal
  content = content.replace(/^\s*[\r\n]/gm, '');
  
  // Clean up trailing whitespace
  content = content.replace(/[ \t]+$/gm, '');
  
  return content;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const originalLineCount = content.split('\n').length;
  
  const cleanedContent = removeComments(content);
  const newLineCount = cleanedContent.split('\n').length;
  
  if (content !== cleanedContent) {
    fs.writeFileSync(filePath, cleanedContent);
    return {
      modified: true,
      linesRemoved: originalLineCount - newLineCount,
      path: filePath
    };
  }
  
  return { modified: false };
}

function walkDir(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.startsWith('.')) {
        walkDir(filePath, results);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(filePath);
    }
  }
  
  return results;
}

const srcDir = path.join(__dirname, 'src');
const files = walkDir(srcDir);

let totalModified = 0;
let totalLinesRemoved = 0;

console.log(`Processing ${files.length} TypeScript files...`);

for (const file of files) {
  const result = processFile(file);
  if (result.modified) {
    totalModified++;
    totalLinesRemoved += result.linesRemoved;
    console.log(`Modified: ${path.relative(srcDir, result.path)} (-${result.linesRemoved} lines)`);
  }
}

console.log('\n=== Summary ===');
console.log(`Files processed: ${files.length}`);
console.log(`Files modified: ${totalModified}`);
console.log(`Total lines removed: ${totalLinesRemoved}`);