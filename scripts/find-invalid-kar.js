const fs = require('fs');
const content = fs.readFileSync('./src/lib/curriculum/curriculum-data.ts', 'utf8');

// Regex for JSON string containing items array with strings starting with kar/hasanta/nukta
const karRange = /[\u09BE-\u09CD]/;
const itemRegex = /"items":\s*\[([\s\S]*?)\]/g;

let match;
let count = 0;
const invalidTokens = new Set();

while ((match = itemRegex.exec(content)) !== null) {
  const itemsBlock = match[1];
  const stringRegex = /"([^"]+)"/g;
  let strMatch;
  while ((strMatch = stringRegex.exec(itemsBlock)) !== null) {
    const word = strMatch[1];
    // Check if starts with a dependent sign (kar, hasanta, nukta, etc.)
    const firstCode = word.charCodeAt(0);
    // 0x09BE to 0x09CD
    if (firstCode >= 0x09BE && firstCode <= 0x09CD) {
      if (word.length > 1) {
        invalidTokens.add(word);
        count++;
      }
    }
  }
}

console.log('Total invalid multi-char tokens starting with kar:', count);
console.log('Unique tokens:', Array.from(invalidTokens));
