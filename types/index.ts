export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  location: string;
  description: string;
  image_url?: string;
  created_at: string;
}

export interface Reservation {
  id: string;
  user_id: string;
  restaurant_id: string;
  date: string;
  time: string;
  people_count: number;
  created_at: string;
  restaurant?: Restaurant;
} 