// src/interfaces/http/controllers/ReviewController.ts
import { Request, Response } from 'express';
import { ReviewService } from '../../../application/services';
import { UserRepository } from '../../../infrastructure/repositories';

class ReviewController {
  async create(req: Request, res: Response) {
    try {
      await ReviewService.addReview(req.body);
      return res.status(201).json({ message: "Avaliado!" });
    } catch (error: any) { 
      return res.status(500).json({ error: error.message }); 
    }
  }
  
  async getStats(req: Request, res: Response) {
    try {
       const { id } = req.params;
       const user = await UserRepository.findById(Number(id));
       
       if (!user) return res.status(404).json({error: 'User not found'});
       
       const stats = await UserRepository.getStats(Number(id), user.type);
       return res.json({ user, stats });
    } catch (error: any) { 
      return res.status(500).json({ error: error.message }); 
    }
  }
}

export default new ReviewController();