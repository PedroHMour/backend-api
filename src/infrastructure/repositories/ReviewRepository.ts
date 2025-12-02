import { db } from '../database';
import { CreateReviewDTO, Review } from '../../domain/models';

export const ReviewRepository = {
  async create(data: CreateReviewDTO): Promise<Review> {
    const result = await db.query(
      "INSERT INTO reviews (request_id, reviewer_id, reviewed_id, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [data.request_id, data.reviewer_id, data.reviewed_id, data.rating, data.comment]
    );
    return result.rows[0];
  }
};