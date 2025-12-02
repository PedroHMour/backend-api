import { Request, Response } from 'express';
import { PortfolioService } from '../../../application/services';

export const PortfolioController = {
  async add(req: Request, res: Response) {
    try {
      const item = await PortfolioService.addPhoto(req.body);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const { chef_id } = req.params;
      const list = await PortfolioService.getChefPortfolio(Number(chef_id));
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await PortfolioService.removePhoto(Number(id));
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};