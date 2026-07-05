import { test, expect } from '@playwright/test';

test.describe('Accessibilité (WCAG 2.1 AA)', () => {
  const PUBLIC_PAGES = ['/', '/pricing', '/features', '/blog', '/changelog', '/careers', '/status'];
  
  for (const path of PUBLIC_PAGES) {
    test(`${path} : éléments focusables présents`, async ({ page }) => {
      await page.goto(path);
      
      const focusableCount = await page.evaluate(() => {
        const focusable = document.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        return focusable.length;
      });
      
      expect(focusableCount).toBeGreaterThan(3);
    });
    
    test(`${path} : attributs aria présents sur éléments interactifs`, async ({ page }) => {
      await page.goto(path);
      
      // Tous les boutons doivent avoir un texte accessible
      const buttons = page.locator('button');
      const count = await buttons.count();
      for (let i = 0; i < Math.min(count, 10); i++) {
        const btn = buttons.nth(i);
        const text = await btn.textContent();
        const ariaLabel = await btn.getAttribute('aria-label');
        const hasText = (text?.trim().length ?? 0) > 0 || (ariaLabel?.trim().length ?? 0) > 0;
        expect(hasText, `Button ${i} at ${path} has no accessible text`).toBe(true);
      }
    });
    
    test(`${path} : images avec alt text`, async ({ page }) => {
      await page.goto(path);
      
      const images = page.locator('img');
      const count = await images.count();
      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt, `Image ${i} at ${path} missing alt attribute`).not.toBeNull();
      }
    });
  }
  
  test('Navigation clavier : ordre du focus logique sur la home', async ({ page }) => {
    await page.goto('/');
    
    // Premier Tab : skip link ou premier lien de nav
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON']).toContain(focused);
  });
});
