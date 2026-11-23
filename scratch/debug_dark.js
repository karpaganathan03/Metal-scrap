const http = require('http');
const { spawn } = require('child_process');

async function debugDark() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=1200,950',
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

  const info = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const nav = document.getElementById("materialCategoryNav");
      const chips = Array.from(document.querySelectorAll('.catalogue-control-panel .filter-btn-chip'));
      return {
        navFlexWrap: window.getComputedStyle(nav).flexWrap,
        navDisplay: window.getComputedStyle(nav).display,
        chips: chips.map(c => ({
          text: c.innerText.trim(),
          top: c.getBoundingClientRect().top,
          left: c.getBoundingClientRect().left,
          width: c.getBoundingClientRect().width,
          font: window.getComputedStyle(c).font,
          letterSpacing: window.getComputedStyle(c).letterSpacing
        }))
      };
    })()`
  });

  console.log(JSON.stringify(info.result.value, null, 2));
  chrome.kill();
  process.exit(0);
}
debugDark().catch(e => { console.error(e); process.exit(1); });
