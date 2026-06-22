import { test, expect } from '@playwright/test';

test.describe('Contrôle d\'accès par rôle', () => {
  test('operator ne peut pas accéder à /staff', async ({ page }) => {
    // Login operator
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('operator@zaphir.com');
    await page.getByLabel(/mot de passe/i).fill('Test1234');
    await page.getByRole('button', { name: /se connecter/i }).click();
    await page.waitForURL('/dashboard');

    // Tentative d'accès à une page manager
    await page.goto('/staff');
    await expect(page.getByText(/accès refusé/i)).toBeVisible();
  });

  test('manager peut accéder à /staff', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('manager@zaphir.com');
    await page.getByLabel(/mot de passe/i).fill('Test1234');
    await page.getByRole('button', { name: /se connecter/i }).click();
    await page.waitForURL('/dashboard');

    await page.goto('/staff');
    await expect(page.getByRole('heading', { name: /personnel/i })).toBeVisible();
  });
});
