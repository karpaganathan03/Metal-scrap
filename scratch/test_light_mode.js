const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function test() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=1280,1050',
    'http://127.0.0.1:5500/home-1.html'
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
  await new Promise(r => setTimeout(r, 600));

  // Toggle theme button
  await send('Runtime.evaluate', {
    expression: `(() => {
      const toggle = document.getElementById('themeToggleBtn') || document.querySelector('.theme-toggle-btn');
      if (toggle) toggle.click();
      return {
        htmlTheme: document.documentElement.getAttribute('data-theme'),
        bodyTheme: document.body.getAttribute('data-theme')
      };
    })()`
  });
  await new Promise(r => setTimeout(r, 400));

  // Scroll to catalogue hub
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.getElementById('catalogueControlPanel');
      const y = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: y, behavior: 'instant' });
    })()`
  });
  await new Promise(r => setTimeout(r, 400));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/catalogue_light_perfect.png', Buffer.from(shot.data, 'base64'));

  // Click non-ferrous
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('#materialCategoryNav .filter-btn-chip')).find(b => b.getAttribute('data-category') === 'non-ferrous');
      btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 500));

  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/catalogue_nonferrous_light_perfect.png', Buffer.from(shot2.data, 'base64'));

  chrome.kill();
  process.exit(0);
}
test();
