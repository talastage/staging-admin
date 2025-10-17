// stores\useProjectInvestorsStore.ts

import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'

interface ProjectInvestor {
  id: number
  project_id: number
  investorable_type: string
  investorable_id: number
  share_percentage: number
  status: string
  created_at?: string
  updated_at?: string
  investorable?: any
}

interface Stats {
  creator_shares: number
  investor_shares: number
  total_investors: number
}

interface ProjectInvestorApiResponse {
  status: string
  message: string
  data: ProjectInvestor[]
  meta?: {
    total?: number
    pages?: number
  }
  stats?: Stats
}

interface ApiErrorResponse {
  status: string
  message: string
  errors?: Record<string, string[]>
}

interface ProjectInvestorsState {
  projectInvestors: ProjectInvestor[]
  stats: Stats | null
  meta: {
    total: number
    pages: number
    current_page: number
    last_page: number
  } | null
  isLoading: boolean
  error: string | null
}

export const useProjectInvestorsStore = defineStore('projectInvestors', {
  state: (): ProjectInvestorsState => ({
    projectInvestors: [],
    stats: null,
    meta: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    hasMore: (state) => {
      if (!state.meta) return false
      return state.meta.current_page < state.meta.last_page
    },
  },

  actions: {
    // Fetch a paginated list of project investors
    async fetchProjectInvestors(accessUuid: string, page = 1, perPage = 15) {
      this.isLoading = page === 1
      this.error = null
      try {
        const { $axios } = useNuxtApp()
        const response = await $axios.get<ProjectInvestorApiResponse>(
          `/api/projects/${accessUuid}/project_investors`,
          {
            params: { page, per_page: perPage },
          }
        )

        // If page=1, reset; otherwise, append
        if (page === 1) {
          this.projectInvestors = response.data.data
        } else {
          this.projectInvestors = [
            ...this.projectInvestors,
            ...response.data.data,
          ]
        }

        // Prepare meta
        const total = response.data.meta?.total ?? 0
        const pages = response.data.meta?.pages ?? 1
        // Track our own current_page and last_page
        this.meta = {
          total,
          pages,
          current_page: page,
          last_page: pages,
        }

        // If the response also returned stats:
        if (response.data.stats) {
          this.stats = response.data.stats
        }
      } catch (error: any) {
        this.error = this.extractErrorMessage(error)
        console.error(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Create a new project_investors record
    async createProjectInvestor(
      accessUuid: string,
      data: {
        investorable_type: string
        investorable_id: number
        share_percentage: number
      }
    ) {
      this.isLoading = true
      this.error = null
      try {
        const { $axios } = useNuxtApp()
        const response = await $axios.post<ProjectInvestorApiResponse>(
          `/api/projects/${accessUuid}/project_investors`,
          data
        )

        const newInvestor: ProjectInvestor = response.data.data
        this.projectInvestors.push(newInvestor)
        if (this.meta && typeof this.meta.total === 'number') {
          this.meta.total++
        }

        if (response.data.stats) {
          this.stats = response.data.stats
        }
        return response.data
      } catch (error: any) {
        console.error('Error creating project investor:', error)
        this.error = this.extractErrorMessage(error)
        throw error // Re-throw for component-level handling
      } finally {
        this.isLoading = false
      }
    },

    // Update an existing project_investors row
    async updateProjectInvestor(
      accessUuid: string,
      investorId: number,
      updateData: Partial<ProjectInvestor>
    ) {
      this.isLoading = true
      this.error = null
      try {
        const { $axios } = useNuxtApp()
        const response = await $axios.put<ProjectInvestorApiResponse>(
          `/api/projects/${accessUuid}/project_investors/${investorId}`,
          updateData
        )

        const updatedInvestor: ProjectInvestor = response.data.data
        const index = this.projectInvestors.findIndex(
          (inv) => inv.id === investorId
        )
        if (index !== -1) {
          this.projectInvestors[index] = {
            ...this.projectInvestors[index],
            ...updatedInvestor,
          }
        }

        if (response.data.stats) {
          this.stats = response.data.stats
        }

        return response.data
      } catch (error: any) {
        console.error('Error updating project investor:', error)
        this.error = this.extractErrorMessage(error)
        throw error // Re-throw for component-level handling
      } finally {
        this.isLoading = false
      }
    },

    // Remove an investor from the project_investors table
    async deleteProjectInvestor(accessUuid: string, investorId: number) {
      this.isLoading = true
      this.error = null
      try {
        if (!accessUuid || !investorId) {
          throw new Error('Missing required parameters')
        }

        const { $axios } = useNuxtApp()
        await $axios.delete<ProjectInvestorApiResponse>(
          `/api/projects/${accessUuid}/project_investors/${investorId}`
        )

        // Remove from local state
        this.projectInvestors = this.projectInvestors.filter(
          (inv) => inv.id !== investorId
        )

        if (this.meta && typeof this.meta.total === 'number') {
          this.meta.total--
        }

        // Optionally fetch updated stats
        try {
          const statsResponse = await $axios.get<ProjectInvestorApiResponse>(
            `/api/projects/${accessUuid}/project_investors/stats`
          )
          if (statsResponse.data.stats) {
            this.stats = statsResponse.data.stats
          }
        } catch (statsError) {
          console.warn('Could not fetch updated stats', statsError)
          // Non-critical error, don't throw
        }
      } catch (error: any) {
        console.error('Error deleting project investor:', error)
        this.error = this.extractErrorMessage(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    extractErrorMessage(error: any): string {
      // Default error message
      let errorMessage = 'Failed to complete the operation. Please try again.'

      if (!error.response) {
        return errorMessage
      }

      const responseData = error.response.data as ApiErrorResponse

      // Check for the main error message first
      if (responseData.message) {
        return responseData.message
      }

      // Check for validation errors in the standardized format
      if (responseData.errors && typeof responseData.errors === 'object') {
        // Get the first error message from any field
        const firstErrorField = Object.keys(responseData.errors)[0]
        if (
          firstErrorField &&
          Array.isArray(responseData.errors[firstErrorField]) &&
          responseData.errors[firstErrorField][0]
        ) {
          return responseData.errors[firstErrorField][0]
        }
      }

      return errorMessage
    },

    // Clear everything in state (useful before a fresh load)
    resetState() {
      this.projectInvestors = []
      this.stats = null
      this.meta = null
      this.isLoading = false
      this.error = null
    },
  },
})
