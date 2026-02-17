#!/bin/bash

# Backup original files
cp package.json package.json.bak
cp package-lock.json package-lock.json.bak 2>/dev/null || true

# Remove Windows-specific dependencies from package.json
jq 'del(.dependencies."@next/swc-win32-x64-msvc") | 
    del(.devDependencies."@next/swc-win32-x64-msvc") |
    del(.optionalDependencies."@next/swc-win32-x64-msvc")' package.json > package.json.tmp && mv package.json.tmp package.json

# Remove Windows-specific dependencies from package-lock.json if it exists
if [ -f "package-lock.json" ]; then
    jq 'del(.dependencies."@next/swc-win32-x64-msvc") | 
        del(.packages."node_modules/@next/swc-win32-x64-msvc")' package-lock.json > package-lock.json.tmp && 
        mv package-lock.json.tmp package-lock.json
fi

echo "Cleaned up Windows-specific dependencies from package files"
echo "Original files have been backed up with .bak extension"
