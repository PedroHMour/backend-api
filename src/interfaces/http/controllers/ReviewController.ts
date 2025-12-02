import { Request, Response } from 'express';
import { ReviewService } from '../../../application/services';
import { UserRepository } from '../../../infrastructure/repositories';

export const ReviewController = {
  async create(req: Request, res: Response) {
    try {
      await ReviewService.addReview(req.body);
      res.status(201).json({ message: "Avaliado!" });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  },
  
  async getStats(req: Request, res: Response) {
    try {
       const { id } = req.params;
       // Reusando lógica do UserRepository que já soma tudo
       // Pequena adaptação técnica para manter compatibilidade
       const user = await UserRepository.findById(Number(id));
       if (!user) return res.status(404).json({error: 'User not found'});
       
       const stats = await UserRepository.getStats(Number(id), user.type);
       res.json({ user, stats });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }
};