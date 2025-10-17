// composables/premiering/useVideoProcessingStatus.ts
import { onMounted, onUnmounted } from 'vue'
import { usePusher } from '../usePusher'
import { useMainVideoPremieringStore } from '~/stores/premiering/mainVideoPremieringStoreDELETE'
import { useTrailerVideoPremieringStore } from '~/stores/premiering/trailerVideoPremieringStoreDELETE'
import { useProjectPremieringStore } from '~/stores/premiering/projectPremieringStoreDELETE'

export function useVideoProcessingStatus(accessUuid: string) {
  const { subscribeTo, unsubscribeFrom } = usePusher()
  const mainVideoStore = useMainVideoPremieringStore()
  const trailerVideoStore = useTrailerVideoPremieringStore()
  const projectStore = useProjectPremieringStore()

  let processingChannel: any = null

  function initializeProcessingChannel() {
    if (!processingChannel) {
      processingChannel = subscribeTo('video-processing')

      processingChannel.bind(
        'VideoProcessed',
        (data: {
          project: {
            id: number
            access_uuid: string
            name: string
            project_url: string | null
            trailer_url: string | null
            main_upload_status:
              | 'pending'
              | 'processing'
              | 'completed'
              | 'failed'
            trailer_upload_status:
              | 'pending'
              | 'processing'
              | 'completed'
              | 'failed'
          }
          status: 'pending' | 'processing' | 'completed' | 'failed'
          fileType: 'main' | 'trailer'
          manifestUrl: string | null
          message: string
        }) => {
          const { project: updatedProject, status, fileType, message } = data

          if (!updatedProject || updatedProject.access_uuid !== accessUuid)
            return

          // Update project store
          projectStore.updateProject(updatedProject)

          // Update respective video store
          if (fileType === 'main') {
            mainVideoStore.handleProcessingUpdate(status, message)
          } else {
            trailerVideoStore.handleProcessingUpdate(status, message)
          }
        }
      )

      processingChannel.bind('pusher:subscription_succeeded', () => {
        console.log('Subscribed to video processing channel')
      })

      processingChannel.bind('pusher:subscription_error', (error: any) => {
        console.error('Error subscribing to video processing channel:', error)
      })
    }
  }

  function cleanup() {
    if (processingChannel) {
      unsubscribeFrom('video-processing')
      processingChannel = null
    }
  }

  onMounted(() => {
    initializeProcessingChannel()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    initializeProcessingChannel,
    cleanup,
  }
}
