const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function captureContactCards() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=1280,1000',
    'http://127.0.0.1:5500/contact.html'
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
      const cards = document.querySelectorAll('.contact-info-card');
      if (cards.length > 0) {
        cards[0].scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  const info = await send('Runtime.evaluate', {
    expression: `(() => {
      const cards = Array.from(document.querySelectorAll('.contact-info-card'));
      return cards.map((c, i) => {
        const cardRect = c.getBoundingClientRect();
        const footer = c.querySelector('.contact-info-footer');
        const footerRect = footer ? footer.getBoundingClientRect() : null;
        return {
          card: i + 1,
          cardBottom: cardRect.bottom,
          footerTop: footerRect ? footerRect.top : null,
          footerHeight: footerRect ? footerRect.height : null,
          footerBottom: footerRect ? footerRect.bottom : null
        };
      });
    })()`,
    returnByValue: true
  });

  console.log('Footer Metrics in Light Mode:', JSON.stringify(info.result.value, null, 2));

  // Capture light mode screenshot of the 4 cards area
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/brain/3a52254b-accd-4ad0-aabc-87a314f8c64a/scratch/contact_cards_light.png', Buffer.from(shot.data, 'base64'));

  // Switch to dark mode
  await send('Runtime.evaluate', {
    expression: `document.documentElement.removeAttribute('data-theme');`
  });
  await new Promise(r => setTimeout(r, 400));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/brain/3a52254b-accd-4ad0-aabc-87a314f8c64a/scratch/contact_cards_dark.png', Buffer.from(shot.data, 'base64'));

  ws.close();
  chrome.kill();
  console.log('Capture finished successfully');
}

captureContactCards().catch(console.error);
