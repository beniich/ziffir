import admin from 'firebase-admin';

// ⚠️ Initialiser UNE SEULE FOIS au démarrage
let initialized = false;

export const initializeFirebase = () => {
  if (initialized) return;

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
    console.warn('⚠️ Firebase credentials manquantes. firebase-admin fonctionnera en mode MOCK.');
    return;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // ⚠️ Les newlines doivent être \n dans .env
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    initialized = true;
    console.log('🔥 Firebase Admin initialized');
  } catch (err) {
    console.error('🔥 Erreur initialisation Firebase Admin:', err);
  }
};

export class FirebaseAdminService {
  /**
   * Vérifie un idToken de manière CRYPTOGRAPHIQUEMENT SÛRE
   * (vérifie la signature Google + expiration + audience)
   */
  static async verifyIdToken(idToken: string): Promise<any> {
    if (!initialized) {
      initializeFirebase();
    }
    
    if (!initialized) {
      console.warn('⚠️ [MOCK] Firebase non initialisé, décodage local simple (insécurisé en PROD)');
      // Fallback simple si firebase-admin non configuré (mode dev)
      const jwt = await import('jsonwebtoken');
      return jwt.decode(idToken);
    }

    try {
      // Cette méthode contacte les serveurs Google pour vérifier
      return await admin.auth().verifyIdToken(idToken, true);
    } catch (err: any) {
      throw new Error(`Token Firebase invalide: ${err.message}`);
    }
  }
}
