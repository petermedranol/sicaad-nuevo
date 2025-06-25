export interface User {
  id: number;
  name: string;
  email: string;
  photo_path?: string;
  photo_url?: string;
  photo_hash?: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  user_type_id: number;
  avatar?: string;
  formatted_date?: string;
}
