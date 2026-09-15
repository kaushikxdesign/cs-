import { chromium } from '@playwright/test';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message.slice(0,200)));
p.on('console', m => { if (m.type()==='error' && !/defaultProps/.test(m.text())) errs.push(m.text().slice(0,200)); });
for (const s of process.argv.slice(2)) {
  const [route, name] = s.split('=');
  errs.length = 0;
  await p.goto('http://localhost:5173/#' + route, { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  if (name) await p.screenshot({ path: `/tmp/shots/${name}.png` });
  console.log(route.padEnd(24), errs.length ? 'ERR: ' + errs[0] : 'ok');
}
await b.close();
