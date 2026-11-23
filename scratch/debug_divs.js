const fs = require('fs');

function checkSection(secId) {
  const html = fs.readFileSync('home-1.html', 'utf8');
  const lines = html.split('\n');
  let inSec = false;
  let stack = [];
  let secStart = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes(`id="${secId}"`)) {
      inSec = true;
      secStart = i + 1;
      console.log(`Starting ${secId} at line ${secStart}`);
    }

    if (inSec) {
      // Find all <div> and </div>
      const tokens = line.match(/<\/?div\b[^>]*>/g) || [];
      for (const tok of tokens) {
        if (tok.startsWith('</')) {
          if (stack.length === 0) {
            console.log(`Extra closing div at line ${i + 1}: ${line.trim()}`);
          } else {
            stack.pop();
          }
        } else {
          stack.push({ line: i + 1, tok });
        }
      }

      if (line.includes('</section>')) {
        console.log(`Ending ${secId} at line ${i + 1}, remaining unclosed divs in stack: ${stack.length}`);
        if (stack.length > 0) {
          console.log('Unclosed divs:', stack.slice(-5));
        }
        inSec = false;
        break;
      }
    }
  }
}

checkSection('why-choose-us');
checkSection('materials-catalogue-hub');
