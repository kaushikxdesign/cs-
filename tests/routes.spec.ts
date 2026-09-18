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

    await expect(page.locator('#sia-error')).toBeHidden();
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
  await expect(page.locator('#root')).not.toContainText('Sia Drive');
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
  await expect(page.locator('header button[aria-label="Account menu"]')).toContainText('DO');
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
    await expect(page.locator('#sia-error')).toBeHidden();
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

/**
 * No emoji may reach the rendered interface. The MVP used 220+ glyphs as
 * icons and the seed data still carries them on action steps and admin
 * entities, so this asserts against the DOM rather than the source — the
 * only place that actually proves it.
 */
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2190}-\u{21FF}\u{2460}-\u{27BF}\u{2B00}-\u{2BFF}\u{25A0}-\u{25FF}\u{FE0F}]/u;

const EMOJI_ROUTES = [
  '/dashboard', '/work', '/tickets', '/customers', '/customers/acme',
  '/goals/g1', '/risks', '/expansion', '/renewals', '/health',
  '/manager', '/executive', '/actions', '/drive', '/profile',
  '/admin', '/admin/connectors',
];

for (const route of EMOJI_ROUTES) {
  test(`no emoji on ${route}`, async ({ page }) => {
    await page.goto(`/#${route}`, { waitUntil: 'networkidle' });
    const text = await page.locator('#root').innerText();
    const found = [...text].filter((ch) => EMOJI.test(ch));
    expect(found, `emoji rendered: ${[...new Set(found)].join(' ')}`).toEqual([]);
  });
}

test('the assistant is reachable from the top bar on every module', async ({ page }) => {
  const ask = page.getByRole('button', { name: 'Ask Sia' });
  for (const route of ['/dashboard', '/customers', '/tickets']) {
    await page.goto(`/#${route}`, { waitUntil: 'networkidle' });
    await expect(ask).toBeVisible();
  }
  await ask.click();
  await expect(ask).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'Ask Sia' })).toBeVisible();
});

test('the top bar carries search and notifications on every route', async ({ page }) => {
  for (const route of ['/dashboard', '/work', '/admin?section=users']) {
    await page.goto(`/#${route}`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
    await expect(page.locator('button[aria-label="Notifications"]')).toBeVisible();
  }
  // The field is the palette given a resting shape, so it must open it.
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByPlaceholder(/search/i).last()).toBeVisible();
});

test('the breadcrumb names the module, and the page header does not repeat it', async ({ page }) => {
  await page.goto('/#/customers', { waitUntil: 'networkidle' });
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Customers');
  await expect(page.getByRole('heading', { name: 'All accounts' })).toBeVisible();
});

// The copilot reads the application's own state, so these assert that what
// it prints agrees with the page behind it rather than merely appearing.
test('Ask Sia opens on the account it was opened from', async ({ page }) => {
  await page.goto('/#/customers/acme', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Ask Sia' }).click();
  const panel = page.locator('aside').last();
  await expect(panel.getByRole('heading', { name: 'Acme Analytics' })).toBeVisible();
  await expect(panel.getByText('Next best actions')).toBeVisible();
  // The health figure in the summary must match the one on the page.
  const score = await page.locator('main').getByText('30', { exact: true }).first().isVisible();
  expect(score).toBe(true);
  await expect(panel.getByText(/is at risk at 30/)).toBeVisible();
});

test('the composer rewrites a draft and offers the undo', async ({ page }) => {
  await page.goto('/#/tickets', { waitUntil: 'networkidle' });
  const box = page.locator('[role="textbox"]');
  await box.click();
  await box.type('We are just basically looking into it right now.');
  await expect(page.getByText('Rewrite')).toBeVisible();
  await page.getByRole('button', { name: 'Tighten' }).click();
  await expect(box).not.toContainText('basically');
  await page.getByRole('button', { name: /Undo tighten/ }).click();
  await expect(box).toContainText('basically');
});

test('suggested replies fill the composer and then get out of the way', async ({ page }) => {
  await page.goto('/#/tickets', { waitUntil: 'networkidle' });
  await expect(page.getByText('Suggested')).toBeVisible();
  await page.locator('[role="textbox"]').click();
  await page.locator('[role="textbox"]').type('x');
  await expect(page.getByText('Suggested')).toHaveCount(0);
});

test('the inbox panes collapse and come back', async ({ page }) => {
  await page.goto('/#/tickets', { waitUntil: 'networkidle' });
  await page.locator('button[aria-label="Hide list"]').click();
  await expect(page.locator('button[aria-label="Hide list"]')).toHaveCount(0);
  await page.locator('button[aria-label="Show list"]').click();
  await expect(page.locator('button[aria-label="Hide list"]')).toBeVisible();
});

test('a module with one view shows no view pane', async ({ page }) => {
  await page.goto('/#/work', { waitUntil: 'networkidle' });
  await expect(page.getByRole('button', { name: 'All work' })).toHaveCount(0);
  // ...but a module with several still does.
  await page.goto('/#/customers', { waitUntil: 'networkidle' });
  await expect(page.getByRole('button', { name: 'My portfolio' })).toBeVisible();
});
