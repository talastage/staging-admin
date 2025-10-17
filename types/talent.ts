// types/talent.ts

export interface Talent {
  id: number
  name: string
  category_id: number
  slug: string | null
  avatar_url: string | null
  cover_url: string | null
  description: string | null
  order: number
  status: 'active' | 'inactive' | 'archived'
  created_at: string
  updated_at: string
}
