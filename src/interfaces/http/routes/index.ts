import { Router } from 'express';
import { 
  AuthController, 
  OrderController, 
  ChatController, 
  PortfolioController, 
  ReviewController, 
  PaymentController 
} from '../controllers'; 

const routes = Router();

// ==========================================
// 🔐 AUTENTICAÇÃO & USUÁRIOS
// ==========================================
routes.post('/check-user', AuthController.checkUser);
routes.post('/signup', AuthController.signup);
routes.post('/login', AuthController.login);

// Rotas de Login Google (suporta ambas as variações para compatibilidade)
routes.post('/auth/google', AuthController.googleLogin);
routes.post('/auth/googleLogin', (req, res) => AuthController.googleLogin(req, res));

routes.delete('/users/:id', AuthController.deleteUser);

// ==========================================
// 🗺️ MAPA & LOCALIZAÇÃO (IMPORTANTE)
// ==========================================
// Essas rotas permitem que o App carregue os chefes e atualize o GPS
routes.get('/chefs', AuthController.listChefs);
routes.post('/users/location', AuthController.updateLocation);

// ==========================================
// 🍽️ PEDIDOS (REQUESTS)
// ==========================================
routes.post('/requests', OrderController.create); // Cria um novo pedido
routes.get('/requests', OrderController.listPending); // Lista pedidos pendentes (para o Chef)

routes.post('/requests/accept', OrderController.accept); // Chef aceita pedido
routes.post('/requests/update-status', OrderController.updateStatus); // Atualiza status (cozinhando, etc)

// Consultas específicas de pedidos
routes.get('/requests/my-active-order/:client_id', OrderController.getActiveByClient);
routes.get('/requests/accepted-by/:cook_id', OrderController.getActiveByCook);
routes.get('/requests/history/:user_id', OrderController.getHistory);

// ==========================================
// 💬 CHAT & MENSAGENS
// ==========================================
routes.get('/messages/:request_id', ChatController.getHistory);

// ==========================================
// 📷 PORTFÓLIO (FOTOS DOS PRATOS)
// ==========================================
routes.post('/portfolio', PortfolioController.add);
routes.get('/portfolio/:chef_id', PortfolioController.list);
routes.delete('/portfolio/:id', PortfolioController.delete);

// ==========================================
// ⭐ AVALIAÇÕES & ESTATÍSTICAS
// ==========================================
routes.post('/reviews', ReviewController.create);
routes.get('/users/:id/stats', ReviewController.getStats);

// ==========================================
// 💳 PAGAMENTOS
// ==========================================
routes.post('/payments/pix', PaymentController.payWithPix);
routes.post('/payments/card', PaymentController.payWithCard);
routes.post('/webhook', PaymentController.webhook);

export { routes };