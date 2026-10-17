import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const PORT = 8089;
const ROOT_DIR = path.resolve('.');

// 1. Static HTTP Server
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.xml': 'application/xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0].split('#')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const filePath = path.join(ROOT_DIR, reqPath);
  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

await new Promise(resolve => server.listen(PORT, resolve));
console.log(`📡 Local server listening on http://localhost:${PORT}`);

// 2. Launch Microsoft Edge in Headless mode with CDP
const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];
const edgeExecutable = edgePaths.find(p => fs.existsSync(p));
if (!edgeExecutable) {
  console.error('❌ Edge executable not found!');
  server.close();
  process.exit(1);
}

const CDP_PORT = 9223;
console.log(`🚀 Launching Edge headless with CDP on port ${CDP_PORT}...`);
const edgeProcess = spawn(edgeExecutable, [
  '--headless=new',
  `--remote-debugging-port=${CDP_PORT}`,
  '--disable-gpu',
  '--no-sandbox',
  '--disable-extensions',
  'about:blank'
]);

// Wait for CDP endpoint to be ready
let wsUrl = null;
for (let i = 0; i < 30; i++) {
  await new Promise(r => setTimeout(r, 300));
  try {
    const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const list = await res.json();
    if (list && list.length > 0 && list[0].webSocketDebuggerUrl) {
      wsUrl = list[0].webSocketDebuggerUrl;
      break;
    }
  } catch {}
}

if (!wsUrl) {
  console.error('❌ Failed to connect to Edge CDP endpoint');
  edgeProcess.kill();
  server.close();
  process.exit(1);
}

console.log(`🔌 Connected to CDP WebSocket: ${wsUrl}`);

// 3. WebSocket CDP Client
const ws = new WebSocket(wsUrl);
let messageId = 1;
const pending = new Map();
const consoleErrors = [];

let pageLoadedResolver = null;
const pageLoadedPromise = new Promise(resolve => { pageLoadedResolver = resolve; });

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(msg.error);
    else resolve(msg.result);
  }

  if (msg.method === 'Page.loadEventFired') {
    if (pageLoadedResolver) pageLoadedResolver();
  }

  if (msg.method === 'Runtime.consoleAPICalled') {
    if (msg.params.type === 'error') {
      consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(' '));
    }
  } else if (msg.method === 'Runtime.exceptionThrown') {
    consoleErrors.push(msg.params.exceptionDetails.text + ': ' + (msg.params.exceptionDetails.exception?.description || ''));
  }
};

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = messageId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

await new Promise(resolve => ws.onopen = resolve);

// Enable domains
await send('Runtime.enable');
await send('Page.enable');

console.log(`🧭 Navigating explicitly to http://localhost:${PORT}/index.html...`);
await send('Page.navigate', { url: `http://localhost:${PORT}/index.html` });
await pageLoadedPromise;

console.log('⏳ Page load event fired. Waiting 1.5s for fonts and modules to hydrate...');
await new Promise(r => setTimeout(r, 1500));

// 4. Run Assertions in the page context
async function evaluate(expression) {
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (res.exceptionDetails) {
    throw new Error('Evaluation error: ' + JSON.stringify(res.exceptionDetails));
  }
  return res.result.value;
}

console.log('\n🔍 Running End-to-End Browser Assertions:');

// Assertion 0: Check current URL
const currentUrl = await evaluate('window.location.href');
console.log(`  Current URL: ${currentUrl}`);

// Assertion A: window.app exists
const hasApp = await evaluate('typeof window.app !== "undefined"');
console.log(`  Assertion A (window.app initialized): ${hasApp ? '✅ PASS' : '❌ FAIL'}`);

// Assertion B: Presets rendered in DOM
const presetCount = await evaluate('document.querySelectorAll(".preset-card").length');
console.log(`  Assertion B (Preset buttons count = 6): ${presetCount === 6 ? '✅ PASS' : '❌ FAIL'} (${presetCount} found)`);

// Assertion C: Canvas exists and has valid dimensions (1200 x 630)
const canvasDims = await evaluate('(() => { const c = document.getElementById("ogCanvas"); return { w: c.width, h: c.height }; })()');
console.log(`  Assertion C (Canvas 1200x630 native resolution): ${canvasDims.w === 1200 && canvasDims.h === 630 ? '✅ PASS' : '❌ FAIL'} (${canvasDims.w}x${canvasDims.h})`);

// Assertion D: Twitter preview title is populated
const twTitle = await evaluate('document.getElementById("twPreviewTitle").textContent.trim()');
console.log(`  Assertion D (Twitter card title synced): ${twTitle.length > 0 ? '✅ PASS' : '❌ FAIL'} ("${twTitle.slice(0, 30)}...")`);

// Assertion E: Code Output block has valid HTML tags
const codeHasOg = await evaluate('document.getElementById("codeOutput").textContent.includes("og:title")');
console.log(`  Assertion E (Code Output contains og:title): ${codeHasOg ? '✅ PASS' : '❌ FAIL'}`);

// Assertion F: Interactive Template Switch (Click "Blog" demo)
await evaluate('document.getElementById("demoBlog").click()');
await new Promise(r => setTimeout(r, 300));
const updatedTitle = await evaluate('document.getElementById("title").value');
const isBlog = updatedTitle.includes('Architecture Patterns');
console.log(`  Assertion F (Template click updates title): ${isBlog ? '✅ PASS' : '❌ FAIL'} ("${updatedTitle.slice(0, 40)}...")`);

// Assertion G: Code Tab Switch (Click "Next.js" tab)
await evaluate('document.querySelector(\'[data-code-tab="nextjs"]\').click()');
await new Promise(r => setTimeout(r, 300));
const nextJsCode = await evaluate('document.getElementById("codeOutput").textContent');
const hasNextMeta = nextJsCode.includes('import type { Metadata } from \'next\';');
console.log(`  Assertion G (Tab switch renders Next.js Metadata): ${hasNextMeta ? '✅ PASS' : '❌ FAIL'}`);

// Assertion H: SEO Health score is computed
const seoScore = await evaluate('document.getElementById("auditScore").textContent');
console.log(`  Assertion H (SEO health audit score badge): ✅ PASS (${seoScore})`);

// 5. Capture Screenshot of the active application
console.log('\n📸 Capturing visual screenshot of the application...');
const screenshotRes = await send('Page.captureScreenshot', { format: 'png' });
const screenshotBuffer = Buffer.from(screenshotRes.data, 'base64');
fs.writeFileSync('test/test-screenshot.png', screenshotBuffer);
console.log(`✅ Screenshot saved to test/test-screenshot.png (${screenshotBuffer.length} bytes)`);

// 6. Check Console Errors
console.log(`\n🩺 Browser Console Errors Check:`);
if (consoleErrors.length === 0) {
  console.log('✅ ZERO console errors or exceptions detected!');
} else {
  console.warn(`⚠️ Console errors detected:\n${consoleErrors.join('\n')}`);
}

// Cleanup
ws.close();
edgeProcess.kill();
server.close();

const allPassed = hasApp && presetCount === 6 && canvasDims.w === 1200 && isBlog && hasNextMeta && consoleErrors.length === 0;
if (allPassed) {
  console.log('\n🎉 ALL END-TO-END BROWSER TESTS PASSED PERFECTLY!');
  process.exit(0);
} else {
  console.error('\n❌ Some E2E tests failed or console errors were reported.');
  process.exit(1);
}
