// composables/useUpcomingPremieres.ts
import { useNuxtApp } from '#app'
import type { PremieresResponse } from '@/types/premiere'

export function useUpcomingPremieres() {
  const nuxtApp = useNuxtApp()

  const fetchUpcomingPremieres = async (
    page: number
  ): Promise<PremieresResponse> => {
    if (!nuxtApp.$api) {
      throw new Error('API plugin not available')
    }

    try {
      const data = await nuxtApp.$api.get('/api/upcoming/premieres', {
        params: { page, per_page: 12 },
      })
      return data
    } catch (error) {
      console.error('Error fetching premieres:', error)
      throw error
    }
  }

  const fetchNotifiedUpcomingPremieres = async (
    page: number
  ): Promise<PremieresResponse> => {
    if (!nuxtApp.$api) {
      throw new Error('API plugin not available')
    }

    try {
      const data = await nuxtApp.$api.get('/api/upcoming/premieres/notified', {
        params: { page, per_page: 12 },
      })
      return data
    } catch (error) {
      console.error('Error fetching notified premieres:', error)
      throw error
    }
  }

  return {
    fetchUpcomingPremieres,
    fetchNotifiedUpcomingPremieres,
  }
}
