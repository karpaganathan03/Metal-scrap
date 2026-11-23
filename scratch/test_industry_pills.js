const http = require('http');
const { spawn } = require('child_process');

async function testAutoPills() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=1280,1000',
    'http://127.0.0.1:5500/home-2.html'
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

  const result = await send('Runtime.evaluate', {
    expression: `(() => {
      // Test different CSS options
      const style = document.createElement('style');
      style.textContent = \`
        .industry-box-card {
          padding: 24px 16px !important;
        }
        .industry-scrap-tags {
          display: flex !important;
          flex-wrap: nowrap !important;
          gap: 6px !important;
          margin-top: auto !important;
          align-items: center !important;
          width: 100% !important;
        }
        .industry-tag-pill {
          font-size: 9.5px !important;
          padding: 3px 6px !important;
          letter-spacing: 0.2px !important;
          white-space: nowrap !important;
          flex: 0 1 auto !important;
          text-align: center !important;
        }
      \`;
      document.head.appendChild(style);

      const cards = Array.from(document.querySelectorAll('#industries-section .industry-box-card'));
      return cards.map((c, i) => {
        const tagsContainer = c.querySelector('.industry-scrap-tags');
        const pills = Array.from(tagsContainer.querySelectorAll('.industry-tag-pill'));
        const totalW = pills.reduce((sum, p) => sum + p.offsetWidth, 0) + (pills.length - 1) * 6;
        return {
          card: i + 1,
          containerWidth: tagsContainer.clientWidth,
          tagsHeight: tagsContainer.offsetHeight,
          totalNeeded: totalW,
          pills: pills.map(p => ({
            text: p.innerText,
            width: p.offsetWidth,
            scrollWidth: p.scrollWidth,
            isOverflowing: p.scrollWidth > p.clientWidth
          }))
        };
      });
    })()`,
    returnByValue: true
  });

  console.log('Results with flex: 0 1 auto:', JSON.stringify(result.result ? result.result.value : result, null, 2));

  ws.close();
  chrome.kill();
}

testAutoPills().catch(console.error);
