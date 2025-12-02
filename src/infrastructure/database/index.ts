import { Pool, QueryResult } from 'pg';
import { env } from '../../config/env';
import { logger } from '../../shared/logger';

// Configuração do Pool de Conexão
const pool = new Pool({
  connectionString: env.databaseUrl,
  // Configuração SSL Obrigatória para Supabase/Neon/Railway
  ssl: {
    rejectUnauthorized: false, 
  },
  // Configurações de performance
  max: 20, // Máximo de conexões simultâneas
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Listeners de Eventos do Banco
pool.on('connect', () => {
  // Silencioso em produção, útil em dev
  // logger.info('📦 Nova conexão com o banco estabelecida');
});

pool.on('error', (err) => {
  logger.error('❌ Erro inesperado no cliente do banco (Idle Client)', err);
  process.exit(-1); // Encerra o processo em caso de erro crítico
});

// Wrapper Profissional para Queries
export const db = {
  query: async (text: string, params?: any[]): Promise<QueryResult> => {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      // Opcional: Logar queries lentas (> 1s)
      const duration = Date.now() - start;
      if (duration > 1000) {
        logger.warn(`⚠️ Query lenta (${duration}ms): ${text}`);
      }
      return res;
    } catch (error) {
      logger.error(`Erro na query: ${text}`, error);
      throw error;
    }
  },
  
  // Para transações complexas onde precisamos do cliente direto
  getClient: () => pool.connect(),
};  