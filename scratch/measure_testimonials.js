const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function measureTestimonials() {
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
  await new Promise(r => setTimeout(r, 1000));

  // Switch to light mode and scroll and test cut text
  await send('Runtime.evaluate', {
    expression: `(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      const sec = document.getElementById('testimonials-section');
      sec.scrollIntoView({ behavior: 'instant', block: 'center' });
      sec.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-revealed'));

      // Test cutting " Corp"
      const card2Strong = document.querySelectorAll('#testimonials-section .testimonial-card')[1].querySelector('strong');
      card2Strong.innerText = '— Senior Project Director, Marine Dismantling';
    })()`
  });
  await new Promise(r => setTimeout(r, 500));

  const result = await send('Runtime.evaluate', {
    expression: `(() => {
      const cards = Array.from(document.querySelectorAll('#testimonials-section .testimonial-card'));
      return cards.map((c, i) => {
        const author = c.querySelector('.testimonial-author');
        const strong = author ? author.querySelector('strong') : null;
        const authorRect = author ? author.getBoundingClientRect() : null;
        const cardRect = c.getBoundingClientRect();
        return {
          card: i + 1,
          cardHeight: cardRect.height,
          cardBottom: cardRect.bottom,
          authorTop: authorRect ? authorRect.top : null,
          authorHeight: authorRect ? authorRect.height : null,
          authorBottom: authorRect ? authorRect.bottom : null,
          strongWidth: strong ? strong.offsetWidth : null,
          strongScrollWidth: strong ? strong.scrollWidth : null,
          strongText: strong ? strong.innerText : ''
        };
      });
    })()`,
    returnByValue: true
  });

  console.log('Current status:', JSON.stringify(result.result ? result.result.value : result, null, 2));

  ws.close();
  chrome.kill();
}

measureTestimonials().catch(console.error);
