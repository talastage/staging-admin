export const getUploadStatusMessage = (
  status: string,
  type: 'main' | 'trailer'
) => {
  const videoType = type === 'main' ? 'main video' : 'trailer'

  switch (status) {
    case 'pending':
      return `Please upload your ${videoType}`
    case 'uploading':
      return `${
        videoType.charAt(0).toUpperCase() + videoType.slice(1)
      } is currently uploading. Please wait for completion`
    case 'processing':
      return `${
        videoType.charAt(0).toUpperCase() + videoType.slice(1)
      } is being processed. Please wait`
    case 'failed':
      return `${
        videoType.charAt(0).toUpperCase() + videoType.slice(1)
      } upload failed. Please try again`
    default:
      return `${
        videoType.charAt(0).toUpperCase() + videoType.slice(1)
      } status unknown`
  }
}
