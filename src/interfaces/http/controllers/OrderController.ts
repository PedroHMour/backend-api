import { Request, Response } from 'express';
import { OrderService } from '../../../application/services';
import { io } from '../../websockets/socket'; 

class OrderController {
  async create(req: Request, res: Response) {
    try {
      const order = await OrderService.create(req.body);
      io?.emit('new_order_available', order);
      return res.status(201).json(order);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async listPending(req: Request, res: Response) {
    try {
      const list = await OrderService.listPending();
      return res.json(list);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getActive(req: Request, res: Response) {
    try {
      return res.status(400).json({error: "Use as rotas específicas"});
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getActiveByClient(req: Request, res: Response) {
    try {
      const { client_id } = req.params;
      // ✅ CORREÇÃO AQUI: Number() em volta do id
      const order = await OrderService.getActiveOrder(Number(client_id), 'client');
      return res.json(order);
    } catch (error: any) { 
      return res.status(500).json({ error: error.message }); 
    }
  }

  async getActiveByCook(req: Request, res: Response) {
    try {
      const { cook_id } = req.params;
      // ✅ CORREÇÃO AQUI: Number() em volta do id
      const list = await OrderService.getActiveOrder(Number(cook_id), 'cook');
      return res.json(list);
    } catch (error: any) { 
      return res.status(500).json({ error: error.message }); 
    }
  }

  async accept(req: Request, res: Response) {
    try {
      const { request_id, cook_id } = req.body;
      const order = await OrderService.acceptOrder(request_id, cook_id);
      
      io?.to(`order_${request_id}`).emit('order_status_update', { status: 'accepted' });
      return res.json({ message: "Aceito", request: order });
    } catch (error: any) { 
      return res.status(500).json({ error: error.message }); 
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { request_id, new_status } = req.body;
      const order = await OrderService.updateStatus(request_id, new_status);
      
      io?.to(`order_${request_id}`).emit('order_status_update', order);
      return res.json({ message: "Status atualizado!", request: order });
    } catch (error: any) { 
      return res.status(500).json({ error: error.message }); 
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      // ✅ CORREÇÃO AQUI: Number() em volta do id
      const list = await OrderService.getHistory(Number(user_id));
      return res.json(list);
    } catch (error: any) { 
      return res.status(500).json({ error: error.message }); 
    }
  }
}

export default new OrderController();