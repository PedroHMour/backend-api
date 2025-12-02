import { db } from '../database';
import { CreatePortfolioDTO, PortfolioItem } from '../../domain/models';

export const PortfolioRepository = {
  async create(data: CreatePortfolioDTO): Promise<PortfolioItem> {
    const result = await db.query(
      "INSERT INTO chef_portfolio (chef_id, image_url, title) VALUES ($1, $2, $3) RETURNING *",
      [data.chef_id, data.image_url, data.title]
    );
    return result.rows[0];
  },

  async findByChef(chefId: number): Promise<PortfolioItem[]> {
    const result = await db.query(
      "SELECT * FROM chef_portfolio WHERE chef_id = $1 ORDER BY created_at DESC",
      [chefId]
    );
    return result.rows;
  },

  async delete(id: number): Promise<void> {
    await db.query("DELETE FROM chef_portfolio WHERE id = $1", [id]);
  }
};