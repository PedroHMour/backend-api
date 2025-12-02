import express from 'express';
import cors from 'cors';
import 'express-async-errors'; // Importante para o errorHandler funcionar

import { routes } from './interfaces/http/routes';
import { errorHandler } from './interfaces/http/middlewares/errorHandler';

const app = express();

// Middlewares Globais
app.use(cors());
app.use(express.json());

// Rotas
app.use(routes);

// Rota de Saúde
app.get('/', (req, res) => {
  res.json({ status: 'online', version: '2.0.0', mode: 'Clean Architecture' });
});

// Tratamento de Erros (Deve ser o último use)
app.use(errorHandler);

export { app };