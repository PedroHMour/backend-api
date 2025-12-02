export interface Message {
  id: number;
  request_id: number;
  sender_id: number;
  content: string;
  created_at: Date;
}

export interface CreateMessageDTO {
  request_id: number;
  sender_id: number;
  content: string;
}