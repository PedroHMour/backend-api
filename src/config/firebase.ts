import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

if (!admin.apps.length) {
  try {
    // Tenta ler a variável do Railway (FIREBASE_SERVICE_ACCOUNT)
    // Se estiver no PC local (dev), pode não ter, então tratamos o erro
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("🔥 Firebase Admin iniciado com sucesso!");
    } else {
        console.warn("⚠️ Variável FIREBASE_SERVICE_ACCOUNT não encontrada.");
    }
  } catch (error) {
    console.error("❌ Erro ao iniciar Firebase Admin:", error);
  }
}

export default admin;