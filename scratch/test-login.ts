import { authService } from '../src/server/domains/auth/auth.service';

async function test() {
  const email = 'admin.zaphir@empire.local';
  const password = 'Zaphir-Secure-Password-2026!';

  try {
    console.log(`🔑 Tentative de connexion pour : ${email}...`);
    const result = await authService.login({ email, password });
    
    console.log('✅ Connexion réussie !');
    console.log('👤 Utilisateur :', {
      id: result.auth.user.id,
      email: result.auth.user.email,
      displayName: result.auth.user.displayName,
    });
    console.log('🏨 Hôtel Actif :', result.auth.activeHotel);
    console.log('🎟️ Tokens générés (Access Token présent) :', !!result.accessToken);
  } catch (error: any) {
    console.error('❌ Échec de la connexion :', error.message);
  }
}

test();
