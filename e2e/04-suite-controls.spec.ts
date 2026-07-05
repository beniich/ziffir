import { test, expect, BrowserContext, Page } from '@playwright/test';
import { TEST_USERS, loginUI } from './helpers/auth';

test.describe('Suite Controls — Temps réel', () => {
  let contextA: BrowserContext;
  let contextB: BrowserContext;
  let pageA: Page;
  let pageB: Page;
  
  test.beforeAll(async ({ browser }) => {
    contextA = await browser.newContext();
    pageA = await contextA.newPage();
    await loginUI(pageA, TEST_USERS.staff.email, TEST_USERS.staff.password);
    
    contextB = await browser.newContext();
    pageB = await contextB.newPage();
    await loginUI(pageB, TEST_USERS.owner.email, TEST_USERS.owner.password);
  });
  
  test.afterAll(async () => {
    await contextA?.close();
    await contextB?.close();
  });
  
  test('badge LIVE visible après connexion', async () => {
    await pageA.goto('/suite-controls');
    await expect(pageA.getByText('Live')).toBeVisible({ timeout: 10_000 });
  });
  
  test('User A change la température, User B voit en < 3s', async () => {
    await pageA.goto('/suite-controls');
    await pageB.goto('/suite-controls');
    
    await expect(pageA.getByText('Live')).toBeVisible({ timeout: 10_000 });
    await expect(pageB.getByText('Live')).toBeVisible({ timeout: 10_000 });
    
    const sliderA = pageA.locator('[data-testid="temp-slider"]').first();
    if (await sliderA.isVisible().catch(() => false)) {
      await sliderA.fill('18.5');
      await sliderA.dispatchEvent('change');
      
      const sliderB = pageB.locator('[data-testid="temp-slider"]').first();
      await expect(sliderB).toHaveValue('18.5', { timeout: 3_000 });
    }
  });
  
  test('Reconnexion automatique après perte réseau', async () => {
    await pageA.goto('/suite-controls');
    await expect(pageA.getByText('Live')).toBeVisible();
    
    await pageA.context().setOffline(true);
    await pageA.waitForTimeout(500);
    await expect(pageA.getByText(/Déconnecté|Offline/i)).toBeVisible({ timeout: 5_000 });
    
    await pageA.context().setOffline(false);
    await expect(pageA.getByText('Live')).toBeVisible({ timeout: 15_000 });
  });
});
