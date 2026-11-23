const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function testWithCSS() {
  const widths = [1440, 1280, 1100, 992];

  for (const w of widths) {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
      '--headless',
      '--remote-debugging-port=9222',
      '--disable-gpu',
      `--window-size=${w},900`,
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

    await send('Runtime.evaluate', {
      expression: `(() => {
        document.documentElement.setAttribute('data-theme', 'light');
        const sec = document.getElementById('testimonials-section');
        sec.scrollIntoView({ behavior: 'instant', block: 'center' });
        sec.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-revealed'));

        // Inject the CSS
        const style = document.createElement('style');
        style.textContent = \`
          .testimonial-card .testimonial-author {
            height: 38px !important;
            min-height: 38px !important;
            max-height: 38px !important;
            padding-top: 12px !important;
            display: flex !important;
            align-items: center !important;
            box-sizing: border-box !important;
          }
          .testimonial-card .testimonial-author strong,
          .testimonial-author-text {
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        \`;
        document.head.appendChild(style);

        // Cut " Corp"
        const card2Strong = document.querySelectorAll('#testimonials-section .testimonial-card')[1].querySelector('strong');
        card2Strong.innerText = '— Senior Project Director, Marine Dismantling';
      })()`
    });
    await new Promise(r => setTimeout(r, 400));

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
            authorTop: authorRect ? authorRect.top : null,
            authorHeight: authorRect ? authorRect.height : null,
            strongText: strong ? strong.innerText : '',
            strongScrollWidth: strong ? strong.scrollWidth : null,
            authorWidth: author ? author.clientWidth : null
          };
        });
      })()`,
      returnByValue: true
    });

    console.log(`Viewport ${w}px:`, JSON.stringify(result.result ? result.result.value : result, null, 2));

    ws.close();
    chrome.kill();
    await new Promise(r => setTimeout(r, 800));
  }
}

testWithCSS().catch(console.error);
