const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function captureCurrentVolumeTiers() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=1280,1000',
    'http://127.0.0.1:5500/rate-card.html'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const tabs = await new Promise((res, rej) => http.get('http://localhost:9222/json', r => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
  }));
  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  function send(method, params = {}) {
    return new Promise(res => {
      const id = Math.floor(Math.random() * 100000);
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          res(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await new Promise(r => setTimeout(r, 800));

  // Scroll to Bulk Volume section
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.volume-tier-card');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 500));

  // Dark mode capture
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/brain/3a52254b-accd-4ad0-aabc-87a314f8c64a/scratch/vol_tier_current_dark.png', Buffer.from(shot.data, 'base64'));

  // Light mode capture
  await send('Runtime.evaluate', {
    expression: `document.documentElement.setAttribute('data-theme', 'light');`
  });
  await new Promise(r => setTimeout(r, 400));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/brain/3a52254b-accd-4ad0-aabc-87a314f8c64a/scratch/vol_tier_current_light.png', Buffer.from(shot.data, 'base64'));

  ws.close();
  chrome.kill();
  console.log('Saved current volume tier screenshots');
}

captureCurrentVolumeTiers().catch(console.error);
