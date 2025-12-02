export type RequestStatus = 'pending' | 'accepted' | 'arrived' | 'cooking' | 'completed';

export interface RequestOrder {
  id: number;
  client_id: number;
  cook_id?: number | null; // Pode ser nulo se ninguém aceitou ainda
  dish_description: string;
  offer_price: number;     // No banco é decimal, no JS tratamos como number/string
  latitude: number;
  longitude: number;
  status: RequestStatus;
  created_at?: Date;
  
  // Campos opcionais para Join (quando buscamos o nome do cliente junto)
  client_name?: string;
  cook_name?: string;
}

export interface CreateRequestDTO {
  client_id: number;
  dish_description: string;
  offer_price: number;
  latitude: number;
  longitude: number;
}