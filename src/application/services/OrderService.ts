import { RequestRepository } from '../../infrastructure/repositories';
import { CreateRequestDTO } from '../../domain/models';

export const OrderService = {
  async create(data: CreateRequestDTO) {
    // Regra de negócio: Validar se já existe pedido pendente? (Opcional)
    return await RequestRepository.create(data);
  },

  async listPending() {
    return await RequestRepository.findAllPending();
  },

  async getActiveOrder(userId: number, type: string) {
    if (type === 'client') {
      return await RequestRepository.findActiveByClient(userId);
    } else {
      // Para o cozinheiro, retorna a lista de ativos
      return await RequestRepository.findActiveByCook(userId);
    }
  },

  async acceptOrder(requestId: number, cookId: number) {
    // Regra: Só pode aceitar se estiver pendente? (O banco já trava concorrência básica)
    const order = await RequestRepository.accept(requestId, cookId);
    if (!order) throw new Error("Pedido não encontrado ou já aceito.");
    return order;
  },

  async updateStatus(requestId: number, newStatus: string) {
    // Regra Uber: Validação de fluxo
    const validStatuses = ['arrived', 'cooking', 'completed'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error("Status inválido.");
    }
    
    const order = await RequestRepository.updateStatus(requestId, newStatus);
    if (!order) throw new Error("Pedido não encontrado.");
    
    return order;
  },

  async getHistory(userId: number) {
    return await RequestRepository.getHistory(userId);
  }
};