// stores/premiereUpload.ts
import { defineStore } from 'pinia'

interface UploadState {
  mainVideo: {
    isUploading: boolean
    isS3UploadComplete: boolean
    uploadProgress: number
    processingStatus: 'idle' | 'processing' | 'completed' | 'failed'
  }
  trailerVideo: {
    isUploading: boolean
    isS3UploadComplete: boolean
    uploadProgress: number
    processingStatus: 'idle' | 'processing' | 'completed' | 'failed'
  }
}

export const usePremiereUploadStore = defineStore('premiereUpload', {
  state: (): UploadState => ({
    mainVideo: {
      isUploading: false,
      isS3UploadComplete: false,
      uploadProgress: 0,
      processingStatus: 'idle',
    },
    trailerVideo: {
      isUploading: false,
      isS3UploadComplete: false,
      uploadProgress: 0,
      processingStatus: 'idle',
    },
  }),

  actions: {
    setUploadState(
      fileType: 'main' | 'trailer',
      state: Partial<UploadState['mainVideo']>
    ) {
      const video = fileType === 'main' ? this.mainVideo : this.trailerVideo
      Object.assign(video, state)
    },

    resetUploadState(fileType: 'main' | 'trailer') {
      const defaultState = {
        isUploading: false,
        isS3UploadComplete: false,
        uploadProgress: 0,
        processingStatus: 'idle',
      }

      if (fileType === 'main') {
        this.mainVideo = { ...defaultState }
      } else {
        this.trailerVideo = { ...defaultState }
      }
    },
  },

  getters: {
    getUploadState: (state) => {
      return (fileType: 'main' | 'trailer') =>
        fileType === 'main' ? state.mainVideo : state.trailerVideo
    },
  },
})
