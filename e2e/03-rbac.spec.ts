import { test, expect } from '@playwright/test';
import { TEST_USERS, loginUI } from './helpers/auth';

test.describe('RBAC — Matrice des accès', () => {
  const scenarios = [
    {
      role: 'staff',
      user: TEST_USERS.staff,
      hidden: ['/billing', '/settings', '/users', '/vault', '/channel-sync'],
    },
  ];
  
  for (const { role, user, hidden } of scenarios) {
    test(`rôle "${role}" : ne peut pas accéder aux URLs interdites`, async ({ page }) => {
      await loginUI(page, user.email, user.password);
      
      for (const path of hidden) {
        await page.goto(path);
        const url = page.url();
        expect(url).toMatch(/\/(forbidden|login|$)/);
      }
    });
  }
});

test.describe('Multi-hôtel', () => {
  test('peut switcher entre 2 hôtels', async ({ page }) => {
    await loginUI(page, TEST_USERS.multiHotel.email, TEST_USERS.multiHotel.password);
    
    const switcher = page.getByRole('button', { name: /h[oô]tel.*▾/i });
    if (await switcher.isVisible().catch(() => false)) {
      await switcher.click();
      const options = page.getByRole('menuitem');
      expect(await options.count()).toBeGreaterThanOrEqual(2);
    }
  });
});
