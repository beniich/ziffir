import { test, expect } from '@playwright/test';
import { TEST_USERS, loginUI, logoutUI } from './helpers/auth';

test.describe('Auth — Parcours complets', () => {
  test('inscription self-serve', async ({ page }) => {
    const email = `signup-${Date.now()}@ziffir.test`;
    
    await page.goto('/register');
    await page.getByLabel(/nom complet/i).fill('Test Signup');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/mot de passe/i).fill('TestPassword123!');
    await page.getByRole('button', { name: /cr[ée]er|s'inscrire|démarrer/i }).click();
    
    // Devrait rediriger vers le dashboard
    await page.waitForURL(/\/(portal|app|dashboard)/, { timeout: 15_000 });
  });
  
  test('connexion avec credentials valides', async ({ page }) => {
    await loginUI(page, TEST_USERS.owner.email, TEST_USERS.owner.password);
    await expect(page.getByText(/profil|dashboard|portal/i).first()).toBeVisible();
  });
  
  test('refuse un mauvais mot de passe', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(TEST_USERS.owner.email);
    await page.getByLabel(/mot de passe/i).fill('WrongPassword');
    await page.getByRole('button', { name: /se connecter/i }).click();
    
    await expect(page.getByText(/invalide|incorrect|erreur/i)).toBeVisible();
  });
  
  test('session persistante après refresh', async ({ page }) => {
    await loginUI(page, TEST_USERS.owner.email, TEST_USERS.owner.password);
    await page.reload();
    await expect(page).not.toHaveURL(/\/login/);
  });
  
  test('logout ramène à la landing', async ({ page }) => {
    await loginUI(page, TEST_USERS.owner.email, TEST_USERS.owner.password);
    await logoutUI(page);
    await expect(page).toHaveURL(/\/(login|$)/);
  });
  
  test('cookies HttpOnly (pas accessibles via JS)', async ({ page, context }) => {
    await loginUI(page, TEST_USERS.owner.email, TEST_USERS.owner.password);
    
    const cookies = await context.cookies();
    const accessToken = cookies.find(c => c.name === 'zafir_access_token');
    expect(accessToken).toBeDefined();
    expect(accessToken!.httpOnly).toBe(true);
    
    const jsVisible = await page.evaluate(() => 
      document.cookie.includes('zafir_access_token')
    );
    expect(jsVisible).toBe(false);
  });
});
