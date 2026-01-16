import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EXCEL_PATH = path.join('C:\\WindSurf\\ohbc_website\\data\\bible\\KJV,ASV,ERV,WEB.xlsx');

function inspectExcel() {
  try {
    console.log(`Reading Excel file: ${EXCEL_PATH}`);
    const workbook = xlsx.readFile(EXCEL_PATH);
    
    console.log('\n=== Excel File Information ===');
    console.log(`Number of sheets: ${workbook.SheetNames.length}`);
    console.log('Sheet names:', workbook.SheetNames);
    
    // Inspect each sheet
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      
      console.log(`\n--- Sheet: ${sheetName} ---`);
      console.log(`Rows: ${jsonData.length}`);
      
      // Show first few rows of data
      const previewRows = Math.min(5, jsonData.length);
      console.log(`First ${previewRows} rows (first 5 columns):`);
      
      for (let i = 0; i < previewRows; i++) {
        const row = jsonData[i] || [];
        const previewCols = row.slice(0, 5).map(cell => 
          typeof cell === 'string' ? `"${cell}"` : cell
        );
        console.log(`  [${previewCols.join(', ')}${row.length > 5 ? ', ...' : ''}]`);
      }
      
      // Show column headers if available
      if (jsonData.length > 0) {
        console.log('\nColumn headers:');
        const headers = jsonData[0] || [];
        console.log(`  [${headers.join('], [')}]`);
      }
    });
    
  } catch (error) {
    console.error('Error inspecting Excel file:', error);
    process.exit(1);
  }
}

inspectExcel();
