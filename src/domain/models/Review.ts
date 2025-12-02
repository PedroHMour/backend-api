export interface Review {
  id: number;
  request_id: number;
  reviewer_id: number;
  reviewed_id: number;
  rating: number;
  comment?: string;
  created_at?: Date;
}

export interface CreateReviewDTO {
  request_id: number;
  reviewer_id: number;
  reviewed_id: number;
  rating: number;
  comment?: string;
}