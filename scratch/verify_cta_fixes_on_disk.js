const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function verify() {
  console.log('Testing live home-1.html with updated industrial.css and home-1.html...');

  const viewports = [1440, 1200, 1024, 992];
  for (const vp of viewports) {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
      '--headless',
      '--remote-debugging-port=9222',
      '--disable-gpu',
      `--window-size=${vp},950`,
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

    // Test in Light Mode
    await send('Runtime.evaluate', {
      expression: `(() => {
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.setAttribute('data-theme', 'light');
        localStorage.setItem('ferromax_theme', 'light');
      })()`
    });
    await new Promise(r => setTimeout(r, 200));

    const check = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const chips = Array.from(document.querySelectorAll('#materialCategoryNav .filter-btn-chip'));
        const tops = chips.map(c => Math.round(c.getBoundingClientRect().top));
        const allOnSameLine = tops.every(t => t === tops[0]);
        return {
          viewport: ${vp},
          allOnSameLine,
          tops,
          buttons: chips.map(c => ({
            text: c.innerText.trim(),
            width: Math.round(c.getBoundingClientRect().width * 10) / 10,
            top: Math.round(c.getBoundingClientRect().top)
          }))
        };
      })()`
    });
    console.log(`\n--- Viewport ${vp}px ---`);
    console.log(JSON.stringify(check.result.value, null, 2));

    if (vp === 1200) {
      // Scroll to hub
      await send('Runtime.evaluate', {
        expression: `document.getElementById('materials-catalogue-hub').scrollIntoView({ behavior: 'instant', block: 'start' })`
      });
      await new Promise(r => setTimeout(r, 400));

      const ssLight = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('scratch/live_light_1200_fixed.png', Buffer.from(ssLight.data, 'base64'));

      // Switch to dark mode
      await send('Runtime.evaluate', {
        expression: `(() => {
          document.documentElement.setAttribute('data-theme', 'dark');
          document.body.setAttribute('data-theme', 'dark');
          localStorage.setItem('ferromax_theme', 'dark');
        })()`
      });
      await new Promise(r => setTimeout(r, 300));
      const ssDark = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('scratch/live_dark_1200_fixed.png', Buffer.from(ssDark.data, 'base64'));
    }

    chrome.kill();
    await new Promise(r => setTimeout(r, 600));
  }
  console.log('\nVerification complete! Screenshots saved to scratch/live_light_1200_fixed.png and scratch/live_dark_1200_fixed.png');
  process.exit(0);
}

verify().catch(e => { console.error(e); process.exit(1); });
