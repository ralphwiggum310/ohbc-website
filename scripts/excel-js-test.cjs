const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Path to the Excel file
const excelPath = path.join(__dirname, '..', 'Bible api', 'NASB1995', 'NASB1995.xlsx');

async function examineExcel() {
  console.log(`Reading Excel file: ${excelPath}`);
  
  // Check if file exists
  if (!fs.existsSync(excelPath)) {
    console.error(`Error: File not found at ${excelPath}`);
    return;
  }

  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  
  try {
    // Read the Excel file
    await workbook.xlsx.readFile(excelPath);
    
    // Get the first worksheet
    const worksheet = workbook.worksheets[0];
    console.log(`Worksheet name: ${worksheet.name}`);
    
    // Get the dimensions of the worksheet
    const dimensions = worksheet.dimensions;
    console.log(`Dimensions: ${dimensions}`);
    console.log(`Row count: ${worksheet.rowCount}`);
    console.log(`Column count: ${worksheet.columnCount}`);
    
    // Get the first row (headers)
    const headerRow = worksheet.getRow(1);
    console.log('\nHeaders:');
    headerRow.eachCell((cell, colNumber) => {
      console.log(`  Column ${colNumber}: ${cell.value}`);
    });
    
    // Get the first few rows of data
    console.log('\nFirst 5 rows of data:');
    const rowCount = Math.min(5, worksheet.rowCount);
    
    for (let i = 2; i <= rowCount + 1; i++) {
      const row = worksheet.getRow(i);
      const rowData = [];
      
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        rowData.push({
          column: colNumber,
          value: cell.value,
          type: cell.type,
          address: cell.address
        });
      });
      
      console.log(`\nRow ${i}:`);
      console.log(JSON.stringify(rowData, null, 2));
    }
    
  } catch (error) {
    console.error('Error reading Excel file:', error);
  }
}

// Run the examination
examineExcel().catch(console.error);
