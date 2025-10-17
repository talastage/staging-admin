// composables/premiering/useVideoProcessingUpdates.ts
import { onMounted, onUnmounted } from 'vue'
import { usePusher } from '../usePusher'
import { useMainVideoPremieringStore } from '~/stores/premiering/mainVideoPremieringStoreDELETE'
import { useTrailerVideoPremieringStore } from '~/stores/premiering/trailerVideoPremieringStoreDELETE'
import { useProjectPremieringPublishStore } from '~/stores/premiering/projectPremieringPublishStoreREMOVE'
import type { VideoProcessingStatus } from '@/types/premiering'

export function useVideoProcessingUpdates(accessUuid: string) {
  const { subscribeTo, unsubscribeFrom } = usePusher()
  const mainVideoStore = useMainVideoPremieringStore()
  const trailerVideoStore = useTrailerVideoPremieringStore()
  const publishStore = useProjectPremieringPublishStore()

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
          message?: string
        }) => {
          const { project, status, fileType, message } = data

          if (!project || project.access_uuid !== accessUuid) return

          // Update project store
          publishStore.updateProject(project)

          // Update respective video store
          const processingStatus: VideoProcessingStatus = { status, message }
          if (fileType === 'main') {
            mainVideoStore.handleProcessingUpdate(processingStatus)
          } else {
            trailerVideoStore.handleProcessingUpdate(processingStatus)
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
