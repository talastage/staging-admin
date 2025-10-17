// composables/upload/usePremiereUploadStatus.ts
import { computed } from 'vue'
import { usePremiereUploadStore } from '@/stores/premiereUpload'
import { formatFileSize } from '@/utils/formatters'

export function usePremiereUploadStatus(fileType: 'main' | 'trailer') {
  const store = usePremiereUploadStore()
  const uploadState = computed(() => store.getUploadState(fileType))

  const uploadIcon = computed(() => {
    if (uploadState.value.isS3UploadComplete) return 'mdi-check-circle'
    if (uploadState.value.isUploading) return 'mdi-upload'
    return 'mdi-cloud-upload'
  })

  const uploadIconColor = computed(() => {
    if (uploadState.value.isS3UploadComplete) return 'success'
    if (uploadState.value.isUploading) return 'primary'
    return 'grey'
  })

  const uploadProgressColor = computed(() => {
    if (uploadState.value.isS3UploadComplete) return 'success'
    return 'primary'
  })

  const processingStatus = computed(() => {
    const status = uploadState.value.processingStatus

    switch (status) {
      case 'processing':
        return {
          text: 'Video is being processed...',
          color: 'info',
          icon: 'mdi-cog-sync',
        }
      case 'completed':
        return {
          text: 'Video processing completed',
          color: 'success',
          icon: 'mdi-check-circle',
        }
      case 'failed':
        return {
          text: 'Video processing failed',
          color: 'error',
          icon: 'mdi-alert-circle',
        }
      default:
        return {
          text: '',
          color: 'primary',
          icon: '',
        }
    }
  })

  const formatUploadStatus = (uploadedSize: number, totalSize: number) => {
    if (uploadState.value.isUploading) {
      return {
        text: `Uploading... ${uploadState.value.uploadProgress}%`,
        subText: `${formatFileSize(uploadedSize)} / ${formatFileSize(
          totalSize
        )}`,
      }
    }

    if (uploadState.value.isS3UploadComplete) {
      return {
        text: 'Upload Complete',
        subText: '(Processing in progress...)',
      }
    }

    return {
      text: '',
      subText: '',
    }
  }

  return {
    uploadState,
    uploadIcon,
    uploadIconColor,
    uploadProgressColor,
    processingStatus,
    formatUploadStatus,
  }
}
