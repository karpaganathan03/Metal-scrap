const http = require('http');
const { spawn } = require('child_process');

async function inspectContactCards() {
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
    })()`
  });
  await new Promise(r => setTimeout(r, 400));

  const info = await send('Runtime.evaluate', {
    expression: `(() => {
      const cards = Array.from(document.querySelectorAll('.contact-info-card'));
      return cards.map((c, i) => {
        const cardRect = c.getBoundingClientRect();
        const icon = c.querySelector('.contact-info-icon');
        const text = c.querySelector('.contact-info-text');
        const h5 = c.querySelector('h5');
        const p = c.querySelector('p');
        const footer = c.querySelector('small, .contact-social-links');
        const footerRect = footer ? footer.getBoundingClientRect() : null;
        const links = Array.from(c.querySelectorAll('a')).map(a => ({
          text: a.innerText,
          offsetWidth: a.offsetWidth,
          scrollWidth: a.scrollWidth,
          isOverflowing: a.scrollWidth > a.clientWidth
        }));

        return {
          card: i + 1,
          cardRect: { top: cardRect.top, height: cardRect.height, bottom: cardRect.bottom, width: cardRect.width },
          iconBottom: icon ? icon.getBoundingClientRect().bottom : null,
          h5Bottom: h5 ? h5.getBoundingClientRect().bottom : null,
          pHeight: p ? p.getBoundingClientRect().height : null,
          footerTop: footerRect ? footerRect.top : null,
          footerHeight: footerRect ? footerRect.height : null,
          footerBottom: footerRect ? footerRect.bottom : null,
          distanceFromCardBottom: footerRect ? cardRect.bottom - footerRect.bottom : null,
          links
        };
      });
    })()`,
    returnByValue: true
  });

  console.log('Contact Cards Inspection:', JSON.stringify(info.result.value, null, 2));

  ws.close();
  chrome.kill();
}

inspectContactCards().catch(console.error);
