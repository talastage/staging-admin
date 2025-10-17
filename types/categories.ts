// types/categories.ts
export interface TalentCategory {
  id: number
  name: string
  slug: string
  avatar_url: string | null
}

export interface Talent {
  id: number
  name: string
  category_id: number
  slug: string
  avatar_url: string
}
