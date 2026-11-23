const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function test() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=1280,1050',
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
  await new Promise(r => setTimeout(r, 600));

  // Set theme to light via localStorage & attribute
  await send('Runtime.evaluate', {
    expression: `(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.setAttribute('data-theme', 'light');
      localStorage.setItem('ferromax_theme', 'light');
    })()`
  });
  await new Promise(r => setTimeout(r, 200));

  // Click non-ferrous
  const clickRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('#materialCategoryNav .filter-btn-chip'));
      const nfBtn = btns.find(b => b.getAttribute('data-category') === 'non-ferrous');
      if (nfBtn) {
        nfBtn.click();
      }
      return {
        btnsFound: btns.length,
        nfFound: !!nfBtn,
        activeBtn: document.querySelector('#materialCategoryNav .filter-btn-chip.active') ? document.querySelector('#materialCategoryNav .filter-btn-chip.active').getAttribute('data-category') : null,
        fDisplay: document.getElementById('ferrous-section').style.display,
        nfDisplay: document.getElementById('nonferrous-section').style.display,
        activeHeading: document.querySelector('#nonferrous-section h2') ? document.querySelector('#nonferrous-section h2').innerText : null
      };
    })()`,
    returnByValue: true
  });
  console.log('Click result:', clickRes.result.value);

  // Position control panel nicely
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.getElementById('catalogueControlPanel');
      const y = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: y, behavior: 'instant' });
    })()`
  });
  await new Promise(r => setTimeout(r, 400));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/true_nonferrous_light.png', Buffer.from(shot.data, 'base64'));

  chrome.kill();
  process.exit(0);
}
test();
