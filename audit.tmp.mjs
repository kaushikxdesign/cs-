import { chromium } from '@playwright/test';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });

await p.goto('http://localhost:5173/#/tickets', { waitUntil: 'networkidle' });
await p.waitForTimeout(600);

// 1. Tooltip
await p.locator('nav button[aria-label="Customers"]').hover();
await p.waitForTimeout(700);
const tip = p.locator('[role="tooltip"]');
const n = await tip.count();
if (n) {
  const c = await tip.first().evaluate(el => {
    const s = getComputedStyle(el);
    return { text: el.textContent, color: s.color, bg: s.backgroundColor, visible: s.visibility };
  });
  console.log('TOOLTIP:', JSON.stringify(c));
} else console.log('TOOLTIP: not rendered');

// 2. Every badge/pill string currently on screen
const badges = await p.evaluate(() =>
  [...document.querySelectorAll('span')]
    .filter(e => /rounded-sm/.test(e.className) && e.className.includes('border') && e.textContent.trim())
    .map(e => e.textContent.trim()).slice(0, 40)
);
console.log('BADGES:', [...new Set(badges)].join(' | '));
await b.close();
