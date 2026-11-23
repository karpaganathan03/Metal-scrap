const http = require('http');
const { spawn } = require('child_process');

async function checkIndustryTags() {
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
      const cards = Array.from(document.querySelectorAll('#industries-section .industry-box-card'));
      return cards.map((c, i) => {
        const tagsContainer = c.querySelector('.industry-scrap-tags');
        const pills = Array.from(tagsContainer.querySelectorAll('.industry-tag-pill'));
        const pillWidths = pills.map(p => ({
          text: p.innerText,
          width: p.offsetWidth,
          scrollWidth: p.scrollWidth,
          fontSize: window.getComputedStyle(p).fontSize,
          padding: window.getComputedStyle(p).padding
        }));
        const totalPillWidth = pillWidths.reduce((sum, p) => sum + p.width, 0);
        return {
          card: i + 1,
          cardWidth: c.clientWidth,
          containerWidth: tagsContainer.clientWidth,
          tagsHeight: tagsContainer.offsetHeight,
          pills: pillWidths,
          totalPillWidth,
          neededWithGaps: totalPillWidth + (pills.length - 1) * 6
        };
      });
    })()`,
    returnByValue: true
  });

  console.log('Industry cards tag info:', JSON.stringify(result.result ? result.result.value : result, null, 2));

  ws.close();
  chrome.kill();
}

checkIndustryTags().catch(console.error);
