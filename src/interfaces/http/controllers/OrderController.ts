import { Request, Response } from 'express';
import { OrderService } from '../../../application/services';
import { io } from '../../websockets/socket'; // Vamos criar já já

export const OrderController = {
  async create(req: Request, res: Response) {
    try {
      const order = await OrderService.create(req.body);
      // Avisa todos os cozinheiros via Socket
      io.emit('new_order_available', order);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async listPending(req: Request, res: Response) {
    try {
      const list = await OrderService.listPending();
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getActive(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const type = req.query.type as string || 'client'; // Padrão client se não enviar
      
      // Ajuste para compatibilidade com seu frontend atual que chama /requests/my-active-order/:id
      // Vamos assumir que a rota define se é cook ou client pela lógica antiga ou criar adapter
      // Lógica antiga: GET /requests/my-active-order/:client_id
      // Lógica antiga: GET /requests/accepted-by/:cook_id
      
      // Este controller é genérico, as rotas vão direcionar para o método certo
      return res.status(400).json({error: "Use as rotas específicas"});
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Métodos específicos para manter compatibilidade com seu App
  async getActiveByClient(req: Request, res: Response) {
    try {
      const { client_id } = req.params;
      const order = await OrderService.getActiveOrder(Number(client_id), 'client');
      res.json(order);
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  },

  async getActiveByCook(req: Request, res: Response) {
    try {
      const { cook_id } = req.params;
      const list = await OrderService.getActiveOrder(Number(cook_id), 'cook');
      res.json(list);
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  },

  async accept(req: Request, res: Response) {
    try {
      const { request_id, cook_id } = req.body;
      const order = await OrderService.acceptOrder(request_id, cook_id);
      
      io.to(`order_${request_id}`).emit('order_status_update', { status: 'accepted' });
      res.json({ message: "Aceito", request: order });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { request_id, new_status } = req.body;
      const order = await OrderService.updateStatus(request_id, new_status);
      
      io.to(`order_${request_id}`).emit('order_status_update', order);
      res.json({ message: "Status atualizado!", request: order });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  },

  async getHistory(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const list = await OrderService.getHistory(Number(user_id));
      res.json(list);
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }
};