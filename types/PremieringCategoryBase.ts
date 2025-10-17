// PremieringCategoryBase.ts
export interface PremieringCategoryBase {
  id: number
  name: string
  slug: string
  description: string | null
  avatar_url: string | null
  cover_url: string | null
  order: number
  status: 'active' | 'inactive' | 'archived'
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
}
