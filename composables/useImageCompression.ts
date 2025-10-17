// composables/useImageCompression.ts

interface CompressionOptions {
  maxFileSize?: number // Maximum file size allowed (default: 5MB)
  compressionThreshold?: number // Size at which compression begins (default: 2MB)
  targetFileSize?: number // Desired size after compression (default: 1.5MB)
  maxDimension?: number // Maximum width/height (default: 1920px)
  minQuality?: number // Minimum compression quality (default: 0.5)
  startQuality?: number // Starting compression quality (default: 0.9)
  progressCallback?: (progress: number) => void // Callback for progress updates
}

interface CompressionResult {
  compressed: Blob
  originalSize: number
  compressedSize: number
  compressionRatio: number
  wasCompressed: boolean
  dimensions?: { width: number; height: number }
}

export const useImageCompression = () => {
  const DEFAULT_OPTIONS: CompressionOptions = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    compressionThreshold: 2 * 1024 * 1024, // 2MB
    targetFileSize: 1.5 * 1024 * 1024, // 1.5MB
    maxDimension: 1920,
    minQuality: 0.5,
    startQuality: 0.9,
  }

  /**
   * Extracts image metadata
   */
  const getImageMetadata = (
    file: File | Blob
  ): Promise<{ width: number; height: number; type: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          type: file.type,
        })
        URL.revokeObjectURL(img.src)
      }
      img.onerror = () => {
        URL.revokeObjectURL(img.src)
        reject(new Error('Failed to load image for metadata extraction'))
      }
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Compresses an image with progressive quality reduction if needed
   */
  const compressImage = async (
    file: File | Blob,
    options: CompressionOptions = {}
  ): Promise<CompressionResult> => {
    const settings = { ...DEFAULT_OPTIONS, ...options }
    const originalSize = file.size

    // Update progress if callback provided
    const updateProgress = (progress: number) => {
      if (settings.progressCallback) {
        settings.progressCallback(progress)
      }
    }

    updateProgress(10)

    // Return original if smaller than threshold
    if (file.size <= settings.compressionThreshold!) {
      updateProgress(100)
      return {
        compressed: file,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1,
        wasCompressed: false,
      }
    }

    // Validate file size
    if (file.size > settings.maxFileSize!) {
      throw new Error(
        `File size exceeds maximum allowed size of ${
          settings.maxFileSize! / (1024 * 1024)
        }MB`
      )
    }

    updateProgress(20)

    return new Promise((resolve, reject) => {
      const image = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      image.onload = async () => {
        try {
          updateProgress(30)

          // Calculate dimensions
          let { width, height } = image
          const originalDimensions = { width, height }

          if (
            width > settings.maxDimension! ||
            height > settings.maxDimension!
          ) {
            if (width > height) {
              height = Math.round((height * settings.maxDimension!) / width)
              width = settings.maxDimension!
            } else {
              width = Math.round((width * settings.maxDimension!) / height)
              height = settings.maxDimension!
            }
          }

          updateProgress(40)

          // Set canvas dimensions
          canvas.width = width
          canvas.height = height
          ctx!.drawImage(image, 0, 0, width, height)

          updateProgress(50)

          let quality = settings.startQuality!
          let result = canvas.toDataURL('image/jpeg', quality)
          const compressionSteps = 5
          let currentStep = 0

          // Gradually reduce quality until target size is reached
          while (
            result.length > settings.targetFileSize! * 1.37 &&
            quality > settings.minQuality!
          ) {
            currentStep++
            quality = Math.max(
              settings.minQuality!,
              settings.startQuality! -
                (currentStep *
                  (settings.startQuality! - settings.minQuality!)) /
                  compressionSteps
            )
            result = canvas.toDataURL('image/jpeg', quality)

            // Update progress during compression
            updateProgress(
              50 + Math.min(40, (currentStep / compressionSteps) * 40)
            )
          }

          updateProgress(90)

          // Convert to blob
          const response = await fetch(result)
          const compressedBlob = await response.blob()

          updateProgress(100)

          resolve({
            compressed: compressedBlob,
            originalSize,
            compressedSize: compressedBlob.size,
            compressionRatio: compressedBlob.size / originalSize,
            wasCompressed: true,
            dimensions: { width, height },
          })
        } catch (error) {
          reject(error)
        }
      }

      image.onerror = () => reject(new Error('Failed to load image'))
      image.src = URL.createObjectURL(file)
    })
  }

  /**
   * Analyze image quality and dimensions
   */
  const analyzeImage = async (
    file: File | Blob
  ): Promise<{
    dimensions: { width: number; height: number }
    aspectRatio: number
    fileSize: string
    type: string
    isOptimal: boolean
  }> => {
    const metadata = await getImageMetadata(file)
    const fileSizeMB = file.size / (1024 * 1024)

    return {
      dimensions: {
        width: metadata.width,
        height: metadata.height,
      },
      aspectRatio: parseFloat((metadata.width / metadata.height).toFixed(2)),
      fileSize: `${fileSizeMB.toFixed(2)}MB`,
      type: metadata.type,
      isOptimal:
        fileSizeMB < 2 &&
        metadata.width >= 1280 &&
        metadata.height >= 720 &&
        Math.abs(metadata.width / metadata.height - 16 / 9) < 0.1,
    }
  }

  /**
   * Batch process multiple images
   */
  const batchProcessImages = async (
    files: File[] | Blob[],
    options: CompressionOptions = {}
  ): Promise<CompressionResult[]> => {
    const results: CompressionResult[] = []

    for (const file of files) {
      try {
        const result = await compressImage(file, options)
        results.push(result)
      } catch (error) {
        console.error(`Error processing file: ${error}`)
      }
    }

    return results
  }

  return {
    compressImage,
    analyzeImage,
    batchProcessImages,
    getImageMetadata,
  }
}
