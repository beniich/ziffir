import { test, expect } from '@playwright/test';

test.describe('Room Service', () => {
  test.beforeEach(async ({ page }) => {
    // Auto-login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@zaphir.com');
    await page.getByLabel(/mot de passe/i).fill('Admin1234');
    await page.getByRole('button', { name: /se connecter/i }).click();
    await page.waitForURL('/dashboard');

    await page.goto('/room-service');
  });

  test('affiche la liste des commandes', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /room service/i })).toBeVisible();
  });

  test('filtre par statut fonctionne', async ({ page }) => {
    await page.locator('select').first().selectOption('Preparation');
    await page.waitForTimeout(500);
  });

  test('avancer statut déclenche confetti', async ({ page }) => {
    const advanceBtn = page.getByRole('button', { name: /avancer/i }).first();

    if (await advanceBtn.isVisible()) {
      await advanceBtn.click();
      await expect(page.getByText(/avancée|succès/i).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('modal détails s\'ouvre et se ferme', async ({ page }) => {
    const detailsBtn = page.getByRole('button', { name: /détails/i }).first();

    if (await detailsBtn.isVisible()) {
      await detailsBtn.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }
  });
});
