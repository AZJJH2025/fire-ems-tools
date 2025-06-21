#!/bin/bash
# Copy all files from react-app/dist to app
cd /Users/josephhester/fire-ems-tools
cp -r react-app/dist/assets/* app/assets/
cp react-app/dist/index.html app/index_backup.html
echo "Files copied successfully"
ls -la app/assets/index-Dn5aBobr.js
ls -la app/assets/ResponseTimeAnalyzerContainer-NGQ1FORM.js