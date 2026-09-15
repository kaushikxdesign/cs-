import { chromium } from '@playwright/test';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on('pageerror', e => errs.push(e.message.slice(0,140)));
for (const s of process.argv.slice(2)) {
  const i = s.lastIndexOf('#'); const route = s.slice(0,i), name = s.slice(i+1);
  errs.length = 0;
  await p.goto('http://localhost:5173/#' + route, { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);
  if (name) await p.screenshot({ path: `/tmp/shots/${name}.png` });
  console.log(route.padEnd(22), errs.length ? 'ERR ' + errs[0] : 'ok');
}
await b.close();
