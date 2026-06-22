import { test, expect } from '@playwright/test';

test.describe('Authentification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('redirige vers /login si non authentifié', async ({ page }) => {
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: /ZAPHIR/i })).toBeVisible();
  });

  test('inscription + connexion fonctionnelle', async ({ page }) => {
    // Register
    await page.goto('/register');
    await page.getByLabel(/email/i).fill(`test${Date.now()}@zaphir.com`);
    await page.getByLabel(/nom d'utilisateur/i).fill(`user${Date.now()}`);
    await page.getByLabel(/^mot de passe$/i).fill('Test1234');
    await page.getByLabel(/confirmer/i).fill('Test1234');

    await page.getByRole('button', { name: /créer/i }).click();

    // Devrait rediriger vers dashboard après auto-login
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText(/bienvenue|dashboard/i).first()).toBeVisible();
  });

  test('affiche erreur sur credentials invalides', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('nobody@zaphir.com');
    await page.getByLabel(/mot de passe/i).fill('WrongPass1');
    await page.getByRole('button', { name: /se connecter/i }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByText(/invalides/i)).toBeVisible();
  });

  test('logout fonctionne', async ({ page, context }) => {
    // Login (assumant un user seed existant)
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@zaphir.com');
    await page.getByLabel(/mot de passe/i).fill('Admin1234');
    await page.getByRole('button', { name: /se connecter/i }).click();
    await expect(page).toHaveURL('/dashboard');

    // Logout
    await page.getByRole('button', { name: /admin|déconnexion/i }).click();

    // Vérifier retour sur /login
    await expect(page).toHaveURL('/login');
  });
});
