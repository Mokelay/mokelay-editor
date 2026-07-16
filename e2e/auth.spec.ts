import { expect, test } from '@playwright/test';

test('redirects an unauthenticated editor route to website login with a safe return target', async ({ page }) => {
  await page.route('**/api/mokelay/me**', async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        'access-control-allow-origin': 'http://127.0.0.1:4173',
        'access-control-allow-credentials': 'true',
        'content-type': 'application/json'
      },
      body: JSON.stringify({ ok: true, data: { loggedIn: false, user: null } })
    });
  });

  await page.goto('/workspace?mode=compact#/pages/example/edit');
  await expect.poll(() => page.url()).toContain('http://localhost:3000/login?');

  const loginUrl = new URL(page.url());
  expect(loginUrl.searchParams.get('redirect')).toBe('/workspace?mode=compact#/pages/example/edit');
  expect(loginUrl.searchParams.get('redirect_origin')).toBe('http://127.0.0.1:4173');
});
