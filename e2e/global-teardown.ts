import { FullConfig } from '@playwright/test';

async function globalTeardown(_config: FullConfig) {
  console.log('🧹 Cleaning up E2E test environment...');
  // Cleanup tasks here (e.g., close DB connections, remove test artifacts)
  console.log('✅ Global teardown complete');
}

export default globalTeardown;
