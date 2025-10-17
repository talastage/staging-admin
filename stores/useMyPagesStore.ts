// stores/useMyPagesStore.ts
import { defineStore } from 'pinia'

interface Page {
  id: number
  name: string
  slug: string
  type: string
  avatar_url: string | null
}

export const useMyPagesStore = defineStore('myPages', {
  state: () => ({
    pages: [] as Page[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchMyPages() {
      if (this.pages.length > 0) {
        // We already have them
        return
      }
      this.loading = true
      this.error = null
      const { $axios } = useNuxtApp()
      try {
        const { data } = await $axios.get('/api/user/pages')
        // The actual pages array is in data.data
        this.pages = data.data
      } catch (err: any) {
        console.error('Error fetching pages:', err)
        this.error = err.response?.data?.message || 'Failed to fetch pages'
      } finally {
        this.loading = false
      }
    },
  },
})
