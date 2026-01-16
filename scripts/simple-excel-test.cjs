const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Bible api', 'NASB1995', 'NASB1995.xlsx');

console.log(`Reading file: ${filePath}`);
try {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  console.log(`First sheet name: ${sheetName}`);
  
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log('First 5 rows:');
  for (let i = 0; i < Math.min(5, jsonData.length); i++) {
    console.log(`Row ${i + 1}:`, jsonData[i]);
  }
  
  console.log('\nColumn headers:');
  console.log(jsonData[0]);
  
  console.log('\nFirst data row:');
  console.log(jsonData[1]);
  
  console.log('\nSecond data row:');
  console.log(jsonData[2]);
  
} catch (error) {
  console.error('Error:', error.message);
}
