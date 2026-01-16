const xlsx = require('xlsx');
const path = require('path');

// Path to the Excel file
const excelPath = path.join(__dirname, '..', 'Bible api', 'NASB1995', 'NASB1995.xlsx');

function examineExcel() {
  try {
    console.log(`Reading Excel file: ${excelPath}`);
    
    // Check if file exists
    if (!require('fs').existsSync(excelPath)) {
      console.error(`Error: File not found at ${excelPath}`);
      return;
    }

    // Read the workbook
    const workbook = xlsx.readFile(excelPath);
    
    // List all sheet names
    console.log('\nSheet names:', workbook.SheetNames);
    
    // Process each sheet
    workbook.SheetNames.forEach(sheetName => {
      console.log(`\n=== Sheet: ${sheetName} ===`);
      
      // Get the worksheet
      const worksheet = workbook.Sheets[sheetName];
      
      // Get the range of the sheet
      const range = xlsx.utils.decode_range(worksheet['!ref']);
      console.log(`Range: ${xlsx.utils.encode_range(range)}`);
      
      // Get column headers
      const headers = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = worksheet[xlsx.utils.encode_cell({ r: range.s.r, c: C })];
        headers.push(cell ? cell.v : `Column ${C + 1}`);
      }
      console.log('Headers:', headers);
      
      // Get first 5 rows of data
      const data = [];
      for (let R = range.s.r + 1; R <= Math.min(range.s.r + 5, range.e.r); ++R) {
        const row = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell = worksheet[xlsx.utils.encode_cell({ r: R, c: C })];
          row.push(cell ? cell.v : '');
        }
        data.push(row);
      }
      
      console.log('\nFirst 5 rows of data:');
      console.table(data);
      
      // Show sample data with headers
      console.log('\nSample data with headers:');
      data.forEach((row, i) => {
        const rowObj = {};
        headers.forEach((header, j) => {
          rowObj[header] = row[j];
        });
        console.log(`Row ${i + 1}:`, JSON.stringify(rowObj, null, 2));
      });
    });
    
  } catch (error) {
    console.error('Error examining Excel file:', error);
  }
}

// Run the examination
examineExcel();
