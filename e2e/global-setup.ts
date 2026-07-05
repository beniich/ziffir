import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🌱 Initializing E2E test environment...');
  
  // Vérifier que les serveurs sont up
  for (const project of config.projects) {
    const baseURL = (project.use as any).baseURL || config.use?.baseURL;
    if (baseURL) {
      try {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto(baseURL, { timeout: 15_000 });
        await browser.close();
        console.log(`✅ ${project.name}: ${baseURL} is up`);
      } catch (e) {
        console.warn(`⚠️ ${project.name}: ${baseURL} unreachable - starting anyway`);
      }
    }
  }
  
  console.log('✅ Global setup complete');
}

export default globalSetup;
