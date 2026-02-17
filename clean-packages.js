const fs = require('fs');
const path = require('path');

// Function to clean package.json
function cleanPackageJson(filePath) {
    try {
        const pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Remove Windows-specific packages
        const removePackages = [
            '@next/swc-win32-x64-msvc',
            'fsevents',
            'win32'
        ];

        // Clean dependencies
        if (pkg.dependencies) {
            removePackages.forEach(pkgName => {
                if (pkg.dependencies[pkgName]) {
                    console.log(`Removing ${pkgName} from dependencies`);
                    delete pkg.dependencies[pkgName];
                }
            });
        }

        // Clean devDependencies
        if (pkg.devDependencies) {
            removePackages.forEach(pkgName => {
                if (pkg.devDependencies[pkgName]) {
                    console.log(`Removing ${pkgName} from devDependencies`);
                    delete pkg.devDependencies[pkgName];
                }
            });
        }

        // Add Linux-specific SWC if not present
        if (pkg.devDependencies && !pkg.devDependencies['@next/swc-linux-x64-gnu']) {
            console.log('Adding @next/swc-linux-x64-gnu to devDependencies');
            pkg.devDependencies['@next/swc-linux-x64-gnu'] = '^15.5.7';
        }

        // Save the cleaned package.json
        fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2));
        console.log('Successfully cleaned package.json');
        
    } catch (error) {
        console.error('Error cleaning package.json:', error);
        process.exit(1);
    }
}

// Run the cleanup
cleanPackageJson(path.join(__dirname, 'package.json'));
