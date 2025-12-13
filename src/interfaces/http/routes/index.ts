import { Router } from 'express';
import { 
  AuthController, OrderController, ChatController, 
  PortfolioController, ReviewController, PaymentController 
} from '../controllers'; // Precisamos criar um index.ts nos controllers também!



const routes = Router();

// --- AUTH ---
routes.post('/check-user', AuthController.checkUser);
routes.post('/signup', AuthController.signup);
routes.post('/login', AuthController.login);
routes.post('/auth/google', AuthController.googleLogin);
// Tem que ser /auth/googleLogin para casar com o frontend novo
routes.post('/auth/googleLogin', (req, res) => AuthController.googleLogin(req, res));

// --- REQUESTS (PEDIDOS) ---
routes.post('/requests', OrderController.create);
routes.get('/requests', OrderController.listPending);
routes.post('/requests/accept', OrderController.accept);
routes.post('/requests/update-status', OrderController.updateStatus);

// Buscas Específicas (Compatibilidade com App)
routes.get('/requests/my-active-order/:client_id', OrderController.getActiveByClient);
routes.get('/requests/accepted-by/:cook_id', OrderController.getActiveByCook);
routes.get('/requests/history/:user_id', OrderController.getHistory);

// --- CHAT ---
routes.get('/messages/:request_id', ChatController.getHistory);

// --- PORTFOLIO ---
routes.post('/portfolio', PortfolioController.add);
routes.get('/portfolio/:chef_id', PortfolioController.list);
routes.delete('/portfolio/:id', PortfolioController.delete);

// --- REVIEWS & STATS ---
routes.post('/reviews', ReviewController.create);
routes.get('/users/:id/stats', ReviewController.getStats); // Rota unificada de stats

// --- PAGAMENTOS (NOVAS ROTAS) ---
routes.post('/payments/pix', PaymentController.payWithPix);
routes.post('/payments/card', PaymentController.payWithCard);
routes.post('/webhook', PaymentController.webhook);

export { routes };
