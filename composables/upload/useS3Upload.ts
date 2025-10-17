// composables/upload/useS3Upload.ts
export function useS3Upload() {
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

  const cancelUpload = () => {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
    }
  }

  onUnmounted(() => {
    cancelUpload()
  })

  return {
    uploadToS3,
    cancelUpload,
  }
}
