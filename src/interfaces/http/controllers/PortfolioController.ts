// src/interfaces/http/controllers/PortfolioController.ts
import { Request, Response } from 'express';
import { PortfolioService } from '../../../application/services';

class PortfolioController {
  async add(req: Request, res: Response) {
    try {
      const item = await PortfolioService.addPhoto(req.body);
      return res.status(201).json(item);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { chef_id } = req.params;
      const list = await PortfolioService.getChefPortfolio(Number(chef_id));
      return res.json(list);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await PortfolioService.removePhoto(Number(id));
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new PortfolioController();