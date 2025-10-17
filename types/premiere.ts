// types/premiere.ts
export interface Creator {
  id: number
  username: string
  display_name: string
  profile_photo: string
}

export interface Premiering {
  utc: string
  localized: string
  timezone: string
  is_future: boolean
}

export interface UpcomingPremiere {
  id: number
  access_uuid: string
  name: string
  thumbnail_url: string
  video_url: string
  premiering_start_date: string
  premiering_time: string
  time_zone: string
  status: string
  payment_status: string
  is_notified: boolean
  premiering: Premiering
  creator: Creator
}

export interface PremieresResponse {
  data: UpcomingPremiere[]
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    links: Array<{
      url: string | null
      label: string
      active: boolean
    }>
    path: string
    per_page: number
    to: number
    total: number
  }
  status: string
  message: string
}
