// src/interfaces/http/controllers/ChatController.ts
import { Request, Response } from 'express';
import { ChatService } from '../../../application/services';

class ChatController {
  async getHistory(req: Request, res: Response) {
    try {
      const { request_id } = req.params;
      const msgs = await ChatService.getHistory(Number(request_id));
      return res.json(msgs);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new ChatController();