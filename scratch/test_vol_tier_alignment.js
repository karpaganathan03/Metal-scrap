const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function testVolumeTierAlignment() {
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

  // Inject tested CSS
  await send('Runtime.evaluate', {
    expression: `(() => {
      const style = document.createElement('style');
      style.textContent = \`
        .volume-tier-card {
          display: flex !important;
          flex-direction: column !important;
          height: 100% !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          transform: none !important;
          border-radius: var(--radius-md) !important;
          background: #131924 !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          padding: 26px 22px !important;
          box-sizing: border-box !important;
        }

        /* Card 2 Highlighter in Dark Mode */
        .volume-tier-card.border-warning,
        .volume-tier-card.featured-tier {
          border: 2px solid #F2CB22 !important;
          box-shadow: 0 8px 30px rgba(242, 203, 34, 0.12) !important;
        }

        /* Card 3 Green Accent */
        .volume-tier-card.border-success {
          border: 1px solid rgba(16, 185, 129, 0.3) !important;
        }

        /* Light Mode Card Container */
        [data-theme="light"] .volume-tier-card {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05) !important;
        }

        /* Light Mode Card 2 Highlighter */
        [data-theme="light"] .volume-tier-card.border-warning,
        [data-theme="light"] .volume-tier-card.featured-tier {
          border: 2px solid #F2CB22 !important;
          box-shadow: 0 8px 30px rgba(242, 203, 34, 0.18) !important;
        }

        /* Light Mode Card 3 */
        [data-theme="light"] .volume-tier-card.border-success {
          border: 1px solid rgba(16, 185, 129, 0.35) !important;
        }

        /* Badges at top */
        .volume-tier-card > .badge {
          width: fit-content !important;
          display: inline-flex !important;
          align-items: center !important;
          align-self: flex-start !important;
          padding: 5px 12px !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          letter-spacing: 0.5px !important;
          text-transform: uppercase !important;
          border-radius: 4px !important;
          margin-bottom: 16px !important;
          line-height: 1.2 !important;
        }

        .volume-tier-card .badge-secondary {
          background: rgba(255, 255, 255, 0.06) !important;
          color: #cbd5e1 !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
        }

        [data-theme="light"] .volume-tier-card .badge-secondary {
          background: #f1f5f9 !important;
          color: #334155 !important;
          border: 1px solid #cbd5e1 !important;
        }

        .volume-tier-card .badge-warning {
          background: #F2CB22 !important;
          color: #0e0e0c !important;
          border: 1px solid #F2CB22 !important;
        }

        [data-theme="light"] .volume-tier-card .badge-warning {
          background: #F2CB22 !important;
          color: #0e0e0c !important;
          border: 1px solid #d97706 !important;
        }

        .volume-tier-card .badge-success {
          background: rgba(16, 185, 129, 0.15) !important;
          color: #10b981 !important;
          border: 1px solid rgba(16, 185, 129, 0.3) !important;
        }

        [data-theme="light"] .volume-tier-card .badge-success {
          background: #ecfdf5 !important;
          color: #059669 !important;
          border: 1px solid #10b981 !important;
        }

        /* Headings */
        .volume-tier-card h4 {
          font-size: 20px !important;
          font-weight: 700 !important;
          color: #ffffff !important;
          margin-bottom: 12px !important;
          line-height: 1.3 !important;
        }

        [data-theme="light"] .volume-tier-card h4 {
          color: #0f172a !important;
        }

        /* Paragraphs */
        .volume-tier-card p {
          font-size: 13.5px !important;
          line-height: 1.65 !important;
          color: #94a3b8 !important;
          margin-bottom: 20px !important;
          flex: 1 1 auto !important;
        }

        [data-theme="light"] .volume-tier-card p {
          color: #475569 !important;
        }

        /* Bottom Rate Boxes */
        .volume-tier-card > div:last-child {
          width: 100% !important;
          margin-top: auto !important;
          padding: 14px 16px !important;
          border-radius: 8px !important;
          height: 96px !important;
          min-height: 96px !important;
          max-height: 96px !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          box-sizing: border-box !important;
        }

        /* Dark Mode Bottom Boxes */
        .volume-tier-card:nth-child(1) > div:last-child {
          background: rgba(255, 255, 255, 0.04) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .volume-tier-card.border-warning > div:last-child {
          background: rgba(242, 203, 34, 0.06) !important;
          border: 1px solid rgba(242, 203, 34, 0.4) !important;
        }

        .volume-tier-card.border-success > div:last-child {
          background: rgba(16, 185, 129, 0.06) !important;
          border: 1px solid rgba(16, 185, 129, 0.4) !important;
        }

        /* Light Mode Bottom Boxes */
        [data-theme="light"] .volume-tier-card > div:last-child {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
        }

        [data-theme="light"] .volume-tier-card.border-warning > div:last-child {
          background: #fffbeb !important;
          border: 1px solid #fcd34d !important;
        }

        [data-theme="light"] .volume-tier-card.border-success > div:last-child {
          background: #ecfdf5 !important;
          border: 1px solid #a7f3d0 !important;
        }

        /* Rate titles & subtitles in Light Mode */
        [data-theme="light"] .volume-tier-card strong.text-warning {
          color: #b45309 !important;
        }

        [data-theme="light"] .volume-tier-card strong.text-success {
          color: #047857 !important;
        }

        [data-theme="light"] .volume-tier-card small.text-muted {
          color: #64748b !important;
        }
      \`;
      document.head.appendChild(style);

      const el = document.querySelector('.volume-tier-card');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  // Measure Dark Mode
  const darkMetrics = await send('Runtime.evaluate', {
    expression: `(() => {
      const cards = Array.from(document.querySelectorAll('.volume-tier-card'));
      return cards.map((c, i) => {
        const r = c.getBoundingClientRect();
        const badge = c.querySelector('.badge');
        const h4 = c.querySelector('h4');
        const p = c.querySelector('p');
        const box = c.querySelector('div:last-child');
        return {
          card: i + 1,
          cardTop: r.top,
          cardBottom: r.bottom,
          cardHeight: r.height,
          badgeTop: badge ? badge.getBoundingClientRect().top : null,
          badgeHeight: badge ? badge.getBoundingClientRect().height : null,
          h4Top: h4 ? h4.getBoundingClientRect().top : null,
          boxTop: box ? box.getBoundingClientRect().top : null,
          boxBottom: box ? box.getBoundingClientRect().bottom : null,
          boxHeight: box ? box.getBoundingClientRect().height : null
        };
      });
    })()`,
    returnByValue: true
  });

  console.log('Tested Dark Mode Metrics:', JSON.stringify(darkMetrics.result.value, null, 2));

  // Capture Dark Mode
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/brain/3a52254b-accd-4ad0-aabc-87a314f8c64a/scratch/vol_tier_tested_dark.png', Buffer.from(shot.data, 'base64'));

  // Switch to Light Mode
  await send('Runtime.evaluate', {
    expression: `document.documentElement.setAttribute('data-theme', 'light');`
  });
  await new Promise(r => setTimeout(r, 400));

  const lightMetrics = await send('Runtime.evaluate', {
    expression: `(() => {
      const cards = Array.from(document.querySelectorAll('.volume-tier-card'));
      return cards.map((c, i) => {
        const r = c.getBoundingClientRect();
        const box = c.querySelector('div:last-child');
        return {
          card: i + 1,
          cardTop: r.top,
          cardBottom: r.bottom,
          cardHeight: r.height,
          boxTop: box ? box.getBoundingClientRect().top : null,
          boxBottom: box ? box.getBoundingClientRect().bottom : null
        };
      });
    })()`,
    returnByValue: true
  });

  console.log('Tested Light Mode Metrics:', JSON.stringify(lightMetrics.result.value, null, 2));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/brain/3a52254b-accd-4ad0-aabc-87a314f8c64a/scratch/vol_tier_tested_light.png', Buffer.from(shot.data, 'base64'));

  ws.close();
  chrome.kill();
  console.log('Test completed successfully');
}

testVolumeTierAlignment().catch(console.error);
