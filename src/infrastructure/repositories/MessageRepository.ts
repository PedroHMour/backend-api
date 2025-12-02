import { db } from '../database';
import { Message, CreateMessageDTO } from '../../domain/models';

export const MessageRepository = {
  async create(data: CreateMessageDTO): Promise<Message> {
    const result = await db.query(
      "INSERT INTO messages (request_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *",
      [data.request_id, data.sender_id, data.content]
    );
    return result.rows[0];
  },

  async findByRequest(requestId: number): Promise<Message[]> {
    const result = await db.query(
      "SELECT * FROM messages WHERE request_id = $1 ORDER BY created_at ASC",
      [requestId]
    );
    return result.rows;
  }
};