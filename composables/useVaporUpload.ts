export const useVaporUpload = () => {
  const { $axios } = useNuxtApp()

  const uploadFile = async (
    file: File | Blob,
    uploadUrlEndpoint: string,
    confirmEndpoint: string,
    options: {
      onProgress?: (progress: number) => void
      onSuccess?: (result: any) => void
      onError?: (error: any) => void
      fileType?: string
    } = {}
  ) => {
    try {
      // Determine file extension and content type
      let extension = 'jpg'
      let contentType = 'application/octet-stream'
      
      if (file instanceof File) {
        extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        contentType = file.type
      } else {
        // For Blob, determine from type
        if (file.type.includes('png')) extension = 'png'
        else if (file.type.includes('jpeg') || file.type.includes('jpg')) extension = 'jpg'
        else if (file.type.includes('mp4')) extension = 'mp4'
        contentType = file.type
      }

      // Get presigned URL with file_type parameter for video uploads
      const params: any = { extension }
      if (options.fileType) {
        params.file_type = options.fileType
      }
      
      const { data: presignedData } = await $axios.get(uploadUrlEndpoint, {
        params
      })

      if (!presignedData.url || !presignedData.key) {
        throw new Error('Invalid presigned URL response')
      }

      // Upload to S3 using XMLHttpRequest for progress tracking
      const uploadPromise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && options.onProgress) {
            const progress = Math.round((event.loaded / event.total) * 100)
            options.onProgress(progress)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response)
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'))
        })

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was aborted'))
        })

        // Configure request
        xhr.open('PUT', presignedData.url)
        xhr.setRequestHeader('Content-Type', contentType)
        
        // Send the file
        xhr.send(file)
      })

      await uploadPromise

      // Confirm upload with backend
      const confirmData: any = {
        photo_key: presignedData.key
      }
      
      if (options.fileType) {
        confirmData.file_type = options.fileType
      }
      
      const { data: result } = await $axios.post(confirmEndpoint, confirmData)

      if (options.onSuccess) {
        options.onSuccess(result)
      }

      return result

    } catch (error: any) {
      console.error('Upload error:', error)
      
      if (options.onError) {
        options.onError(error)
      }
      
      throw error
    }
  }

  return {
    uploadFile
  }
}