// composables/upload/usePremiereUpload.ts
import { ref } from 'vue'
import { usePremiereUploadStore } from '@/stores/premiereUpload'
import { formatFileSize, formatTimeRemaining } from '@/utils/formatters'

export function usePremiereUpload(fileType: 'main' | 'trailer') {
  const store = usePremiereUploadStore()
  const uploadStartTime = ref(0)
  const uploadedSize = ref(0)
  const totalSize = ref(0)
  const abortController = ref<AbortController | null>(null)

  const uploadToS3 = (
    file: File,
    presignedUrl: string,
    onProgress?: (progress: number, loaded: number) => void
  ): Promise<XMLHttpRequest> => {
    abortController.value = new AbortController()
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100)
          onProgress(progress, event.loaded)
        }
      })
      xhr.onload = () => resolve(xhr)
      xhr.onerror = () => reject(new Error('Upload failed'))
      xhr.open('PUT', presignedUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(file)
    })
  }

  const validateVideo = (
    file: File,
    maxSize: number
  ): { isValid: boolean; error: string | null } => {
    if (!file.type.startsWith('video/')) {
      return { isValid: false, error: 'Please upload a video file.' }
    }
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size exceeds the maximum limit of ${formatFileSize(
          maxSize
        )}.`,
      }
    }
    return { isValid: true, error: null }
  }

  const updateProgress = (loaded: number, total: number) => {
    if (!uploadStartTime.value) {
      uploadStartTime.value = Date.now()
    }
    uploadedSize.value = loaded
    totalSize.value = total
    const progress = Math.round((loaded / total) * 100)
    store.setUploadState(fileType, { uploadProgress: progress })
  }

  const cancelUpload = () => {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
    }
    resetUpload()
  }

  const resetUpload = () => {
    store.resetUploadState(fileType)
    uploadStartTime.value = 0
    uploadedSize.value = 0
    totalSize.value = 0
    abortController.value = null
  }

  const getEstimatedTimeLeft = (): string => {
    const progress = store.getUploadState(fileType).uploadProgress
    if (progress === 0) return 'Calculating...'
    const elapsedTime = (Date.now() - uploadStartTime.value) / 1000
    const totalTime = elapsedTime / (progress / 100)
    const remainingTime = totalTime - elapsedTime
    return formatTimeRemaining(remainingTime)
  }

  return {
    uploadToS3,
    validateVideo,
    updateProgress,
    cancelUpload,
    resetUpload,
    getEstimatedTimeLeft,
    uploadedSize,
    totalSize,
  }
}
