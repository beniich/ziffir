import { test, expect } from '@playwright/test';

test.describe('Conformité RGPD & Légal', () => {
  test('Cookies : bandeau apparaît au premier visit', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await expect(page.getByText(/cookies|vie priv[ée]e/i).first()).toBeVisible({ timeout: 5_000 });
  });
  
  test('Cookies : disparaît après consentement', async ({ page }) => {
    await page.goto('/');
    const acceptBtn = page.getByRole('button', { name: /tout accepter|accepter/i });
    if (await acceptBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await acceptBtn.click();
      await page.waitForTimeout(500);
      await page.goto('/');
      const banner = page.getByText(/nous respectons votre vie priv/i);
      await expect(banner).not.toBeVisible();
    }
  });
  
  test('Cookies : personnalisation fonctionne', async ({ page }) => {
    await page.goto('/');
    const customizeBtn = page.getByRole('button', { name: /personnaliser/i });
    if (await customizeBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await customizeBtn.click();
      await expect(page.getByText(/pr[ée]f[ée]rences cookies/i)).toBeVisible();
      await page.getByRole('button', { name: /enregistrer/i }).click();
    }
  });
  
  test('RGPD : DPO joignable', async ({ page }) => {
    await page.goto('/legal/gdpr');
    await expect(page.getByRole('link', { name: /dpo@ziffir/i })).toBeVisible();
  });
  
  test('CGV : mentions contractuelles présentes', async ({ page }) => {
    await page.goto('/legal/cgv');
    await expect(page.getByText(/conditions g[ée]n[ée]rales de vente/i)).toBeVisible();
  });
  
  test('Politique de confidentialité : droits RGPD mentionnés', async ({ page }) => {
    await page.goto('/legal/privacy');
    const rightsTerms = ['rectification', 'suppression', 'portabilité'];
    for (const term of rightsTerms) {
      await expect(page.getByText(new RegExp(term, 'i')).first()).toBeVisible();
    }
  });
});
