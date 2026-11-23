const fs = require('fs');

const html = fs.readFileSync('home-1.html', 'utf8');

// Check opening and closing of tags in materials-catalogue-hub
const hubMatch = html.match(/<section[^>]*id="materials-catalogue-hub"[^>]*>([\s\S]*?)<\/section>/);
if (!hubMatch) {
  console.log('Error: materials-catalogue-hub not matched!');
} else {
  const content = hubMatch[1];
  const openDivs = (content.match(/<div(\s|>)/g) || []).length;
  const closeDivs = (content.match(/<\/div>/g) || []).length;
  console.log('Hub div balance:', { openDivs, closeDivs, balanced: openDivs === closeDivs });
}

// Check why-choose-us balance
const whyMatch = html.match(/<section[^>]*id="why-choose-us"[^>]*>([\s\S]*?)<\/section>/);
if (!whyMatch) {
  console.log('Error: why-choose-us not matched!');
} else {
  const content = whyMatch[1];
  const openDivs = (content.match(/<div(\s|>)/g) || []).length;
  const closeDivs = (content.match(/<\/div>/g) || []).length;
  console.log('Why div balance:', { openDivs, closeDivs, balanced: openDivs === closeDivs });
}
