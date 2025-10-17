// types/watch.ts

export interface WatchProject {
  id: number
  access_uuid: string
  name: string
  description: string | null
  thumbnail_url: string
  duration: number | null
  video_url: string
  trailer_url?: string
  is_main_video: boolean
  has_paid_watch_fee: boolean
  type: 'video' | 'audio' | null
  status: 'published' | 'draft' | 'pending'
  payment_status: 'pending' | 'completed' | 'failed'
  watch_fee?: {
    amount: number
    formatted: string
    currency: {
      id: number
      code: string
      symbol: string
    }
  }
  premiering?: {
    utc: string
    localized: string
    timezone: string
    is_future: boolean
  }
  is_notified?: boolean
  creator: {
    id: number
    username: string
    display_name: string
    profile_photo: string
  }
}

// Keep the other interfaces unchanged
export interface WatchResponse {
  status: string
  data: WatchProject
}

export interface PremiereNotification {
  project_id: number
  is_notified: boolean
}

export interface PremiereNotificationResponse {
  status: string
  data: PremiereNotification
}
