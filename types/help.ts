// types/help.ts
export interface HelpSearchResult {
  id: number
  title: string
  content: string
  slug: string
  category_id: number
  category_name: string
  category_slug: string
  sub_category_id: number
  sub_category_name: string
  sub_category_slug: string
  thumbnail_url: string | null
  created_at: string
}

export interface HelpCategory {
  id: number
  name: string
  slug: string
}

export interface HelpSubCategory {
  id: number
  name: string
  slug: string
}

export interface HelpArticle {
  id: number
  title: string
  content: string
  slug: string
  excerpt?: string
  thumbnail_url?: string
  created_at?: string
  updated_at?: string
  is_popular?: boolean
  category?: HelpCategory
  sub_category?: HelpSubCategory
}

export interface HelpFeedback {
  upvotes: number
  downvotes: number
  userVote: boolean | null
}

export interface FeedbackResponse {
  message: string
  feedback: HelpFeedback
}
