//stores/useInvestments.ts

import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'

interface Investment {
  id: number
  investor_id: number
  share_percentage: number
  status: string
  investable_type: 'App\\Models\\Project' | 'App\\Models\\User'
  investable: {
    id: number
    name?: string
    username?: string
    display_name?: string
    access_uuid?: string
    thumbnail_url?: string
    video_url?: string
    profile_photo?: string
    created_at?: string
    views_count?: number
  }
  is_creator: boolean
  notes?: string
  approved_at?: string
  rejected_at?: string
  removed_at?: string
  created_at: string
  updated_at: string
}

interface PaginationMeta {
  current_page: number
  last_page: number
  total_pages: number
  total_items: number
  per_page: number
}

interface ApiResponse {
  data: Investment[]
  pagination: {
    meta: PaginationMeta
  }
}

export const useInvestmentsStore = defineStore('investments', {
  state: () => ({
    investments: [] as Investment[],
    currentPage: 1,
    lastPage: 1,
    isLoading: false,
    error: null as string | null,
    filter: 'all',
    lastUpdated: null as Date | null,
  }),

  getters: {
    hasMorePages: (state): boolean => state.currentPage < state.lastPage,

    filteredInvestments: (state): Investment[] => {
      if (!state.investments) return []
      if (state.filter === 'all') return state.investments
      return state.investments.filter(
        (investment) => investment.investable_type === state.filter
      )
    },

    pendingInvestments: (state): Investment[] =>
      state.investments.filter((inv) => inv.status === 'pending'),

    approvedInvestments: (state): Investment[] =>
      state.investments.filter((inv) => inv.status === 'approved'),

    rejectedInvestments: (state): Investment[] =>
      state.investments.filter((inv) => inv.status === 'rejected'),

    totalInvestments: (state): number => state.investments.length,

    isStale: (state): boolean => {
      if (!state.lastUpdated) return true
      const staleThreshold = 5 * 60 * 1000 // 5 minutes
      return Date.now() - state.lastUpdated.getTime() > staleThreshold
    },
  },

  actions: {
    async fetchInvestments({ page = 1, filter = this.filter } = {}) {
      const { $axios } = useNuxtApp()

      if (this.isLoading) return

      this.isLoading = true
      this.error = null

      try {
        const response = await $axios.get<ApiResponse>(
          '/api/user/investments',
          {
            params: {
              page,
              filter: filter !== 'all' ? filter : undefined,
              per_page: 15,
            },
          }
        )

        if (page === 1) {
          this.investments = response.data.data
        } else {
          const newInvestments = response.data.data.filter(
            (newInv) =>
              !this.investments.some((existing) => existing.id === newInv.id)
          )
          this.investments = [...this.investments, ...newInvestments]
        }

        this.currentPage = response.data.pagination.meta.current_page
        this.lastPage =
          response.data.pagination.meta.last_page ||
          response.data.pagination.meta.total_pages
        this.filter = filter
        this.lastUpdated = new Date()

        return response.data
      } catch (error: any) {
        this.error =
          error.response?.data?.message || 'Failed to fetch investments'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async approveInvestment(investmentId: number) {
      const { $axios } = useNuxtApp()

      try {
        const response = await $axios.post(
          `/api/user/investments/${investmentId}/approve`
        )
        this.updateInvestment(response.data.investment)
        return response.data
      } catch (error: any) {
        throw new Error(
          error.response?.data?.message || 'Failed to approve investment'
        )
      }
    },

    async rejectInvestment(investmentId: number, notes: string) {
      const { $axios } = useNuxtApp()

      try {
        const response = await $axios.post(
          `/api/user/investments/${investmentId}/reject`,
          {
            notes,
          }
        )
        this.updateInvestment(response.data.investment)
        return response.data
      } catch (error: any) {
        throw new Error(
          error.response?.data?.message || 'Failed to reject investment'
        )
      }
    },

    clearInvestments() {
      this.investments = []
      this.currentPage = 1
      this.lastPage = 1
      this.error = null
      this.lastUpdated = null
    },

    setFilter(filter: string) {
      if (this.filter === filter) return
      this.filter = filter
      this.currentPage = 1
      this.fetchInvestments({ page: 1, filter })
    },

    updateInvestment(updatedInvestment: Partial<Investment> & { id: number }) {
      const index = this.investments.findIndex(
        (inv) => inv.id === updatedInvestment.id
      )
      if (index !== -1) {
        this.investments[index] = {
          ...this.investments[index],
          ...updatedInvestment,
        }
      }
    },

    removeInvestment(investmentId: number) {
      this.investments = this.investments.filter(
        (inv) => inv.id !== investmentId
      )
    },

    async refreshIfStale() {
      if (this.isStale) {
        await this.fetchInvestments({ page: 1 })
      }
    },

    sortInvestments(
      sortBy: 'created_at' | 'share_percentage' | 'status',
      ascending = true
    ) {
      this.investments.sort((a, b) => {
        let comparison = 0

        switch (sortBy) {
          case 'created_at':
            comparison =
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
            break
          case 'share_percentage':
            comparison = a.share_percentage - b.share_percentage
            break
          case 'status':
            comparison = a.status.localeCompare(b.status)
            break
        }

        return ascending ? comparison : -comparison
      })
    },
  },
})
