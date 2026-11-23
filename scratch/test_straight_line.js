const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://127.0.0.1:5500/home-2.html', { waitUntil: 'networkidle0' });

  // Evaluate current cards
  const info = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#testimonials-section .testimonial-card'));
    return cards.map((c, i) => {
      const rect = c.getBoundingClientRect();
      const p = c.querySelector('p');
      const authorDiv = c.querySelector('.testimonial-author');
      const strong = authorDiv ? authorDiv.querySelector('strong') : null;
      return {
        cardIndex: i + 1,
        cardTop: rect.top,
        cardBottom: rect.bottom,
        cardHeight: rect.height,
        authorTop: authorDiv ? authorDiv.getBoundingClientRect().top : null,
        authorHeight: authorDiv ? authorDiv.getBoundingClientRect().height : null,
        strongTop: strong ? strong.getBoundingClientRect().top : null,
        strongHeight: strong ? strong.getBoundingClientRect().height : null,
        strongText: strong ? strong.innerText : '',
        scrollWidth: strong ? strong.scrollWidth : null,
        clientWidth: strong ? strong.clientWidth : null
      };
    });
  });

  console.log('Current measurements at 1280px:', JSON.stringify(info, null, 2));

  await browser.close();
})();
