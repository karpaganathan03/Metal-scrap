const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function capture() {
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

  // 1. Light Mode - Why Choose Us Extended (No wasted space)
  await send('Runtime.evaluate', {
    expression: "document.documentElement.setAttribute('data-theme', 'light');"
  });
  await new Promise(r => setTimeout(r, 300));

  await send('Runtime.evaluate', {
    expression: "document.getElementById('why-choose-us').scrollIntoView({ behavior: 'instant', block: 'center' });"
  });
  await new Promise(r => setTimeout(r, 400));
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/1_why_choose_us_extended_light.png', Buffer.from(shot.data, 'base64'));

  // 2. Light Mode - Catalogue Hub (All Categories)
  // Align smoothly below fixed navbar
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.getElementById('catalogueControlPanel');
      const y = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: y, behavior: 'instant' });
    })()`
  });
  await new Promise(r => setTimeout(r, 400));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/2_catalogue_hub_all_light.png', Buffer.from(shot.data, 'base64'));

  // 3. Light Mode - Click Ferrous Scrap CTA
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('#materialCategoryNav .filter-btn-chip')).find(b => b.getAttribute('data-category') === 'ferrous');
      btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 500));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/3_catalogue_ferrous_cta_light.png', Buffer.from(shot.data, 'base64'));

  // 4. Light Mode - Click Non-Ferrous Scrap CTA
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('#materialCategoryNav .filter-btn-chip')).find(b => b.getAttribute('data-category') === 'non-ferrous');
      btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 500));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/4_catalogue_nonferrous_cta_light.png', Buffer.from(shot.data, 'base64'));

  // 5. Light Mode - Search Filter dynamically
  await send('Runtime.evaluate', {
    expression: `(() => {
      const allBtn = Array.from(document.querySelectorAll('#materialCategoryNav .filter-btn-chip')).find(b => b.getAttribute('data-category') === 'all');
      allBtn.click();
      const input = document.getElementById('materialSearchInput');
      input.value = 'Copper';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()`
  });
  await new Promise(r => setTimeout(r, 500));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/5_catalogue_search_copper_light.png', Buffer.from(shot.data, 'base64'));

  console.log('All 5 clean screenshots captured successfully!');
  chrome.kill();
  process.exit(0);
}
capture();
