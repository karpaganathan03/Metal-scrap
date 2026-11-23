const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function testLayout() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=1200,900',
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

  // Test with light mode
  await send('Runtime.evaluate', {
    expression: `(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.setAttribute('data-theme', 'light');
      localStorage.setItem('ferromax_theme', 'light');
    })()`
  });

  // Inject optimized CSS
  await send('Runtime.evaluate', {
    expression: `(() => {
      const style = document.createElement('style');
      style.id = 'test-cta-optimization';
      style.textContent = \`
        .catalogue-control-panel {
          padding: 14px 18px 14px !important;
          margin-bottom: 22px !important;
          border-radius: 10px !important;
        }
        .catalogue-control-panel .catalogue-nav-links {
          flex-wrap: nowrap !important;
          justify-content: center !important;
          gap: 6px !important;
          overflow-x: auto !important;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
          padding: 2px 0 6px !important;
        }
        .catalogue-control-panel .catalogue-nav-links::-webkit-scrollbar {
          display: none !important;
        }
        .catalogue-control-panel .filter-btn-chip {
          padding: 6px 11px !important;
          font-size: 11.5px !important;
          letter-spacing: 0.03em !important;
          white-space: nowrap !important;
          flex-shrink: 0 !important;
          border-radius: 5px !important;
          line-height: 1.2 !important;
        }
        .catalogue-control-panel .catalogue-nav-strip-inner {
          margin-bottom: 12px !important;
        }
        .rate-search-wrap input#materialSearchInput {
          height: 42px !important;
          line-height: 42px !important;
          font-size: 13px !important;
        }
        .catalogue-hub-header {
          margin-bottom: 18px !important;
        }
        .catalogue-hub-header .section-main-heading {
          font-size: 26px !important;
          margin-bottom: 6px !important;
        }
        .catalogue-hub-header .section-subtext {
          font-size: 13px !important;
          line-height: 1.5 !important;
        }
      \`;
      document.head.appendChild(style);
    })()`
  });

  await new Promise(r => setTimeout(r, 300));

  // Measure elements
  const measureRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const nav = document.getElementById("materialCategoryNav");
      const buttons = Array.from(nav.querySelectorAll(".filter-btn-chip"));
      const tops = buttons.map(b => Math.round(b.getBoundingClientRect().top));
      const allOnSameLine = tops.every(t => t === tops[0]);
      return {
        allOnSameLine,
        tops,
        widths: buttons.map(b => ({
          text: b.innerText.trim(),
          width: Math.round(b.getBoundingClientRect().width * 10) / 10
        })),
        totalWidth: Math.round(buttons.reduce((sum, b) => sum + b.getBoundingClientRect().width, 0) + (buttons.length - 1) * 6)
      };
    })()`
  });
  console.log('Measurement result:', JSON.stringify(measureRes.result.value, null, 2));

  // Scroll to control panel
  await send('Runtime.evaluate', {
    expression: `document.getElementById('materials-catalogue-hub').scrollIntoView({ behavior: 'instant' })`
  });
  await new Promise(r => setTimeout(r, 400));

  // Take screenshot
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/cta_single_line_reduced.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Saved screenshot to scratch/cta_single_line_reduced.png');

  chrome.kill();
  process.exit(0);
}
testLayout().catch(e => { console.error(e); process.exit(1); });
