// Test script to verify Excel parsing logic
const testData = [
  ['本文', '', '', '', ''],
  ['', '※ルビの記法：基本記法 ｜漢字《かんじ》、省略記法 漢字《かんじ》、括弧記法 漢字(かんじ)', '', '', ''],
  ['', '', '', '', ''],
  ['これは実際の本文です。', '', '', '', ''],
  ['ルビを使った例：日本《にほん》', '', '', '', ''],
  ['', '', '', '', ''],
  ['文章の解説（任意）', '', '', '', '']
];

// Simulate the parsing logic
let text = '';
let textRows = [];
let foundActualText = false;

// Find the '本文' row
let startIndex = -1;
for (let i = 0; i < testData.length; i++) {
  if (testData[i][0] === '本文') {
    startIndex = i;
    break;
  }
}

if (startIndex !== -1) {
  for (let j = startIndex + 1; j < testData.length; j++) {
    const currentRow = testData[j];
    if (!currentRow) continue;
    
    // Stop if we hit the next section
    if (currentRow[0] === '文章の解説（任意）') break;
    
    // Skip ruby notation examples and instructions
    const rowText = currentRow.join(' ').toString();
    // Check if this row contains ruby notation instructions
    if (rowText.includes('※ルビの記法') ||
        rowText.includes('ルビを振る場合') || 
        rowText.includes('基本記法') || 
        rowText.includes('省略記法') || 
        rowText.includes('括弧記法') ||
        rowText.includes('｜漢字《') || // Check for actual ruby notation examples
        rowText.includes('漢字(かんじ)') || // Check for parenthesis notation example
        (currentRow[0] && currentRow[0].toString().startsWith('・'))) {
      console.log('Skipping instruction row:', rowText);
      continue;
    }
    
    // Skip empty rows between instructions and actual text
    const rowContent = currentRow.join('').trim();
    if (!rowContent) {
      if (foundActualText) {
        // Include empty lines within the actual text
        textRows.push('');
      }
      continue;
    }
    
    // This is actual text content
    foundActualText = true;
    if (currentRow[0] || currentRow[1]) {
      textRows.push(currentRow.join(' ').trim());
    }
  }
  text = textRows.join('\n').trim();
}

console.log('Parsed text:');
console.log(text);
console.log('\nExpected result:');
console.log('これは実際の本文です。\nルビを使った例：日本《にほん》');
console.log('\nTest passed:', text === 'これは実際の本文です。\nルビを使った例：日本《にほん》');