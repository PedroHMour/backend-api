import express from 'express';
import cors from 'cors';
import http from 'http';
import { env } from './config/env';
import { logger } from './shared/logger';
import { routes } from './interfaces/http/routes'; // <--- O problema pode estar nesta importação
import { configureSocket } from './interfaces/websockets/socket';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// 🕵️‍♂️ ESPIÃO 1: Logar TUDO que chega
app.use((req, res, next) => {
  logger.info(`➡️ RECEBI REQUISIÇÃO: ${req.method} ${req.url}`);
  next();
});

// Rota de Saúde (Essa sabemos que funciona)
app.get('/', (req, res) => {
  res.json({ status: 'online', version: '2.0.0', routes_loaded: true });
});

// Carrega as Rotas da Aplicação
// Se o erro for aqui, nenhuma rota de baixo funciona
app.use(routes); 

// 🕵️‍♂️ ESPIÃO 2: Se chegou aqui, é 404. Vamos ver porquê.
app.use((req, res) => {
  logger.error(`❌ 404 NÃO ENCONTRADO: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: "Rota não encontrada", 
    path: req.url, 
    method: req.method 
  });
});

// Inicializa WebSockets
configureSocket(server);

server.listen(env.port, () => {
  logger.info(`🚀 Servidor Diagnóstico rodando na porta ${env.port}`);
});