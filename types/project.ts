// types/project.ts
export interface Project {
  id: number
  access_uuid: string
  name: string
  thumbnail_url: string
  video_url: string
  views_count: number
  created_at: string
  creator?: {
    id: number
    name: string
    avatar_url: string
  }
}

export interface Currency {
  id: number
  name: string
  symbol: string
  code: string
}

export interface ProjectListResource extends Project {
  description?: string | null
  status: 'draft' | 'published'
  premiering_start_date?: string | null
  premiering_time?: string | null
  watch_fee: string | null
  currency: Currency | null
}

export interface PremieringCategory {
  id: number
  name: string
  slug: string
  description: string | null
  avatar_url: string | null
  cover_url: string | null
  order: number
  status: 'active' | 'inactive' | 'archived'
  created_at: string
  updated_at: string | null
  deleted_at: string | null
  projects?: {
    data: Project[]
    pagination?: {
      currentPage: number
      lastPage: number
      perPage: number
      total: number
    }
  }
}
