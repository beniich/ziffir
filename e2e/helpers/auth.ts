import { Page, BrowserContext, APIRequestContext, expect } from '@playwright/test';

export const TEST_USERS = {
  admin:     { email: 'admin@ziffir.test',  password: 'Test1234!Secure' },
  owner:     { email: 'owner@ziffir.test',  password: 'Test1234!Secure' },
  multiHotel:{ email: 'multi@ziffir.test',  password: 'Test1234!Secure' },
  staff:     { email: 'staff@ziffir.test',  password: 'Test1234!Secure' },
};

export async function loginUI(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/mot de passe/i).fill(password);
  await page.getByRole('button', { name: /se connecter|connexion/i }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10_000 });
}

export async function logoutUI(page: Page) {
  await page.getByRole('button', { name: /déconnexion|logout/i }).click();
  await page.waitForURL('**/', { timeout: 5_000 });
}

export async function loginAPI(request: APIRequestContext, email: string, password: string) {
  const res = await request.post('/api/auth/login', {
    data: { email, password },
  });
  expect(res.ok()).toBeTruthy();
  return res;
}
