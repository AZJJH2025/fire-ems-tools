const puppeteer = require('puppeteer');

async function testAIChatWidget() {
    let browser;
    let page;
    
    try {
        console.log('🚀 Starting AI Chat Widget test...');
        
        // Launch browser
        browser = await puppeteer.launch({ 
            headless: false,  // Show browser window
            devtools: true,   // Open DevTools automatically
            args: [
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });
        
        page = await browser.newPage();
        
        // Enable console logging from page
        page.on('console', (msg) => {
            const type = msg.type();
            const text = msg.text();
            
            if (text.includes('🤖 [DEBUG]')) {
                console.log(`📄 CONSOLE [${type.upper()}]: ${text}`);
            }
        });
        
        // Set up authentication (if needed) - we might need to handle login
        console.log('🔐 Setting up authentication...');
        
        // Navigate to login page first (if needed)
        console.log('🌐 Navigating to login page...');
        await page.goto('http://127.0.0.1:5006/login', { waitUntil: 'networkidle2' });
        
        // Wait a bit to see if we're redirected or if we need to login
        await page.waitForTimeout(2000);
        
        const currentUrl = page.url();
        console.log('📍 Current URL after navigation:', currentUrl);
        
        if (currentUrl.includes('/login')) {
            console.log('🔑 Login page detected, need to authenticate...');
            
            // Try to fill in login form (you may need to adjust these selectors)
            try {
                await page.waitForSelector('input[type="email"], input[name="email"], input[id="email"]', { timeout: 5000 });
                await page.type('input[type="email"], input[name="email"], input[id="email"]', 'test@example.com');
                
                await page.waitForSelector('input[type="password"], input[name="password"], input[id="password"]', { timeout: 5000 });
                await page.type('input[type="password"], input[name="password"], input[id="password"]', 'testpassword');
                
                await page.click('button[type="submit"], button:contains("Login"), input[type="submit"]');
                
                await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
                console.log('✅ Login attempt completed, new URL:', page.url());
                
            } catch (loginError) {
                console.log('⚠️ Login failed or form not found:', loginError.message);
                console.log('🔄 Proceeding to test page anyway (may be public)...');
            }
        }
        
        // Navigate to Data Formatter page
        console.log('📂 Navigating to Data Formatter page...');
        await page.goto('http://127.0.0.1:5006/app/data-formatter', { waitUntil: 'networkidle2' });
        
        console.log('⏳ Waiting for page to load...');
        await page.waitForTimeout(3000);
        
        // Check for AI chat widget
        console.log('🔍 Looking for AI Chat Widget...');
        
        // Look for the floating chat button
        const chatButton = await page.$('[aria-label*="AI"], [title*="AI"], [class*="ai-chat"], button:has([data-testid*="ai"]), button:has(svg)').catch(() => null);
        
        if (!chatButton) {
            console.log('⚠️ AI Chat button not found with standard selectors, trying broader search...');
            
            // Try to find any button that might be the chat widget
            const buttons = await page.$$('button, [role="button"]');
            console.log(`🔍 Found ${buttons.length} buttons on page, examining each...`);
            
            for (let i = 0; i < buttons.length; i++) {
                const button = buttons[i];
                const buttonText = await button.evaluate(el => el.textContent || el.title || el.getAttribute('aria-label') || '');
                const buttonClasses = await button.evaluate(el => el.className || '');
                console.log(`Button ${i}: "${buttonText}" classes: "${buttonClasses}"`);
            }
            
            // Look for Material-UI FAB (Floating Action Button)
            const fabButton = await page.$('[class*="MuiFab"], [class*="floating"], paper[elevation="6"]').catch(() => null);
            if (fabButton) {
                console.log('✨ Found Material-UI FAB button, clicking...');
                await fabButton.click();
            } else {
                console.log('❌ No AI Chat Widget found on page');
                console.log('📸 Taking screenshot for debugging...');
                await page.screenshot({ path: 'ai_chat_debug.png', fullPage: true });
                return;
            }
        } else {
            console.log('✅ AI Chat button found, clicking...');
            await chatButton.click();
        }
        
        // Wait for chat widget to open
        console.log('⏳ Waiting for chat widget to open...');
        await page.waitForTimeout(2000);
        
        // Look for chat input field
        console.log('🔍 Looking for chat input field...');
        const chatInput = await page.$('input[placeholder*="Ask"], textarea[placeholder*="Ask"], input[type="text"]').catch(() => null);
        
        if (!chatInput) {
            console.log('❌ Chat input field not found');
            console.log('📸 Taking screenshot for debugging...');
            await page.screenshot({ path: 'ai_chat_opened_debug.png', fullPage: true });
            return;
        }
        
        console.log('✅ Chat input field found, typing test message...');
        
        // Type the test message
        const testMessage = "Can you give me the step-by-step on how to use the tool?";
        await chatInput.click();
        await chatInput.type(testMessage);
        
        // Look for send button and click it
        console.log('🔍 Looking for send button...');
        const sendButton = await page.$('button[aria-label*="Send"], button:has([data-testid*="send"]), button[type="submit"]').catch(() => null);
        
        if (sendButton) {
            console.log('✅ Send button found, clicking...');
            await sendButton.click();
        } else {
            // Try pressing Enter
            console.log('⌨️ Send button not found, trying Enter key...');
            await chatInput.press('Enter');
        }
        
        // Wait for response
        console.log('⏳ Waiting for AI response...');
        await page.waitForTimeout(5000);
        
        // Check for response messages
        console.log('🔍 Looking for response messages...');
        const messages = await page.$$('[class*="message"], [class*="chat"], li').catch(() => []);
        
        console.log(`📝 Found ${messages.length} potential message elements`);
        
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const messageText = await message.evaluate(el => el.textContent || '');
            if (messageText.trim().length > 0) {
                console.log(`Message ${i}: "${messageText.substring(0, 100)}..."`);
            }
        }
        
        // Take final screenshot
        console.log('📸 Taking final screenshot...');
        await page.screenshot({ path: 'ai_chat_final.png', fullPage: true });
        
        console.log('✅ AI Chat Widget test completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during test:', error);
        
        if (page) {
            console.log('📸 Taking error screenshot...');
            await page.screenshot({ path: 'ai_chat_error.png', fullPage: true });
        }
    } finally {
        if (browser) {
            console.log('🔒 Closing browser...');
            await browser.close();
        }
    }
}

// Check if puppeteer is available
try {
    testAIChatWidget();
} catch (error) {
    console.error('❌ Puppeteer not available:', error);
    console.log('💡 To run this test, install puppeteer: npm install puppeteer');
}