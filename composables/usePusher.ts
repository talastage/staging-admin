// composables/usePusher.ts
import PusherJs from 'pusher-js'
import { ref, onUnmounted } from 'vue'

export function usePusher() {
  const config = useRuntimeConfig()
  const connectionStatus = ref<'connected' | 'connecting' | 'disconnected'>(
    'disconnected'
  )
  const pusher = ref<PusherJs | null>(null)

  const initializePusher = () => {
    if (!pusher.value) {
      // Debug logging to check if config values are available
      console.log('Pusher Config:', {
        key: config.public.pusherKey,
        cluster: config.public.pusherCluster,
        forceTLS: config.public.pusherForceTLS,
      })

      if (!config.public.pusherKey || !config.public.pusherCluster) {
        console.error(
          'Pusher configuration is missing. Check your environment variables.'
        )
        return
      }

      pusher.value = new PusherJs(config.public.pusherKey, {
        cluster: config.public.pusherCluster,
        forceTLS: config.public.pusherForceTLS ?? true,
        enabledTransports: ['ws', 'wss'],
        // Add auth configuration if you're using private/presence channels
        // authEndpoint: `${config.public.backendUrl}/broadcasting/auth`,
        // auth: {
        //   headers: {
        //     'X-CSRF-TOKEN': 'your-csrf-token',
        //   },
        // },
      })

      // Connection event listeners
      pusher.value.connection.bind('connecting', () => {
        console.log('Pusher connecting...')
        connectionStatus.value = 'connecting'
      })

      pusher.value.connection.bind('connected', () => {
        console.log('Pusher connected successfully!')
        connectionStatus.value = 'connected'
      })

      pusher.value.connection.bind('disconnected', () => {
        console.log('Pusher disconnected')
        connectionStatus.value = 'disconnected'
      })

      pusher.value.connection.bind('error', (error: any) => {
        console.error('Pusher connection error:', error)
        connectionStatus.value = 'disconnected'
      })

      pusher.value.connection.bind('state_change', (states: any) => {
        console.log('Pusher state change:', states)
      })
    }
  }

  const subscribeTo = (channelName: string) => {
    if (!pusher.value) initializePusher()
    if (!pusher.value) return null

    console.log(`Subscribing to channel: ${channelName}`)
    return pusher.value.subscribe(channelName)
  }

  const unsubscribeFrom = (channelName: string) => {
    if (pusher.value) {
      console.log(`Unsubscribing from channel: ${channelName}`)
      pusher.value.unsubscribe(channelName)
    }
  }

  const disconnect = () => {
    if (pusher.value) {
      console.log('Disconnecting Pusher...')
      pusher.value.disconnect()
      pusher.value = null
      connectionStatus.value = 'disconnected'
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    connectionStatus,
    pusher,
    initializePusher,
    subscribeTo,
    unsubscribeFrom,
    disconnect,
  }
}
