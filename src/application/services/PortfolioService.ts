import { PortfolioRepository } from '../../infrastructure/repositories';
import { CreatePortfolioDTO } from '../../domain/models';

export const PortfolioService = {
  async addPhoto(data: CreatePortfolioDTO) {
    // Regra: Limitar número de fotos? (Futuro)
    return await PortfolioRepository.create(data);
  },

  async getChefPortfolio(chefId: number) {
    return await PortfolioRepository.findByChef(chefId);
  },

  async removePhoto(photoId: number) {
    // Regra: Verificar se a foto pertence ao chef? (Seria ideal passar o chefId aqui também)
    await PortfolioRepository.delete(photoId);
    return { message: "Foto removida." };
  }
};