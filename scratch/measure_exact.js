const http = require('http');
const { spawn } = require('child_process');

async function measureExact() {
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

  const configs = [
    {
      name: 'Option A: Compact (11px, 5px 10px, 0.02em tracking, 5px gap)',
      css: `
        .catalogue-control-panel .catalogue-nav-links {
          flex-wrap: nowrap !important;
          justify-content: center !important;
          gap: 5px !important;
        }
        .catalogue-control-panel .filter-btn-chip {
          padding: 5px 9px !important;
          font-size: 11px !important;
          letter-spacing: 0.02em !important;
          height: 32px !important;
          box-sizing: border-box !important;
        }
      `
    },
    {
      name: 'Option B: Balanced (11.5px, 6px 10px, 0.02em tracking, 6px gap)',
      css: `
        .catalogue-control-panel .catalogue-nav-links {
          flex-wrap: nowrap !important;
          justify-content: center !important;
          gap: 6px !important;
        }
        .catalogue-control-panel .filter-btn-chip {
          padding: 6px 10px !important;
          font-size: 11.5px !important;
          letter-spacing: 0.02em !important;
          height: 34px !important;
          box-sizing: border-box !important;
        }
      `
    }
  ];

  for (const cfg of configs) {
    await send('Runtime.evaluate', {
      expression: `(() => {
        let el = document.getElementById('test-cfg');
        if (!el) {
          el = document.createElement('style');
          el.id = 'test-cfg';
          document.head.appendChild(el);
        }
        el.textContent = \`${cfg.css}\`;
      })()`
    });
    await new Promise(r => setTimeout(r, 100));

    const res = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const nav = document.getElementById("materialCategoryNav");
        const panel = document.getElementById("catalogueControlPanel");
        const buttons = Array.from(nav.querySelectorAll(".filter-btn-chip"));
        const tops = buttons.map(b => Math.round(b.getBoundingClientRect().top));
        const widths = buttons.map(b => Math.round(b.getBoundingClientRect().width * 10) / 10);
        const total = widths.reduce((a, b) => a + b, 0) + (buttons.length - 1) * 6;
        return {
          allOnSameLine: tops.every(t => t === tops[0]),
          tops,
          widths,
          totalWidth: Math.round(total * 10) / 10,
          panelInnerWidth: panel.clientWidth - 44
        };
      })()`
    });

    console.log(`\n=== ${cfg.name} ===`);
    console.log(JSON.stringify(res.result.value, null, 2));
  }

  chrome.kill();
  process.exit(0);
}
measureExact().catch(e => { console.error(e); process.exit(1); });
