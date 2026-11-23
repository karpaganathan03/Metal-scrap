const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function verifyIndustryStraightLine() {
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

  // Light Mode Setup & Reveal
  await send('Runtime.evaluate', {
    expression: `(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      const sec = document.getElementById('industries-section');
      sec.scrollIntoView({ behavior: 'instant', block: 'center' });
      sec.querySelectorAll('.reveal-on-scroll').forEach(el => {
        el.classList.add('is-revealed');
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.visibility = 'visible';
      });
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  const measurements = await send('Runtime.evaluate', {
    expression: `(() => {
      const cards = Array.from(document.querySelectorAll('#industries-section .industry-box-card'));
      return cards.map((c, i) => {
        const cardRect = c.getBoundingClientRect();
        const tags = c.querySelector('.industry-scrap-tags');
        const tagsRect = tags ? tags.getBoundingClientRect() : null;
        const pills = Array.from(tags.querySelectorAll('.industry-tag-pill'));
        return {
          card: i + 1,
          cardHeight: cardRect.height,
          cardBottom: cardRect.bottom,
          tagsTop: tagsRect ? tagsRect.top : null,
          tagsHeight: tagsRect ? tagsRect.height : null,
          tagsBottom: tagsRect ? tagsRect.bottom : null,
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

  console.log('Measurements in Light Mode:', JSON.stringify(measurements.result.value, null, 2));

  // Capture light mode screenshot of industries section
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/brain/3a52254b-accd-4ad0-aabc-87a314f8c64a/scratch/industries_light.png', Buffer.from(shot.data, 'base64'));

  // Switch to dark mode
  await send('Runtime.evaluate', {
    expression: `document.documentElement.removeAttribute('data-theme');`
  });
  await new Promise(r => setTimeout(r, 400));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/brain/3a52254b-accd-4ad0-aabc-87a314f8c64a/scratch/industries_dark.png', Buffer.from(shot.data, 'base64'));

  ws.close();
  chrome.kill();
  console.log('Finished successfully');
}

verifyIndustryStraightLine().catch(console.error);
