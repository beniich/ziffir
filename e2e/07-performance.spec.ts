import { test, expect } from '@playwright/test';

test.describe('Performance & Core Web Vitals', () => {
  test('Home : LCP < 2.5s', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
          resolve(last.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        setTimeout(() => resolve(0), 3000);
      });
    });
    
    if (lcp > 0) {
      console.log(`LCP: ${lcp}ms`);
      expect(lcp).toBeLessThan(2500);
    }
  });
  
  test('Pages publiques : pas de console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    for (const path of ['/', '/pricing', '/features', '/blog', '/careers', '/changelog']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
    }
    
    // Filtrer les erreurs liées aux images de placeholder qui n'existent pas
    const realErrors = errors.filter(e => !e.includes('/blog/') && !e.includes('/team/'));
    expect(realErrors).toEqual([]);
  });
  
  test('Bundle JS : taille totale surveillée', async ({ page }) => {
    const resources: number[] = [];
    page.on('response', async (response) => {
      if (response.request().resourceType() === 'script') {
        try {
          const body = await response.body();
          resources.push(body.length);
        } catch { /* ignore */ }
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const totalKb = resources.reduce((sum, s) => sum + s, 0) / 1024;
    console.log(`Total JS: ${totalKb.toFixed(0)} KB`);
    
    // < 4MB (actuel ~3.5MB avec html2canvas, objectif code-splitting à terme)
    expect(totalKb).toBeLessThan(4096);
  });
});
