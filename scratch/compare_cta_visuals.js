const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function compareVisuals() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=1200,950',
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

  // Set theme to light
  await send('Runtime.evaluate', {
    expression: `(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.setAttribute('data-theme', 'light');
      localStorage.setItem('ferromax_theme', 'light');
    })()`
  });

  // Apply compact reduced layout CSS
  await send('Runtime.evaluate', {
    expression: `(() => {
      const style = document.createElement('style');
      style.id = 'compact-reduced-layout';
      style.textContent = \`
        /* Compact reduced layout */
        .catalogue-hub-section {
          padding: 48px 0 40px !important;
        }
        .catalogue-hub-header {
          margin-bottom: 20px !important;
        }
        .catalogue-hub-header .section-main-heading {
          font-size: 26px !important;
          margin-bottom: 6px !important;
        }
        .catalogue-hub-header .section-subtext {
          font-size: 13px !important;
          line-height: 1.5 !important;
          max-width: 680px !important;
        }
        .catalogue-control-panel {
          padding: 14px 18px 12px !important;
          margin-bottom: 24px !important;
          border-radius: 10px !important;
        }
        .catalogue-control-panel .catalogue-nav-strip-inner {
          margin-bottom: 12px !important;
          overflow-x: auto !important;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .catalogue-control-panel .catalogue-nav-strip-inner::-webkit-scrollbar {
          display: none !important;
        }
        .catalogue-control-panel .catalogue-nav-links {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-wrap: nowrap !important; /* CRITICAL: Never wrap to second line */
          gap: 6px !important;
          margin: 0 !important;
          padding: 2px 0 !important;
          width: 100% !important;
          min-width: max-content !important;
        }
        .catalogue-control-panel .filter-btn-chip {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 6px 11px !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          letter-spacing: 0.03em !important;
          text-transform: uppercase !important;
          white-space: nowrap !important;
          flex-shrink: 0 !important;
          border-radius: 6px !important;
          height: 34px !important;
          box-sizing: border-box !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }
        .rate-search-wrap {
          max-width: 720px !important;
          margin: 0 auto !important;
        }
        .rate-search-wrap input#materialSearchInput {
          height: 42px !important;
          line-height: 42px !important;
          font-size: 13px !important;
          padding: 0 38px 0 42px !important;
          border-radius: 6px !important;
        }
        .rate-search-wrap i.rate-search-icon {
          left: 14px !important;
          font-size: 13px !important;
        }
        .material-filter-status {
          margin-top: 6px !important;
        }
        .material-filter-status small {
          font-size: 12px !important;
        }
      \`;
      document.head.appendChild(style);
    })()`
  });

  await new Promise(r => setTimeout(r, 400));

  // Scroll to hub
  await send('Runtime.evaluate', {
    expression: `document.getElementById('materials-catalogue-hub').scrollIntoView({ behavior: 'instant', block: 'start' })`
  });
  await new Promise(r => setTimeout(r, 300));

  // Check CTA positions
  const check = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const chips = Array.from(document.querySelectorAll('.catalogue-control-panel .filter-btn-chip'));
      const tops = chips.map(c => Math.round(c.getBoundingClientRect().top));
      const widths = chips.map(c => Math.round(c.getBoundingClientRect().width));
      return {
        allOnSameLine: tops.every(t => t === tops[0]),
        tops,
        widths,
        total: widths.reduce((a,b)=>a+b, 0) + (chips.length - 1) * 6
      };
    })()`
  });
  console.log('Layout evaluation:', JSON.stringify(check.result.value, null, 2));

  // Take screenshot in light mode
  const ssLight = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/reduced_layout_light.png', Buffer.from(ssLight.data, 'base64'));

  // Switch to dark mode and take screenshot
  await send('Runtime.evaluate', {
    expression: `(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('ferromax_theme', 'dark');
    })()`
  });
  await new Promise(r => setTimeout(r, 300));
  const ssDark = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/reduced_layout_dark.png', Buffer.from(ssDark.data, 'base64'));

  console.log('Screenshots saved to scratch/reduced_layout_light.png and scratch/reduced_layout_dark.png');
  chrome.kill();
  process.exit(0);
}

compareVisuals().catch(e => { console.error(e); process.exit(1); });
