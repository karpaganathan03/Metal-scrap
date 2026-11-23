const http = require('http');
const { spawn } = require('child_process');

async function measure() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=1200,900',
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

  const evalRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const nav = document.getElementById("materialCategoryNav");
      const panel = document.getElementById("catalogueControlPanel");
      const container = nav.closest('.container');
      const buttons = Array.from(nav.querySelectorAll(".filter-btn-chip"));
      return {
        containerWidth: container.getBoundingClientRect().width,
        panelWidth: panel.getBoundingClientRect().width,
        navWidth: nav.getBoundingClientRect().width,
        buttons: buttons.map(b => {
          const r = b.getBoundingClientRect();
          const s = window.getComputedStyle(b);
          return {
            text: b.innerText.trim(),
            width: Math.round(r.width * 10) / 10,
            top: Math.round(r.top * 10) / 10,
            fontSize: s.fontSize,
            letterSpacing: s.letterSpacing,
            padding: s.padding,
            margin: s.margin
          };
        })
      };
    })()`
  });

  console.log(JSON.stringify(evalRes.result.value, null, 2));
  chrome.kill();
  process.exit(0);
}
measure().catch(err => { console.error(err); process.exit(1); });
