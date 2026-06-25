const fs = require('fs');
const path = require('path');

// Absolute paths
const jsonPath = 'C:\\Users\\pc gold\\Downloads\\zaphir-auth-firebase-adminsdk-fbsvc-79b2537d00.json';
const envPath = path.join(__dirname, '.env');

try {
  // Read and parse Firebase JSON
  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: Service account file not found at ${jsonPath}`);
    process.exit(1);
  }
  
  const credentials = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const projectId = credentials.project_id;
  const clientEmail = credentials.client_email;
  // Replace actual newlines in the private key with literal \\n characters for the env file
  const privateKey = credentials.private_key.replace(/\n/g, '\\n');

  // Read current .env
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Remove existing firebase vars if any
  envContent = envContent
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      return !trimmed.startsWith('FIREBASE_PROJECT_ID=') && 
             !trimmed.startsWith('FIREBASE_CLIENT_EMAIL=') && 
             !trimmed.startsWith('FIREBASE_PRIVATE_KEY=');
    })
    .join('\n');

  // Append new vars
  const firebaseEnv = `\n# Firebase Admin SDK Configuration\nFIREBASE_PROJECT_ID="${projectId}"\nFIREBASE_CLIENT_EMAIL="${clientEmail}"\nFIREBASE_PRIVATE_KEY="${privateKey}"\n`;
  envContent = envContent.trim() + '\n' + firebaseEnv;

  // Write back to .env
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ Firebase environment variables successfully written to backend/.env');
} catch (error) {
  console.error('❌ Error during setup:', error);
  process.exit(1);
}
