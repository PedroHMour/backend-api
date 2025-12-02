import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { logger } from './shared/logger';
import { configureSocket } from './interfaces/websockets/socket';

// Cria o servidor HTTP com a configuração do Express (App)
const server = http.createServer(app);

// Inicializa WebSockets
configureSocket(server);

// Inicia Servidor
server.listen(env.port, () => {
  logger.info(`--------------------------------------------------`);
  logger.info(`🚀 Servidor Profissional rodando na porta ${env.port}`);
  logger.info(`📡 Socket.io pronto para conexões!`);
  logger.info(`--------------------------------------------------`);
});