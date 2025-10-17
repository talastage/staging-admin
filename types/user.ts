interface User {
  id: number
  first_name: string
  last_name: string
  username: string
  profile_photo: string
  display_name: string

  // Updated: has_talent is now an enum string, not boolean
  has_talent: 'yes' | 'no' | 'undecided'

  talent: string | null
  talent_details: any | null
  email: string
  phone: string
  country_id: number
  has_self_investment: boolean
  can_change_username: boolean
  next_username_change_date: string | null
  role: UserRole
  is_fanned_by_auth_user: boolean
  is_fanning_auth_user: boolean
  created_at: string
  updated_at: string
}

interface UserRole {
  id: number
  name: string
  slug: string
}

export interface UserProfile {
  id: number
  username: string
  display_name: string
  profile_photo: string | null
  has_talent: 'yes' | 'no' | 'undecided'
  talent: string
  is_fanned_by_auth_user: boolean
  is_fanning_auth_user: boolean
}
