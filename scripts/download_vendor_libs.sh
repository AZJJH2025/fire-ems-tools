#!/bin/bash
# download_vendor_libs.sh - Download all external libraries for local hosting
# This script downloads the required JS libraries from CDNs and saves them locally
# to avoid Content Security Policy issues in production

echo "=== Downloading vendor libraries for local hosting ==="

# Create vendor directories
mkdir -p ../static/vendor/{react,material-ui,react-beautiful-dnd,xlsx,papaparse,marked,font-awesome/{css,webfonts}}

# React & React DOM
echo "Downloading React and React DOM..."
curl -L -o ../static/vendor/react/react.production.min.js \
  "https://cdn.jsdelivr.net/npm/react@17/umd/react.production.min.js"
curl -L -o ../static/vendor/react/react-dom.production.min.js \
  "https://cdn.jsdelivr.net/npm/react-dom@17/umd/react-dom.production.min.js"

# Material UI
echo "Downloading Material UI..."
curl -L -o ../static/vendor/material-ui/material-ui.production.min.js \
  "https://cdn.jsdelivr.net/npm/@material-ui/core@4.12.3/umd/material-ui.production.min.js"

# React Beautiful DnD
echo "Downloading React Beautiful DnD..."
curl -L -o ../static/vendor/react-beautiful-dnd/react-beautiful-dnd.min.js \
  "https://cdn.jsdelivr.net/npm/react-beautiful-dnd@13.1.0/dist/react-beautiful-dnd.min.js"

# XLSX
echo "Downloading XLSX library..."
curl -L -o ../static/vendor/xlsx/xlsx.full.min.js \
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"

# PapaParse
echo "Downloading PapaParse library..."
curl -L -o ../static/vendor/papaparse/papaparse.min.js \
  "https://unpkg.com/papaparse@5.3.0/papaparse.min.js"

# Marked
echo "Downloading Marked library..."
curl -L -o ../static/vendor/marked/marked.min.js \
  "https://cdn.jsdelivr.net/npm/marked/marked.min.js"

# Download Font Awesome
echo "Downloading Font Awesome CSS..."
curl -L -o ../static/vendor/font-awesome/css/all.min.css \
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"

echo "Downloading Font Awesome webfonts..."
curl -L -o ../static/vendor/font-awesome/webfonts/fa-brands-400.woff2 \
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2"
  
curl -L -o ../static/vendor/font-awesome/webfonts/fa-regular-400.woff2 \
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-regular-400.woff2"
  
curl -L -o ../static/vendor/font-awesome/webfonts/fa-solid-900.woff2 \
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2"

# Fix Font Awesome CSS paths to point to local files
echo "Fixing CSS paths to reference local webfonts..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS version (BSD sed)
  sed -i '' 's|https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/|../webfonts/|g' \
    ../static/vendor/font-awesome/css/all.min.css
else
  # Linux version (GNU sed)
  sed -i 's|https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/|../webfonts/|g' \
    ../static/vendor/font-awesome/css/all.min.css
fi

# Verify downloads
echo -e "\nVerifying downloaded files:"
find ../static/vendor -type f | while read file; do
  size=$(du -h "$file" | cut -f1)
  echo "✓ ${file##*/} (${size})"
done

echo -e "\nAll libraries successfully downloaded to static/vendor/"
echo "These libraries can now be referenced locally without relying on CDNs"