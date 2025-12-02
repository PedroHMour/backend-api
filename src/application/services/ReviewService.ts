import { ReviewRepository } from '../../infrastructure/repositories';
import { CreateReviewDTO } from '../../domain/models';

export const ReviewService = {
  async addReview(data: CreateReviewDTO) {
    if (data.rating < 1 || data.rating > 5) {
      throw new Error("Nota deve ser entre 1 e 5.");
    }
    return await ReviewRepository.create(data);
  }
};