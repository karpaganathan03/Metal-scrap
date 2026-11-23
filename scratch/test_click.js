const http = require('http');
const { spawn } = require('child_process');

async function test() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
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

  const clickRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('#materialCategoryNav .filter-btn-chip')).find(b => b.getAttribute('data-category') === 'non-ferrous');
      if (btn) btn.click();
      return {
        clicked: !!btn,
        activeClass: btn ? btn.className : null,
        fSecDisplay: document.getElementById('ferrous-section') ? document.getElementById('ferrous-section').style.display : 'none',
        nfSecDisplay: document.getElementById('nonferrous-section') ? document.getElementById('nonferrous-section').style.display : 'none',
        allBtns: Array.from(document.querySelectorAll('#materialCategoryNav .filter-btn-chip')).map(b => ({
          cat: b.getAttribute('data-category'),
          cls: b.className
        }))
      };
    })()`,
    returnByValue: true
  });

  console.log(clickRes.result.value);
  chrome.kill();
  process.exit(0);
}
test();
