export interface PortfolioItem {
  id: number;
  chef_id: number;
  image_url: string;
  title: string;
  created_at?: Date;
}

export interface CreatePortfolioDTO {
  chef_id: number;
  image_url: string;
  title: string;
}