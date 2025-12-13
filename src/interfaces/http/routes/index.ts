import { Router } from 'express';
import { 
  AuthController, OrderController, ChatController, 
  PortfolioController, ReviewController, PaymentController 
} from '../controllers'; 

const routes = Router();

// --- AUTH & USER ---
routes.post('/check-user', AuthController.checkUser);
routes.post('/signup', AuthController.signup);
routes.post('/login', AuthController.login);
routes.post('/auth/google', AuthController.googleLogin);
routes.post('/auth/googleLogin', (req, res) => AuthController.googleLogin(req, res));

// Rota de Excluir Conta (NOVA)
routes.delete('/users/:id', AuthController.deleteUser);

// --- REQUESTS (PEDIDOS) ---
routes.post('/requests', OrderController.create);
routes.get('/requests', OrderController.listPending);
routes.post('/requests/accept', OrderController.accept);
routes.post('/requests/update-status', OrderController.updateStatus);

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
routes.get('/users/:id/stats', ReviewController.getStats);

// --- PAGAMENTOS ---
routes.post('/payments/pix', PaymentController.payWithPix);
routes.post('/payments/card', PaymentController.payWithCard);
routes.post('/webhook', PaymentController.webhook);

export { routes };