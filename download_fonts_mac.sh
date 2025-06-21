#!/bin/bash
# Download and set up Roboto fonts and Material Icons using curl (for macOS)

# Create fonts directory
mkdir -p static/fonts/roboto
mkdir -p static/fonts/material-icons
mkdir -p static/css

# Download Roboto fonts (300, 400, 500, 700 weights in normal and italic)
echo "Downloading Roboto fonts..."
curl -s https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmSU5fBBc4.woff2 -o static/fonts/roboto/roboto-300.woff2
curl -s https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2 -o static/fonts/roboto/roboto-400.woff2
curl -s https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc4.woff2 -o static/fonts/roboto/roboto-500.woff2
curl -s https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.woff2 -o static/fonts/roboto/roboto-700.woff2
curl -s https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1MmgVxIIzI.woff2 -o static/fonts/roboto/roboto-100.woff2

# Italic variants
curl -s https://fonts.gstatic.com/s/roboto/v30/KFOjCnqEu92Fr1Mu51TjASc6CsQ.woff2 -o static/fonts/roboto/roboto-300-italic.woff2
curl -s https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1Mu51xIIzI.woff2 -o static/fonts/roboto/roboto-400-italic.woff2
curl -s https://fonts.gstatic.com/s/roboto/v30/KFOjCnqEu92Fr1Mu51S7ACc6CsQ.woff2 -o static/fonts/roboto/roboto-500-italic.woff2
curl -s https://fonts.gstatic.com/s/roboto/v30/KFOjCnqEu92Fr1Mu51TzBic6CsQ.woff2 -o static/fonts/roboto/roboto-700-italic.woff2

# Download Material Icons font
echo "Downloading Material Icons..."
curl -s https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2 -o static/fonts/material-icons/MaterialIcons-Regular.woff2

# Create CSS file with font-face declarations
echo "Creating fonts.css file..."
cat > static/css/fonts.css << 'EOF'
/* Self-hosted Roboto and Material Icons fonts */

/* Roboto Light (300) */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 300;
  src: url('/static/fonts/roboto/roboto-300.woff2') format('woff2');
  font-display: swap;
}

/* Roboto Regular (400) */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  src: url('/static/fonts/roboto/roboto-400.woff2') format('woff2');
  font-display: swap;
}

/* Roboto Medium (500) */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  src: url('/static/fonts/roboto/roboto-500.woff2') format('woff2');
  font-display: swap;
}

/* Roboto Bold (700) */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 700;
  src: url('/static/fonts/roboto/roboto-700.woff2') format('woff2');
  font-display: swap;
}

/* Roboto Thin (100) */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 100;
  src: url('/static/fonts/roboto/roboto-100.woff2') format('woff2');
  font-display: swap;
}

/* Roboto Light Italic (300) */
@font-face {
  font-family: 'Roboto';
  font-style: italic;
  font-weight: 300;
  src: url('/static/fonts/roboto/roboto-300-italic.woff2') format('woff2');
  font-display: swap;
}

/* Roboto Regular Italic (400) */
@font-face {
  font-family: 'Roboto';
  font-style: italic;
  font-weight: 400;
  src: url('/static/fonts/roboto/roboto-400-italic.woff2') format('woff2');
  font-display: swap;
}

/* Roboto Medium Italic (500) */
@font-face {
  font-family: 'Roboto';
  font-style: italic;
  font-weight: 500;
  src: url('/static/fonts/roboto/roboto-500-italic.woff2') format('woff2');
  font-display: swap;
}

/* Roboto Bold Italic (700) */
@font-face {
  font-family: 'Roboto';
  font-style: italic;
  font-weight: 700;
  src: url('/static/fonts/roboto/roboto-700-italic.woff2') format('woff2');
  font-display: swap;
}

/* Material Icons */
@font-face {
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: 400;
  src: url('/static/fonts/material-icons/MaterialIcons-Regular.woff2') format('woff2');
  font-display: block;
}

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}
EOF

echo "Font setup complete! Files saved to static/fonts/ and CSS to static/css/fonts.css"