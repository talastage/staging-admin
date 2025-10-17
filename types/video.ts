// types/video.ts
export interface Creator {
  id: number
  username: string
  profile_photo: string
  display_name?: string
}

export interface Video {
  id: number
  thumbnail_url: string
  video_url: string
  access_uuid: string
  creator?: Creator
  name: string
  views_count: number
  created_at: string
}
