const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function test() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=1280,1000',
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
  await new Promise(r => setTimeout(r, 500));

  const result = await send('Runtime.evaluate', {
    expression: `(() => {
      const why = document.getElementById('why-choose-us');
      const navStrip = document.querySelector('.catalogue-nav-strip');
      const searchSec = document.getElementById('catalogue-search-bar-section');
      const searchWrap = document.querySelector('.rate-search-wrap');
      const searchInput = document.getElementById('materialSearchInput');
      const searchIcon = searchWrap ? searchWrap.querySelector('i') : null;
      const secFerrous = document.getElementById('ferrous-section');
      const firstCard = document.querySelector('.material-card-item');

      return {
        whyRect: why ? why.getBoundingClientRect() : null,
        whyComputed: why ? { padding: getComputedStyle(why).padding, margin: getComputedStyle(why).margin, height: getComputedStyle(why).height } : null,
        navStripRect: navStrip ? navStrip.getBoundingClientRect() : null,
        navStripComputed: navStrip ? { padding: getComputedStyle(navStrip).padding, margin: getComputedStyle(navStrip).margin } : null,
        searchSecRect: searchSec ? searchSec.getBoundingClientRect() : null,
        searchSecComputed: searchSec ? { padding: getComputedStyle(searchSec).padding, margin: getComputedStyle(searchSec).margin } : null,
        searchWrapRect: searchWrap ? searchWrap.getBoundingClientRect() : null,
        searchWrapComputed: searchWrap ? { padding: getComputedStyle(searchWrap).padding, margin: getComputedStyle(searchWrap).margin, position: getComputedStyle(searchWrap).position } : null,
        searchInputRect: searchInput ? searchInput.getBoundingClientRect() : null,
        searchInputComputed: searchInput ? { padding: getComputedStyle(searchInput).padding, margin: getComputedStyle(searchInput).margin, textIndent: getComputedStyle(searchInput).textIndent } : null,
        searchIconRect: searchIcon ? searchIcon.getBoundingClientRect() : null,
        searchIconComputed: searchIcon ? { position: getComputedStyle(searchIcon).position, left: getComputedStyle(searchIcon).left, top: getComputedStyle(searchIcon).top, width: getComputedStyle(searchIcon).width } : null,
        secFerrousRect: secFerrous ? secFerrous.getBoundingClientRect() : null,
        secFerrousComputed: secFerrous ? { padding: getComputedStyle(secFerrous).padding, margin: getComputedStyle(secFerrous).margin, display: getComputedStyle(secFerrous).display } : null,
        firstCardRect: firstCard ? firstCard.getBoundingClientRect() : null
      };
    })()`,
    returnByValue: true
  });

  console.log(JSON.stringify(result, null, 2));

  // Let's also take a screenshot of why-choose-us and search section
  await send('Runtime.evaluate', {
    expression: `document.getElementById('why-choose-us').scrollIntoView({ behavior: 'instant', block: 'start' });`
  });
  await new Promise(r => setTimeout(r, 400));
  let shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/home1_why.png', Buffer.from(shot1.data, 'base64'));

  await send('Runtime.evaluate', {
    expression: `document.querySelector('.catalogue-nav-strip').scrollIntoView({ behavior: 'instant', block: 'start' });`
  });
  await new Promise(r => setTimeout(r, 400));
  let shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/home1_catalogue.png', Buffer.from(shot2.data, 'base64'));

  chrome.kill();
  process.exit(0);
}
test();
