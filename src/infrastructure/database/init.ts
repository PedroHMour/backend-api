import { db } from './index';
import { logger } from '../../shared/logger';
import { initialSchema } from './migrations/001_initial_schema';

async function initDatabase() {
  logger.info("🔄 Iniciando verificação e criação das tabelas...");

  try {
    for (const query of initialSchema) {
      await db.query(query);
    }
    logger.info("✅ Todas as tabelas foram verificadas/criadas com sucesso!");
  } catch (error) {
    logger.error("❌ Erro ao inicializar banco de dados:", error);
  } finally {
    process.exit();
  }
}

initDatabase();