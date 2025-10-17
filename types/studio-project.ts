// types/studio-project.ts

export interface Currency {
  id: number
  name: string
  symbol: string
  code: string
}

export interface PremieringCategory {
  id: number
  name: string
  slug: string
  avatar_url: string
}

export interface ProjectPremieringMeta {
  id: number
  file_type: 'main' | 'trailer'
  original_filename: string
  original_extension: string
  original_filesize: number
  original_filesize_formatted: string
  mime_type: string
}

export interface ProjectPremieringLog {
  id: number
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  error_type: string | null
  error_message: string | null
  file_type: 'main' | 'trailer' | null
  context: Record<string, any> | null
}

export interface StudioProject {
  id: number
  access_uuid: string
  user_id: number
  name: string | null
  description: string | null
  thumbnail_url: string | null
  project_url: string | null
  trailer_url: string | null
  watch_fee?: string | null
  currency?: Currency | null
  main_upload_status:
    | 'pending'
    | 'uploading'
    | 'processing'
    | 'completed'
    | 'failed'
  trailer_upload_status:
    | 'pending'
    | 'uploading'
    | 'processing'
    | 'completed'
    | 'failed'
  premiering_category_id: number | null
  premiering_category?: PremieringCategory
  creator_share_percentage: string
  status: 'draft' | 'published'
  premiering_start_date: string | null
  premiering_time: string | null
  payment_status:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'refunded'
    | null
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
  main_meta?: ProjectPremieringMeta | null
  trailer_meta?: ProjectPremieringMeta | null
  logs?: ProjectPremieringLog[]
}
