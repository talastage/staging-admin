// stores/userProjectsStore.ts
import { defineStore } from 'pinia'

interface Project {
  id: number
  name: string
  video_url: string | Record<string, never>
  access_uuid: string
  thumbnail_url: string | Record<string, never>
  source: string
  created_at: string
  views_count: number
}

interface PaginationResponse {
  projects: Project[]
  pagination: {
    total: number
    per_page: number
    current_page: number
    last_page: number
    from: number
    to: number
  }
}

export const useUserProjectsStore = defineStore('userProjects', {
  state: () => ({
    projects: [] as Project[],
    pagination: {
      currentPage: 1,
      lastPage: 1,
      total: 0,
      perPage: 12,
      from: 1,
      to: 12,
    },
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    hasMorePages: (state) =>
      state.pagination.currentPage < state.pagination.lastPage,
    totalProjects: (state) => state.pagination.total,
  },

  actions: {
    resetState() {
      this.projects = []
      this.pagination = {
        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 12,
        from: 1,
        to: 12,
      }
      this.isLoading = false
      this.error = null
    },

    async fetchProjects(username: string) {
      // Don't fetch if loading or no more pages
      if (this.isLoading || (!this.hasMorePages && this.projects.length > 0))
        return

      this.isLoading = true
      this.error = null
      const { $axios } = useNuxtApp()

      try {
        const { data } = await $axios.get<PaginationResponse>(
          `/api/user/${username}/projects`,
          {
            params: {
              page: this.pagination.currentPage,
            },
          }
        )

        // For first page, replace projects. For subsequent pages, append
        if (this.pagination.currentPage === 1) {
          this.projects = data.projects
        } else {
          this.projects = [...this.projects, ...data.projects]
        }

        // Update pagination state from response
        this.pagination = {
          currentPage: data.pagination.current_page + 1, // Increment for next page
          lastPage: data.pagination.last_page,
          total: data.pagination.total,
          perPage: data.pagination.per_page,
          from: data.pagination.from,
          to: data.pagination.to,
        }
      } catch (err) {
        console.error('Error fetching projects:', err)
        this.error = err?.response?.data?.message || 'Failed to fetch projects'
        throw err
      } finally {
        this.isLoading = false
      }
    },
  },
})
