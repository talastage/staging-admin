export interface ProjectWatch {
    id: number
    access_uuid: string
    name: string
    thumbnail_url: string
    video_url: string
    duration: number | null
    playback_error: string | null
    is_ready: boolean
  }
  
  // If you need a response type that includes the Laravel resource wrapper
  export interface ProjectWatchResponse {
    data: ProjectWatch
  }
  
  // Optional: Additional types if you need to handle the upload status separately
  export type UploadStatus = 'pending' | 'processing' | 'completed' | 'failed'
  
  // Optional: Full project type if you need internal properties
  export interface ProjectWatchFull extends ProjectWatch {
    main_upload_status: UploadStatus
    trailer_upload_status: UploadStatus
  }