import { Request, Response } from 'express';
import { AuthService } from '../../../application/services/AuthService';
import { UserRepository } from '../../../infrastructure/repositories/UserRepository';

class AuthController {
  
  // --- Métodos de Autenticação Existentes ---

  async signup(req: Request, res: Response) {
    try {
      const result = await AuthService.signup(req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return res.json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }

  async googleLogin(req: Request, res: Response) {
    try {
      // Recebe token e tipo (client/cook)
      const { token, type, name } = req.body;
      const result = await AuthService.googleLogin(token, type, name);
      return res.json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }

  async checkUser(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const result = await AuthService.checkUserExists(email);
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await AuthService.deleteUser(Number(id));
      return res.status(200).json({ message: "Usuário deletado" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- NOVOS MÉTODOS PARA O MAPA (Essenciais para o Dashboard) ---

  // Rota: GET /chefs
  async listChefs(req: Request, res: Response) {
    try {
        // Busca todos os usuários do tipo 'cook' no banco
        // Nota: Certifique-se que o UserRepository tem o método findAllCooks
        const chefs = await UserRepository.findAllCooks();
        return res.json(chefs);
    } catch (error: any) {
        return res.status(500).json({ error: 'Erro ao buscar chefes: ' + error.message });
    }
  }

  // Rota: POST /users/location
  async updateLocation(req: Request, res: Response) {
    try {
        const { id, latitude, longitude } = req.body;
        
        if (!id || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ error: 'Dados de localização incompletos' });
        }

        // Atualiza a latitude/longitude do usuário no banco
        await UserRepository.updateLocation(Number(id), Number(latitude), Number(longitude));
        
        return res.json({ message: 'Localização atualizada com sucesso' });
    } catch (error: any) {
        return res.status(500).json({ error: 'Erro ao atualizar local: ' + error.message });
    }
  }
}

export default new AuthController();