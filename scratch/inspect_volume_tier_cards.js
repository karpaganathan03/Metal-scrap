const http = require('http');
const { spawn } = require('child_process');

async function inspectVolumeTierCards() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=1280,1000',
    'http://127.0.0.1:5500/rate-card.html'
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

  const darkInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const cards = Array.from(document.querySelectorAll('.volume-tier-card'));
      return cards.map((c, i) => {
        const rect = c.getBoundingClientRect();
        const badge = c.querySelector('.badge');
        const h4 = c.querySelector('h4');
        const p = c.querySelector('p');
        const bottomBox = c.querySelector('div:last-child');
        const computed = window.getComputedStyle(c);
        return {
          card: i + 1,
          rect: { top: rect.top, bottom: rect.bottom, height: rect.height, width: rect.width },
          marginTop: computed.marginTop,
          marginBottom: computed.marginBottom,
          padding: computed.padding,
          border: computed.border,
          borderColor: computed.borderColor,
          badgeRect: badge ? badge.getBoundingClientRect() : null,
          badgeWidth: badge ? badge.offsetWidth : null,
          badgeDisplay: badge ? window.getComputedStyle(badge).display : null,
          h4Rect: h4 ? h4.getBoundingClientRect() : null,
          pRect: p ? p.getBoundingClientRect() : null,
          bottomBoxRect: bottomBox ? bottomBox.getBoundingClientRect() : null,
          bottomBoxBg: bottomBox ? window.getComputedStyle(bottomBox).backgroundColor : null,
          bottomBoxBorder: bottomBox ? window.getComputedStyle(bottomBox).border : null
        };
      });
    })()`,
    returnByValue: true
  });

  console.log('Dark mode info:', JSON.stringify(darkInfo.result.value, null, 2));

  // Now light mode
  await send('Runtime.evaluate', {
    expression: `document.documentElement.setAttribute('data-theme', 'light');`
  });
  await new Promise(r => setTimeout(r, 400));

  const lightInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const cards = Array.from(document.querySelectorAll('.volume-tier-card'));
      return cards.map((c, i) => {
        const rect = c.getBoundingClientRect();
        const bottomBox = c.querySelector('div:last-child');
        const badge = c.querySelector('.badge');
        const computed = window.getComputedStyle(c);
        return {
          card: i + 1,
          rect: { top: rect.top, bottom: rect.bottom, height: rect.height },
          borderColor: computed.borderColor,
          background: computed.backgroundColor,
          badgeBg: badge ? window.getComputedStyle(badge).backgroundColor : null,
          badgeColor: badge ? window.getComputedStyle(badge).color : null,
          badgeBorder: badge ? window.getComputedStyle(badge).border : null,
          bottomBoxBg: bottomBox ? window.getComputedStyle(bottomBox).backgroundColor : null,
          bottomBoxBorder: bottomBox ? window.getComputedStyle(bottomBox).border : null,
          bottomBoxColor: bottomBox ? window.getComputedStyle(bottomBox).color : null
        };
      });
    })()`,
    returnByValue: true
  });

  console.log('Light mode info:', JSON.stringify(lightInfo.result.value, null, 2));

  ws.close();
  chrome.kill();
}

inspectVolumeTierCards().catch(console.error);
