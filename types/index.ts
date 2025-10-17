// types/index.ts
export interface User {
  id: number;
  display_name: string | null;
  first_name: string;
  last_name: string;
  username: string;
  profile_photo: string;
}

export interface Project {
  id: number;
  access_uuid: string;
  project_code: string;
  name: string;
  type: string;
  thumbnail_url: string;
  trailer_url: string;
  status: string;
  created_at: string;
  creator: User;
  watchings: number;
  likes_count: number;
  views_count: number;
  watchings_count: number;
}
