const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = '/Users/josephhester/fire-ems-tools';
const reactAppDir = path.join(projectRoot, 'react-app');

console.log('=== Enhanced Debugging Code Rebuild with Node.js ===');

// Function to run command
function runCommand(command, cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
        console.log(`Running: ${command} in ${cwd}`);
        exec(command, { cwd }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.warn(`Warning: ${stderr}`);
            }
            console.log(`Output: ${stdout}`);
            resolve(stdout);
        });
    });
}

// Function to copy directory recursively
function copyDir(src, dest) {
    if (!fs.existsSync(src)) {
        throw new Error(`Source directory does not exist: ${src}`);
    }
    
    if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
    }
    
    fs.mkdirSync(dest, { recursive: true });
    
    const items = fs.readdirSync(src);
    
    for (const item of items) {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        
        const stat = fs.statSync(srcPath);
        
        if (stat.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

async function main() {
    try {
        // Step 1: Clean old build
        const distPath = path.join(reactAppDir, 'dist');
        if (fs.existsSync(distPath)) {
            console.log('1. Removing old dist directory...');
            fs.rmSync(distPath, { recursive: true, force: true });
        }
        
        // Step 2: Build
        console.log('2. Building React app...');
        await runCommand('npm run build-no-check', reactAppDir);
        
        // Step 3: Remove old app directory
        const appPath = path.join(projectRoot, 'app');
        if (fs.existsSync(appPath)) {
            console.log('3. Removing old app directory...');
            fs.rmSync(appPath, { recursive: true, force: true });
        }
        
        // Step 4: Copy new build to app directory
        console.log('4. Copying build to app directory...');
        copyDir(distPath, appPath);
        
        // Step 5: Fix HTML script paths
        console.log('5. Fixing HTML script paths...');
        const indexHtmlPath = path.join(appPath, 'index.html');
        let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
        htmlContent = htmlContent.replace(/src="\/assets\//g, 'src="/app/assets/');
        fs.writeFileSync(indexHtmlPath, htmlContent);
        
        // Step 6: Verify debugging code
        console.log('6. Verifying debugging code...');
        const assetsPath = path.join(appPath, 'assets');
        let debuggingFound = false;
        
        if (fs.existsSync(assetsPath)) {
            const files = fs.readdirSync(assetsPath);
            
            for (const file of files) {
                if (file.endsWith('.js')) {
                    const filePath = path.join(assetsPath, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    
                    if (content.includes('NORMALIZE_FUNCTION_CALLED')) {
                        console.log(`✅ Found NORMALIZE_FUNCTION_CALLED in ${file}`);
                        debuggingFound = true;
                    }
                    if (content.includes('ORIGINAL_FIELD_NAMES')) {
                        console.log(`✅ Found ORIGINAL_FIELD_NAMES in ${file}`);
                    }
                    if (content.includes('LOCATION_RELATED_FIELDS_FOUND')) {
                        console.log(`✅ Found LOCATION_RELATED_FIELDS_FOUND in ${file}`);
                    }
                }
            }
        }
        
        if (debuggingFound) {
            console.log('\n🎉 SUCCESS! Enhanced debugging code deployed!');
            console.log('\nDebugging features now active:');
            console.log('- Alert popup when normalizeFieldNames is called');
            console.log('- Console logs with NORMALIZE_FUNCTION_CALLED');
            console.log('- ORIGINAL_FIELD_NAMES logging');
            console.log('- LOCATION_RELATED_FIELDS_FOUND detection');
            console.log('\n📋 Ready to test with data transfer!');
        } else {
            console.log('\n⚠️ Warning: NORMALIZE_FUNCTION_CALLED not found in build');
        }
        
    } catch (error) {
        console.error('❌ Error during deployment:', error.message);
        process.exit(1);
    }
}

main();