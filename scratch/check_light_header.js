const http = require('http');
const { spawn } = require('child_process');

async function test() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=1280,1000',
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
  await new Promise(r => setTimeout(r, 500));

  // Set theme to light
  await send('Runtime.evaluate', {
    expression: "document.documentElement.setAttribute('data-theme', 'light');"
  });
  await new Promise(r => setTimeout(r, 300));

  const result = await send('Runtime.evaluate', {
    expression: `(() => {
      const header = document.querySelector('.catalogue-category-header');
      const h2 = header ? header.querySelector('h2') : null;
      const p = header ? header.querySelector('p') : null;
      const span = header ? header.querySelector('h2 span') : null;
      const badge = header ? header.querySelector('.badge') : null;
      const sec = document.getElementById('ferrous-section');
      const searchSec = document.getElementById('catalogue-search-bar-section');

      return {
        secBg: sec ? window.getComputedStyle(sec).backgroundColor : null,
        searchSecBg: searchSec ? window.getComputedStyle(searchSec).backgroundColor : null,
        headerDisplay: header ? window.getComputedStyle(header).display : null,
        headerVisibility: header ? window.getComputedStyle(header).visibility : null,
        h2Color: h2 ? window.getComputedStyle(h2).color : null,
        spanColor: span ? window.getComputedStyle(span).color : null,
        pColor: p ? window.getComputedStyle(p).color : null,
        badgeColor: badge ? window.getComputedStyle(badge).color : null,
        badgeBg: badge ? window.getComputedStyle(badge).backgroundColor : null,
      };
    })()`,
    returnByValue: true
  });

  console.log(JSON.stringify(result, null, 2));

  // Let's capture a screenshot of this area in light mode
  await send('Runtime.evaluate', {
    expression: "document.querySelector('.catalogue-nav-strip').scrollIntoView({ behavior: 'instant', block: 'start' });"
  });
  await new Promise(r => setTimeout(r, 400));
  const fs = require('fs');
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/home1_catalogue_light.png', Buffer.from(shot.data, 'base64'));

  chrome.kill();
  process.exit(0);
}
test();
