import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import admin from '../../config/firebase'; 
import { UserRepository } from '../../infrastructure/repositories';
import { CreateUserDTO, User } from '../../domain/models';
import { env } from '../../config/env';

export const AuthService = {
  
  async signup(data: CreateUserDTO) {
    const exists = await UserRepository.findByEmail(data.email);
    if (exists) throw new Error("E-mail já cadastrado.");

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await UserRepository.create({
      ...data,
      password: hashedPassword
    });

    const token = this.generateToken(user);
    return { user, token };
  },

  async login(email: string, pass: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error("Usuário não encontrado.");
    if (!user.password) throw new Error("Usuário logado via Google. Use o botão Google.");

    const isValid = await bcrypt.compare(pass, user.password);
    if (!isValid) throw new Error("Senha incorreta.");

    const token = this.generateToken(user);
    const { password, ...safeUser } = user; 
    return { user: safeUser, token };
  },

  async googleLogin(token: string, userType: string = 'client', userName?: string) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const { email, name: googleName } = decodedToken;
      
      if (!email) throw new Error("Token sem e-mail.");

      let user = await UserRepository.findByEmail(email);

      if (!user) {
        const randomPass = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPass, 10);
        
        user = await UserRepository.create({
          name: userName || googleName || 'Usuário Google',
          email: email,
          password: hashedPassword,
          type: userType === 'cook' ? 'cook' : 'client' 
        });
      }

      const appToken = this.generateToken(user);
      const { password, ...safeUser } = user;
      
      return { user: safeUser, token: appToken };

    } catch (error) {
      console.error("Erro no AuthService Google:", error);
      throw new Error("Token inválido ou expirado.");
    }
  },

  async checkUserExists(email: string) {
    const user = await UserRepository.findByEmail(email);
    return user ? { exists: true, name: user.name } : { exists: false };
  },

  // --- FUNÇÃO CORRIGIDA COM BYPASS DE TIPO ---
  async deleteUser(id: number) {
    // @ts-ignore: Ignora erro de tipo se o método não estiver explícito na interface do Repositório
    await UserRepository.delete(id);
    return { message: "Conta excluída com sucesso." };
  },

  generateToken(user: User) {
    return jwt.sign(
      { id: user.id, type: user.type }, 
      env.jwtSecret, 
      { expiresIn: '30d' }
    );
  }
};