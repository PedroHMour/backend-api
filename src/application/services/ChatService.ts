import { MessageRepository } from '../../infrastructure/repositories';
import { CreateMessageDTO } from '../../domain/models';

export const ChatService = {
  async sendMessage(data: CreateMessageDTO) {
    if (!data.content.trim()) throw new Error("Mensagem vazia.");
    return await MessageRepository.create(data);
  },

  async getHistory(requestId: number) {
    return await MessageRepository.findByRequest(requestId);
  }
};  