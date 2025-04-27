#!/bin/bash
# download_fonts_mac.sh - Mac-specific version of download_fonts.sh
# Uses macOS-compatible sed command syntax

echo "=== Downloading Font Awesome for local hosting (macOS version) ==="

# Create vendor directories
mkdir -p ../static/vendor/font-awesome/{css,webfonts}

# Download minified CSS
echo "Downloading Font Awesome CSS..."
curl -L -o ../static/vendor/font-awesome/css/all.min.css \
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"

# Download webfonts (WOFF2 files only for smaller size)
echo "Downloading Font Awesome webfonts..."
curl -L -o ../static/vendor/font-awesome/webfonts/fa-brands-400.woff2 \
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2"
  
curl -L -o ../static/vendor/font-awesome/webfonts/fa-regular-400.woff2 \
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-regular-400.woff2"
  
curl -L -o ../static/vendor/font-awesome/webfonts/fa-solid-900.woff2 \
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2"

# Verify downloads
echo -e "\nVerifying downloaded files:"
find ../static/vendor/font-awesome -type f | while read file; do
  size=$(du -h "$file" | cut -f1)
  echo "✓ ${file##*/} (${size})"
done

echo -e "\nFont Awesome successfully downloaded to static/vendor/font-awesome/"

# Fix Font Awesome CSS paths to point to local files - using macOS sed syntax
echo "Fixing CSS paths to reference local webfonts..."
sed -i '' 's|https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/|../webfonts/|g' \
  ../static/vendor/font-awesome/css/all.min.css

echo "Path replacement complete."