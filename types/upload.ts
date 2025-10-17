// types/upload.ts
export type UploadState =
  | 'idle'
  | 'preparing'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed'

export interface UploadStats {
  startTime: number
  bytesUploaded: number
  totalBytes: number
  currentSpeed: number
  progress: number
  estimatedTimeLeft: number
}

export interface S3UploadOptions {
  onProgress: (progress: number, uploaded: number) => void
  onError: (error: Error) => void
}
