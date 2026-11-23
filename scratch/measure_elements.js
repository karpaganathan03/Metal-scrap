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

  const result = await send('Runtime.evaluate', {
    expression: `(() => {
      const elements = [
        '#why-choose-us',
        '.catalogue-nav-strip',
        '#materialCategoryNav',
        '#catalogue-search-bar-section',
        '.rate-search-wrap',
        '#materialSearchInput',
        '#materialFilterStatus',
        '#ferrous-section',
        '.catalogue-category-header',
        '.material-card-item'
      ];
      return elements.map(sel => {
        const el = document.querySelector(sel);
        if (!el) return { sel, null: true };
        const r = el.getBoundingClientRect();
        const cs = window.getComputedStyle(el);
        return {
          sel,
          top: r.top + window.scrollY,
          bottom: r.bottom + window.scrollY,
          height: r.height,
          paddingTop: cs.paddingTop,
          paddingBottom: cs.paddingBottom,
          marginTop: cs.marginTop,
          marginBottom: cs.marginBottom
        };
      });
    })()`,
    returnByValue: true
  });

  console.log(JSON.stringify(result, null, 2));

  chrome.kill();
  process.exit(0);
}
test();
