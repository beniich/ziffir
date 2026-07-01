import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import fs from 'fs';

const rawConfig = fs.readFileSync('./firebase-applet-config.json', 'utf-8');
const firebaseConfig = JSON.parse(rawConfig);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const email = 'admin.zaphir@empire.local';
const password = 'Zaphir-Secure-Password-2026!';

async function createOrLogin() {
  try {
    console.log(`Tentative de création de l'utilisateur: ${email}`);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Utilisateur créé avec succès :', userCredential.user.uid);
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️ L\'utilisateur existe déjà. Tentative de connexion...');
      try {
        const login = await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ Connexion réussie, identifiants valides !');
        process.exit(0);
      } catch (loginError) {
        console.error('❌ Échec de la connexion (mot de passe peut-être différent) :', loginError.message);
        process.exit(1);
      }
    } else {
      console.error('❌ Erreur inattendue :', error.message);
      process.exit(1);
    }
  }
}

createOrLogin();
