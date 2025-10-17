import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * This store keeps a map of (uniqueId => HTMLVideoElement).
 * Whenever a video starts playing, we can call pauseAllExcept(id)
 * so that only one video plays at a time.
 */
export const useVideoPlaybackManagerStore = defineStore(
  'videoPlaybackManager',
  () => {
    // Store a Map of ID -> <video> element
    const players = ref<Map<string, HTMLVideoElement>>(new Map())

    function registerPlayer(id: string, videoEl: HTMLVideoElement) {
      players.value.set(id, videoEl)
    }

    function unregisterPlayer(id: string) {
      players.value.delete(id)
    }

    /**
     * Pauses all videos except the one with the given ID
     */
    function pauseAllExcept(id: string) {
      for (const [playerId, el] of players.value.entries()) {
        if (playerId !== id) {
          el.pause()
        }
      }
    }

    return { registerPlayer, unregisterPlayer, pauseAllExcept }
  }
)
