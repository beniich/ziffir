import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/',              title: /Ziffir/i },
  { path: '/features',     title: /Fonctionnalit/i },
  { path: '/pricing',      title: /Tarifs|Pricing/i },
  { path: '/trial',        title: /Essai/i },
  { path: '/careers',      title: /Carri[èe]res/i },
  { path: '/blog',         title: /Blog/i },
  { path: '/changelog',    title: /Nouveaut|Changelog/i },
  { path: '/status',       title: /Status|Statut/i },
  { path: '/legal',        title: /Legal|Mentions/i },
  { path: '/legal/terms',  title: /Conditions/i },
  { path: '/legal/privacy',title: /confidentialit/i },
  { path: '/legal/gdpr',   title: /RGPD/i },
  { path: '/legal/cookies',title: /cookies/i },
  { path: '/legal/cgv',    title: /CGV|Vente/i },
];

test.describe('Pages publiques — SEO & Structure', () => {
  for (const { path, title } of PAGES) {
    test(`${path} : titre correct et un seul H1`, async ({ page }) => {
      await page.goto(path);
      
      await expect(page).toHaveTitle(title);
      
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
      
      await expect(page.locator('main#main-content')).toBeVisible();
    });
    
    test(`${path} : JSON-LD valide`, async ({ page }) => {
      await page.goto(path);
      
      const jsonLdCount = await page.locator('script[type="application/ld+json"]').count();
      expect(jsonLdCount).toBeGreaterThan(0);
      
      const firstJsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
      expect(() => JSON.parse(firstJsonLd!)).not.toThrow();
    });
  }
  
  test('robots.txt présent', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.ok()).toBeTruthy();
    const text = await res.text();
    expect(text).toContain('User-agent');
  });
  
  test('navigation keyboard : skip link focusé au premier Tab', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: /contenu principal|skip/i });
    if (await skipLink.count() > 0) {
      await expect(skipLink).toBeFocused();
    }
  });
});
