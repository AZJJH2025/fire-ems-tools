import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// FORCE COMPLETE BUILD INVALIDATION - JULY 13 2025 02:20 - HYDRANT FIX
console.log('🚨 FORCE BUILD CACHE INVALIDATION - HYDRANT STRUCTURE FIX - 2025-07-13T02:20:00Z');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    // Custom plugin to fix asset paths after build
    {
      name: 'fix-asset-paths',
      writeBundle() {
        const fs = require('fs');
        const path = require('path');
        
        // Fix JavaScript files
        const assetsDir = path.join(__dirname, 'dist/assets');
        const files = fs.readdirSync(assetsDir).filter(file => file.endsWith('.js'));
        
        files.forEach(file => {
          const filePath = path.join(assetsDir, file);
          let content = fs.readFileSync(filePath, 'utf8');
          
          // Replace all variations of assets/ references
          content = content.replace(/"\/assets\//g, '"/app/assets/');
          content = content.replace(/\"assets\//g, '"/app/assets/');
          content = content.replace(/\/assets\//g, '/app/assets/');
          content = content.replace(/assets\//g, '/app/assets/');
          content = content.replace(/\\"assets\//g, '\\"/app/assets/');
          
          fs.writeFileSync(filePath, content);
        });
        
        // Fix index.html file
        const indexPath = path.join(__dirname, 'dist/index.html');
        let indexContent = fs.readFileSync(indexPath, 'utf8');
        
        // Replace /assets/ with /app/assets/ in HTML
        indexContent = indexContent.replace(/src="\/assets\//g, 'src="/app/assets/');
        indexContent = indexContent.replace(/href="\/assets\//g, 'href="/app/assets/');
        
        fs.writeFileSync(indexPath, indexContent);
        
        console.log('Fixed asset paths in JavaScript bundles and index.html');
      }
    }
  ],
  base: '/app/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 7777,
    open: true,
    strictPort: false, // Allow fallback to another port if 7777 is taken
  },
  build: {
    assetsDir: 'assets',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    minify: 'esbuild',
    target: 'es2015',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        // More aggressive chunk size limits
        maxParallelFileOps: 5,
        manualChunks: (id) => {
          // Core React dependencies
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-core';
          }
          
          // Redux dependencies
          if (id.includes('redux') || id.includes('@reduxjs/toolkit')) {
            return 'redux';
          }
          
          // Material UI core - keep separate from icons
          if (id.includes('@mui/material') || id.includes('@emotion')) {
            return 'mui-core';
          }
          
          // Material UI icons (large bundle) - separate chunk
          if (id.includes('@mui/icons-material')) {
            return 'mui-icons';
          }
          
          // Material UI data components (large bundle)
          if (id.includes('@mui/x-data-grid') || id.includes('@mui/x-date-pickers')) {
            return 'mui-data';
          }
          
          // Mapping and geospatial libraries
          if (id.includes('leaflet') || id.includes('react-leaflet')) {
            return 'mapping';
          }
          
          // Large file processing libraries
          if (id.includes('xlsx')) {
            return 'xlsx';
          }
          
          if (id.includes('papaparse') || id.includes('pdf-parse')) {
            return 'file-processing';
          }
          
          // PDF generation
          if (id.includes('jspdf') || id.includes('html2canvas')) {
            return 'pdf-generation';
          }
          
          // Split large utility libraries
          if (id.includes('lodash') || id.includes('date-fns') || id.includes('moment')) {
            return 'utilities';
          }
          
          // Split validators and parsers
          if (id.includes('zod') || id.includes('yup') || id.includes('validator')) {
            return 'validation';
          }
          
          // HTTP clients and networking
          if (id.includes('axios') || id.includes('fetch')) {
            return 'networking';
          }
          
          // Other vendor dependencies
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  // This is critical - provides browser-compatible versions of Node.js modules
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});