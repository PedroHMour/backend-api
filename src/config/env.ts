import dotenv from 'dotenv';

// Carrega o arquivo .env
dotenv.config();

// Validação de Segurança: Não deixa o servidor subir se faltar coisa crítica
if (!process.env.DATABASE_URL) {
  throw new Error("❌ CRÍTICO: A variável DATABASE_URL não está definida no .env");
}

if (!process.env.JWT_SECRET) {
  console.warn("⚠️ AVISO: JWT_SECRET não definido. Usando segredo padrão (NÃO SEGURO PARA PRODUÇÃO).");
}

export const env = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'default_secret_dev_only',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  nodeEnv: process.env.NODE_ENV || 'development',

  
};