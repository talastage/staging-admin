// stores/uploadStore.ts
export const useUploadStore = defineStore('upload', () => {
  const videoUploading = ref(false)
  const videoProgress = ref(0)
  const s3UploadComplete = ref(false)
  const processingStatus = ref<'idle' | 'processing' | 'completed' | 'failed'>(
    'idle'
  )

  const setUploadState = (state: {
    isUploading?: boolean
    progress?: number
    isS3Complete?: boolean
    status?: typeof processingStatus.value
  }) => {
    if (typeof state.isUploading !== 'undefined')
      videoUploading.value = state.isUploading
    if (typeof state.progress !== 'undefined')
      videoProgress.value = state.progress
    if (typeof state.isS3Complete !== 'undefined')
      s3UploadComplete.value = state.isS3Complete
    if (typeof state.status !== 'undefined')
      processingStatus.value = state.status
  }

  const resetState = () => {
    videoUploading.value = false
    videoProgress.value = 0
    s3UploadComplete.value = false
    processingStatus.value = 'idle'
  }

  return {
    videoUploading,
    videoProgress,
    s3UploadComplete,
    processingStatus,
    setUploadState,
    resetState,
  }
})
