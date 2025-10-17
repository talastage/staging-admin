// types/auth.ts
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  profile_photo: string;
  display_name: string;
  talent: string | null;
  email: string;
  phone: string;
  country_id: number;
  universal_code: string | null;
  token: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
