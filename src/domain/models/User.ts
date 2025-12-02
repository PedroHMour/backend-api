export type UserType = 'client' | 'cook';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string; // Opcional porque nem sempre trafegamos a senha
  type: UserType;
  created_at?: Date;
}

// Interface para criação (sem ID e data, pois o banco gera)
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  type: UserType;
}