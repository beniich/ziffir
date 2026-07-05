import { test, expect } from '@playwright/test';

test.describe('Phase 1 — Site Marketing (Public)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });
  
  test('affiche la page d\'accueil avec hero', async ({ page }) => {
    await expect(page).toHaveTitle(/Ziffir/i);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
  
  test('présente les plans tarifaires', async ({ page }) => {
    await page.getByRole('link', { name: /tarifs|pricing/i }).first().click();
    await expect(page).toHaveURL(/\/pricing/);
    for (const plan of ['PREMIUM', 'PLATINIUM', 'GOLDEN']) {
      await expect(page.getByText(plan).first()).toBeVisible();
    }
  });
  
  test('a les balises meta SEO correctes', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThan(70);
    
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThan(50);
    
    const jsonLd = await page.locator('script[type="application/ld+json"]').count();
    expect(jsonLd).toBeGreaterThan(0);
  });
  
  test('footer avec liens légaux', async ({ page }) => {
    const footerLinks = ['Conditions', 'confidentialité', 'RGPD', 'CGV'];
    for (const name of footerLinks) {
      await expect(page.locator('footer').getByText(new RegExp(name, 'i')).first()).toBeVisible();
    }
  });
  
  test('Blog : liste des articles visibles', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const articles = page.locator('article');
    await expect(articles.first()).toBeVisible();
  });
  
  test('Changelog : timeline des versions visible', async ({ page }) => {
    await page.goto('/changelog');
    await expect(page.getByText('v1.4.0')).toBeVisible();
    await expect(page.getByText('v1.0.0')).toBeVisible();
  });
  
  test('Carrières : postes listés et filtrables', async ({ page }) => {
    await page.goto('/careers');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('Engineering')).toBeVisible();
    
    // Filtre Engineering
    await page.getByRole('tab', { name: 'Engineering' }).click();
    const jobs = page.locator('article');
    expect(await jobs.count()).toBeGreaterThanOrEqual(1);
  });
});
