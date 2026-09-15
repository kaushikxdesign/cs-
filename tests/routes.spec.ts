import { test, expect, type Page } from '@playwright/test';

/**
 * Every route the MVP declared must still resolve. The hand-rolled router
 * matches on equal segment count with first-declared-wins, so a wrong-route
 * regression renders a different screen rather than failing loudly — these
 * assertions are what make that visible.
 */
const ROUTES = [
  '/dashboard', '/work', '/customers', '/customers/acme', '/health', '/renewals',
  '/risks', '/expansion', '/profile', '/actions', '/drive', '/qbrs',
  '/goals/g1', '/manager', '/executive', '/admin', '/admin/connectors',
  '/portal-preview/acme',
];

// Recharts 2.12 still uses defaultProps on function components, which React
// 18.3 warns about. It is upstream noise, not an app fault.
const IGNORED = /defaultProps/;

async function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' && !IGNORED.test(m.text())) errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

for (const route of ROUTES) {
  test(`renders ${route}`, async ({ page }) => {
    const errors = await collectErrors(page);
    await page.goto(`/#${route}`, { waitUntil: 'networkidle' });

    await expect(page.locator('#cx42-error')).toBeHidden();
    const body = await page.locator('#root').innerText();
    expect(body.trim().length).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });
}

test('unknown route falls through to the 404 element', async ({ page }) => {
  await page.goto('/#/no-such-route', { waitUntil: 'networkidle' });
  await expect(page.locator('#root')).toContainText('Page not found');
});

test('portal preview bypasses the app shell', async ({ page }) => {
  await page.goto('/#/portal-preview/acme', { waitUntil: 'networkidle' });
  // The shell's primary nav must not render on this route.
  await expect(page.locator('#root')).not.toContainText('CX42 Drive');
});

test('/tickets resolves — it was declared nowhere in the MVP', async ({ page }) => {
  await page.goto('/#/tickets', { waitUntil: 'networkidle' });
  await expect(page.locator('#root')).not.toContainText('Page not found');
  // The list is keyed by account, not ticket id — the id lives in Details.
  await expect(page.locator('#root')).toContainText('Acme Analytics');
});

test('the role switcher changes user and lands on that role\'s dashboard', async ({ page }) => {
  await page.goto('/#/dashboard', { waitUntil: 'networkidle' });
  await page.locator('button[aria-label="Account menu"]').click();
  await page.getByRole('menuitem', { name: /Manager/ }).click();
  await expect(page).toHaveURL(/#\/manager/);
  await expect(page.locator('nav button[aria-label="Account menu"]')).toContainText('DO');
});

// Seven admin screens were wired into AdminPage but had no tile, so nothing
// could open them. Each must now be reachable from the settings subnav.
const PREVIOUSLY_UNREACHABLE = [
  ['reqfields', 'Required fields'],
  ['sla', 'SLA'],
  ['assignment', 'Assignment'],
  ['notify', 'Notifications'],
  ['automation', 'Automation'],
  ['actionsview', 'Actions overview'],
  ['drive', 'Drive'],
];

for (const [section, title] of PREVIOUSLY_UNREACHABLE) {
  test(`admin section "${title}" is reachable`, async ({ page }) => {
    await page.goto(`/#/admin?section=${section}`, { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText(title);
    await expect(page.locator('#cx42-error')).toBeHidden();
  });
}

test('tooltips render with a painted background, not dark on dark', async ({ page }) => {
  await page.goto('/#/tickets', { waitUntil: 'networkidle' });
  await page.locator('nav button[aria-label="Customers"]').hover();

  const tip = page.locator('[data-radix-popper-content-wrapper] > *').first();
  await expect(tip).toBeVisible();

  // Regression guard: tailwind-merge used to strip the colour classes,
  // leaving white-on-transparent — visible in the DOM but unreadable.
  const { color, bg } = await tip.evaluate((el) => {
    const s = getComputedStyle(el);
    return { color: s.color, bg: s.backgroundColor };
  });
  expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  expect(color).not.toBe(bg);
});

test('the primary action is legible, not black on black', async ({ page }) => {
  await page.goto('/#/tickets', { waitUntil: 'networkidle' });
  const close = page.getByRole('button', { name: 'Close' }).last();
  const { color, bg } = await close.evaluate((el) => {
    const s = getComputedStyle(el);
    return { color: s.color, bg: s.backgroundColor };
  });
  expect(color).not.toBe(bg);
});

test('status labels are Title Case, never raw enum values', async ({ page }) => {
  await page.goto('/#/tickets', { waitUntil: 'networkidle' });
  const details = page.locator('aside');
  await expect(details).toContainText(/Critical|High|Medium|Low/);
  await expect(details).not.toContainText(/\bcritical\b|\bmid_market\b/);
});

test('the theme switcher stamps the root and survives a reload', async ({ page }) => {
  await page.goto('/#/tickets', { waitUntil: 'networkidle' });
  await page.locator('button[aria-label="Toggle theme"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
