// types/search.ts
export interface PaginatedResponse<T> {
  results: T[]
  total: number
  current_page: number
  per_page: number
  last_page: number
}

export interface Project {
  id: number
  access_uuid: string
  name: string
  thumbnail_url: string
  video_url: string | null
  created_at: string
  views_count: number
  creator: {
    id: number
    username: string
    display_name: string
    profile_photo: string
  }
}

export interface User {
  id: number
  username: string
  display_name: string
  profile_photo: string
  talent: string
  is_fanned_by_auth_user: boolean
  is_fanning_auth_user: boolean
}

export interface SearchResponse {
  projects: PaginatedResponse<Project>
  users: PaginatedResponse<User>
}
