import { Request, Response } from 'express';
// Importamos o Repo direto para garantir o funcionamento
import { RequestRepository } from '../../../infrastructure/repositories/RequestRepository';
import { OrderService } from '../../../application/services';
import { io } from '../../websockets/socket'; 

class OrderController {
  
  async create(req: Request, res: Response) {
    try {
      const order = await OrderService.create(req.body);
      io?.emit('new_order_available', order); // Notifica todos os chefs conectados
      return res.status(201).json(order);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // LISTA O MURAL DE PEDIDOS (PENDENTES GERAIS)
  async listPending(req: Request, res: Response) {
    try {
      // Chama direto o Repositório para garantir
      const list = await RequestRepository.findAllPending();
      return res.json(list);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  }

  async getActiveByClient(req: Request, res: Response) {
    try {
      const { client_id } = req.params;
      const order = await RequestRepository.findActiveByClient(Number(client_id));
      return res.json(order);
    } catch (error: any) { 
      return res.status(500).json({ error: error.message }); 
    }
  }

  async getActiveByCook(req: Request, res: Response) {
    try {
      const { cook_id } = req.params;
      // Busca os pedidos que este chefe JA ACEITOU
      const list = await RequestRepository.findActiveByCook(Number(cook_id));
      return res.json(list);
    } catch (error: any) { 
      return res.status(500).json({ error: error.message }); 
    }
  }

  async accept(req: Request, res: Response) {
    try {
      const { request_id, cook_id } = req.body;
      
      // Usa o Repo para aceitar
      const order = await RequestRepository.accept(request_id, cook_id);
      
      if(order) {
          io?.to(`order_${request_id}`).emit('order_status_update', { status: 'accepted', cookId: cook_id });
          return res.json({ message: "Aceito", request: order });
      } else {
          return res.status(400).json({ error: "Erro ao aceitar pedido" });
      }
    } catch (error: any) { 
      return res.status(500).json({ error: error.message }); 
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { request_id, new_status } = req.body;
      const order = await RequestRepository.updateStatus(request_id, new_status);
      
      io?.to(`order_${request_id}`).emit('order_status_update', order);
      return res.json({ message: "Status atualizado!", request: order });
    } catch (error: any) { 
      return res.status(500).json({ error: error.message }); 
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const list = await RequestRepository.getHistory(Number(user_id));
      return res.json(list);
    } catch (error: any) { 
      return res.status(500).json({ error: error.message }); 
    }
  }
}

export default new OrderController();