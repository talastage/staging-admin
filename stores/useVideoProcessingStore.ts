// stores/useVideoProcessingStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

interface VideoProcessedEvent {
  project: {
    id: number
    name: string
    main_upload_status: string
    [key: string]: any
  }
  timestamp: string
  event_type: string
  channel: string
}

export const useVideoProcessingStore = defineStore('videoProcessing', () => {
  const events = ref<VideoProcessedEvent[]>([])
  const isSubscribed = ref(false)
  const { subscribeToChannel, unsubscribeFromChannel } = usePusher()

  const setupVideoProcessingChannel = () => {
    const channel = subscribeToChannel('video-processing')

    channel?.bind('pusher:subscription_succeeded', () => {
      isSubscribed.value = true
      console.log('Subscribed to video-processing channel')
    })

    channel?.bind('VideoProcessed', (data: VideoProcessedEvent) => {
      console.log('Received VideoProcessed event:', data)
      events.value.unshift({
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
      })
    })

    return () => {
      channel?.unbind_all()
      unsubscribeFromChannel('video-processing')
      isSubscribed.value = false
    }
  }

  const clearEvents = () => {
    events.value = []
  }

  return {
    events,
    isSubscribed,
    setupVideoProcessingChannel,
    clearEvents,
  }
})
