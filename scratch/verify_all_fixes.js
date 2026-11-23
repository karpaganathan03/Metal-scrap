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

  // 1. Inspect Why Choose Us Geometry
  const whyEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const whySec = document.getElementById('why-choose-us');
      const assuranceBar = document.querySelector('.why-assurance-bar');
      const workflowWrap = document.querySelector('.why-workflow-wrap');
      const ctaBanner = document.querySelector('.why-audit-cta-banner');
      const cards = document.querySelectorAll('.why-feature-card');

      return {
        whySecHeight: whySec ? whySec.offsetHeight : 0,
        featureCardsCount: cards.length,
        hasAssuranceBar: !!assuranceBar,
        hasWorkflowWrap: !!workflowWrap,
        hasCtaBanner: !!ctaBanner
      };
    })()`,
    returnByValue: true
  });
  console.log('Why Choose Us Check:', whyEval.result.value);

  // 2. Inspect Filter Input Geometry
  const inputEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const input = document.getElementById('materialSearchInput');
      const icon = document.querySelector('.rate-search-wrap i');
      const clearBtn = document.getElementById('searchClearBtn');
      const panel = document.getElementById('catalogueControlPanel');
      const firstCard = document.querySelector('.material-card-item');

      const csInput = window.getComputedStyle(input);
      const csIcon = window.getComputedStyle(icon);
      const inputRect = input.getBoundingClientRect();
      const iconRect = icon.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const cardRect = firstCard.getBoundingClientRect();

      return {
        inputPaddingLeft: csInput.paddingLeft,
        inputHeight: csInput.height,
        iconLeft: csIcon.left,
        iconTop: csIcon.top,
        iconX: iconRect.x,
        textStartX: inputRect.x + parseFloat(csInput.paddingLeft),
        overlap: iconRect.right > (inputRect.x + parseFloat(csInput.paddingLeft)),
        gapFromPanelToFirstCard: cardRect.top - panelRect.bottom
      };
    })()`,
    returnByValue: true
  });
  console.log('Filter Input & Gap Check:', inputEval.result.value);

  // 3. Test CTAs Clicking
  const ctaClickEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('#materialCategoryNav .filter-btn-chip'));
      const ferrousBtn = btns.find(b => b.getAttribute('data-category') === 'ferrous');
      const nonFerrousBtn = btns.find(b => b.getAttribute('data-category') === 'non-ferrous');

      // Click Non-Ferrous
      nonFerrousBtn.click();
      const nfCards = Array.from(document.querySelectorAll('.material-card-item')).filter(c => c.style.display !== 'none');
      const fSec = document.getElementById('ferrous-section');
      const nfSec = document.getElementById('nonferrous-section');

      const afterNonFerrous = {
        visibleCards: nfCards.length,
        ferrousDisplay: fSec.style.display,
        nonFerrousDisplay: nfSec.style.display
      };

      // Click All Categories
      const allBtn = btns.find(b => b.getAttribute('data-category') === 'all');
      allBtn.click();
      const allCards = Array.from(document.querySelectorAll('.material-card-item')).filter(c => c.style.display !== 'none');

      return {
        afterNonFerrous,
        afterAllCount: allCards.length
      };
    })()`,
    returnByValue: true
  });
  console.log('CTA Click Check:', ctaClickEval.result.value);

  // 4. Test Search Filtering
  const searchEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const input = document.getElementById('materialSearchInput');
      input.value = 'HMS';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      const visibleCards = Array.from(document.querySelectorAll('.material-card-item')).filter(c => c.style.display !== 'none');
      const statusText = document.getElementById('materialFilterCountText').innerText;
      const clearBtnDisplay = window.getComputedStyle(document.getElementById('searchClearBtn')).display;

      // Clear search
      const clearBtn = document.getElementById('searchClearBtn');
      clearBtn.click();
      const resetCards = Array.from(document.querySelectorAll('.material-card-item')).filter(c => c.style.display !== 'none');

      return {
        searchHmsMatches: visibleCards.length,
        statusText,
        clearBtnDisplay,
        afterClearCount: resetCards.length
      };
    })()`,
    returnByValue: true
  });
  console.log('Search Filtering Check:', searchEval.result.value);

  // 5. Screenshots (Light mode & Dark mode)
  // Set to Light Mode as in the user's screenshot
  await send('Runtime.evaluate', {
    expression: `document.documentElement.setAttribute('data-theme', 'light');`
  });
  await new Promise(r => setTimeout(r, 400));

  // Screenshot 1: Why Choose Us (extended content filling the space)
  await send('Runtime.evaluate', {
    expression: `document.getElementById('why-choose-us').scrollIntoView({ behavior: 'instant', block: 'start' });`
  });
  await new Promise(r => setTimeout(r, 400));
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/verified_why_choose_us_light.png', Buffer.from(shot1.data, 'base64'));

  // Screenshot 2: Catalogue Hub in Light Mode (showing CTAs, filter box, and immediate cards)
  await send('Runtime.evaluate', {
    expression: `document.getElementById('catalogueControlPanel').scrollIntoView({ behavior: 'instant', block: 'start' });`
  });
  await new Promise(r => setTimeout(r, 400));
  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/verified_catalogue_hub_light.png', Buffer.from(shot2.data, 'base64'));

  // Screenshot 3: After clicking Non-Ferrous CTA in Light Mode
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('#materialCategoryNav .filter-btn-chip')).find(b => b.getAttribute('data-category') === 'non-ferrous');
      btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 400));
  const shot3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/verified_nonferrous_cta_light.png', Buffer.from(shot3.data, 'base64'));

  // Reset to dark mode
  await send('Runtime.evaluate', {
    expression: `document.documentElement.removeAttribute('data-theme');`
  });
  await new Promise(r => setTimeout(r, 400));

  // Screenshot 4: Dark mode Catalogue Hub
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('#materialCategoryNav .filter-btn-chip')).find(b => b.getAttribute('data-category') === 'all');
      btn.click();
      document.getElementById('catalogueControlPanel').scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`
  });
  await new Promise(r => setTimeout(r, 400));
  const shot4 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/verified_catalogue_hub_dark.png', Buffer.from(shot4.data, 'base64'));

  chrome.kill();
  process.exit(0);
}
test();
