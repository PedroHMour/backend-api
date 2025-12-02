import { Request, Response } from 'express';
import { ChatService } from '../../../application/services';

export const ChatController = {
  // Nota: O envio de msg é feito via Socket direto, mas mantemos aqui para histórico
  async getHistory(req: Request, res: Response) {
    try {
      const { request_id } = req.params;
      const msgs = await ChatService.getHistory(Number(request_id));
      res.json(msgs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};