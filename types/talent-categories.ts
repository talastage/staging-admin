// types/talent-categories.ts
export interface TalentCategory {
  id: number
  name: string
  slug: string
  avatar_url: string | null
  description?: string
  status: 'active' | 'inactive' | 'archived'
  order: number
}

export interface TalentCategoriesResponse {
  data: TalentCategory[]
  meta: {
    current_page: number
    per_page: number
    total_pages: number
    total: number
    has_more_pages: boolean
    scores: Record<number, number>
  }
}
