const XLSX = require('xlsx');
const path = require('path');

// Path to the Excel file
const excelPath = path.join(__dirname, '..', 'Bible api', 'KJV,ASV,ERV,WEB.xlsx');

// Read the Excel file
const workbook = XLSX.readFile(excelPath);

// Get the sheet names
console.log('Sheet names:', workbook.SheetNames);

// Get the first sheet
const firstSheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[firstSheetName];

// Convert to JSON to see the structure
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// Log the first 5 rows to understand the structure
console.log('First 5 rows of data:');
for (let i = 0; i < Math.min(5, jsonData.length); i++) {
  console.log(`Row ${i + 1}:`, jsonData[i]);
}

// Log the number of rows and columns
console.log(`Total rows: ${jsonData.length}`);
console.log(`Total columns: ${jsonData[0] ? jsonData[0].length : 0}`);
