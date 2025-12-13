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
  // Configurações de performance e Resiliência
  max: 20, // Máximo de conexões simultâneas
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // AUMENTADO PARA 10s (Resolvido o erro de timeout)
});

// Listeners de Eventos do Banco
pool.on('connect', () => {
  // logger.info('📦 Nova conexão com o banco estabelecida');
});

pool.on('error', (err) => {
  logger.error('❌ Erro inesperado no cliente do banco (Idle Client)', err);
  // Não encerramos o processo imediatamente para tentar recuperação automática do Pool
  // process.exit(-1); 
});

// Wrapper Profissional para Queries
export const db = {
  query: async (text: string, params?: any[]): Promise<QueryResult> => {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      
      // Log de queries lentas (> 1s)
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