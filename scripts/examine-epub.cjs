const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const AdmZip = require('adm-zip');

// Path to the EPUB file
const epubPath = path.join(__dirname, '..', 'Bible api', 'NASB1995', 'NASB1995.epub');
const outputDir = path.join(__dirname, '..', 'Bible api', 'NASB1995', 'epub-extracted');

async function examineEPUB() {
  try {
    console.log(`Examining EPUB file: ${epubPath}`);
    
    // Check if the file exists
    if (!fs.existsSync(epubPath)) {
      console.error(`Error: EPUB file not found at ${epubPath}`);
      return;
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Extract the EPUB file
    console.log('Extracting EPUB contents...');
    const zip = new AdmZip(epubPath);
    zip.extractAllTo(outputDir, true);

    console.log(`EPUB contents extracted to: ${outputDir}`);
    
    // List the extracted files
    const listFiles = (dir, prefix = '') => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          console.log(`${prefix}📁 ${file}/`);
          listFiles(fullPath, prefix + '  ');
        } else {
          console.log(`${prefix}📄 ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
        }
      });
    };

    console.log('\nExtracted files:');
    listFiles(outputDir);

    // Look for OPF file to understand the structure
    const findOPFFile = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          const found = findOPFFile(fullPath);
          if (found) return found;
        } else if (file.endsWith('.opf')) {
          return fullPath;
        }
      }
      return null;
    };

    const opfPath = findOPFFile(outputDir);
    if (opfPath) {
      console.log(`\nFound OPF file at: ${path.relative(process.cwd(), opfPath)}`);
      console.log('\nOPF file content (first 20 lines):');
      const opfContent = fs.readFileSync(opfPath, 'utf8');
      console.log(opfContent.split('\n').slice(0, 20).join('\n') + '\n...');
    }

    // Look for HTML/XML files that might contain the actual text
    const findContentFiles = (dir, ext = ['.xhtml', '.html', '.xml']) => {
      let results = [];
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          results = results.concat(findContentFiles(fullPath, ext));
        } else if (ext.some(e => file.endsWith(e))) {
          results.push(fullPath);
        }
      }
      return results;
    };

    const contentFiles = findContentFiles(outputDir);
    console.log(`\nFound ${contentFiles.length} potential content files`);
    
    if (contentFiles.length > 0) {
      console.log('\nFirst few content files:');
      contentFiles.slice(0, 5).forEach((file, i) => {
        console.log(`${i + 1}. ${path.relative(process.cwd(), file)}`);
      });
      
      // Show a sample of the first content file
      if (contentFiles.length > 0) {
        console.log('\nSample content from first file (first 200 chars):');
        const sampleContent = fs.readFileSync(contentFiles[0], 'utf8').substring(0, 200);
        console.log(`"${sampleContent}..."`);
      }
    }

  } catch (error) {
    console.error('Error examining EPUB:', error);
  }
}

// Run the examination
examineEPUB().catch(console.error);
