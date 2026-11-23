const http = require('http');
const { spawn } = require('child_process');

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

  // Test 1: Click "Ferrous Scrap" button
  const res1 = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('.filter-btn-chip'));
      const ferrousBtn = btns.find(b => b.textContent.includes('Ferrous Scrap'));
      if (ferrousBtn) ferrousBtn.click();
      
      const sections = Array.from(document.querySelectorAll('[data-category-section]')).map(s => ({
        id: s.id,
        display: s.style.display,
        computedDisplay: window.getComputedStyle(s).display
      }));

      const cards = Array.from(document.querySelectorAll('.material-card-item')).map(c => ({
        cat: c.getAttribute('data-category'),
        display: c.style.display,
        computedDisplay: window.getComputedStyle(c).display
      }));

      return {
        ferrousBtnFound: !!ferrousBtn,
        ferrousBtnActive: ferrousBtn ? ferrousBtn.classList.contains('active') : false,
        sections,
        totalCards: cards.length,
        visibleCards: cards.filter(c => c.computedDisplay !== 'none').length
      };
    })()`,
    returnByValue: true
  });
  console.log('Test 1 (Click Ferrous):', JSON.stringify(res1, null, 2));

  // Test 2: Search for "Copper"
  const res2 = await send('Runtime.evaluate', {
    expression: `(() => {
      const allBtn = Array.from(document.querySelectorAll('.filter-btn-chip')).find(b => b.getAttribute('data-category') === 'all');
      if (allBtn) allBtn.click();
      const input = document.getElementById('materialSearchInput');
      input.value = 'Copper';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      const sections = Array.from(document.querySelectorAll('[data-category-section]')).map(s => ({
        id: s.id,
        display: s.style.display,
        computedDisplay: window.getComputedStyle(s).display
      }));

      const cards = Array.from(document.querySelectorAll('.material-card-item')).map(c => ({
        cat: c.getAttribute('data-category'),
        display: c.style.display,
        computedDisplay: window.getComputedStyle(c).display
      }));

      const statusText = document.getElementById('materialFilterCountText').innerText;

      return {
        sections,
        visibleCards: cards.filter(c => c.computedDisplay !== 'none').length,
        statusText
      };
    })()`,
    returnByValue: true
  });
  console.log('Test 2 (Search Copper):', JSON.stringify(res2, null, 2));

  // Test 3: Check console errors
  const errRes = await send('Runtime.evaluate', {
    expression: `window.__errors || []`,
    returnByValue: true
  });
  console.log('Errors:', errRes);

  chrome.kill();
  process.exit(0);
}
test();
