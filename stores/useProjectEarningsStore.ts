// stores/useProjectEarningsStore.ts
import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'

interface Currency {
  id: number
  name: string
  symbol: string
  code: string
}

interface EarningSummary {
  currency: Currency
  total_transactions: number
  total_amount: string
  total_fees: string
  [key: string]: any
}

interface Transaction {
  id: number
  amount: string
  app_service_fee: string
  currency: Currency
  type: string
  status: string
  created_at: string
}

interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export const useProjectEarningsStore = defineStore('projectEarningsStore', {
  state: () => ({
    loading: false,
    error: null as string | null,
    // Cache summaries by accessUuid
    summaries: {} as Record<
      string,
      { data: EarningSummary; fetchedAt: number }
    >,
    // Cache transactions by accessUuid -> page
    transactionsCache: {} as Record<
      string,
      Record<
        number,
        {
          data: Transaction[]
          pagination: PaginationMeta
          fetchedAt: number
        }
      >
    >,
  }),

  getters: {
    hasSummary: (state) => (accessUuid: string) =>
      !!state.summaries[accessUuid],
    getSummary: (state) => (accessUuid: string) =>
      state.summaries[accessUuid]?.data,

    getTransactions: (state) => (accessUuid: string, page: number) =>
      state.transactionsCache[accessUuid]?.[page]?.data || [],

    getPagination: (state) => (accessUuid: string, page: number) =>
      state.transactionsCache[accessUuid]?.[page]?.pagination || null,
  },

  actions: {
    async fetchEarningsSummary(accessUuid: string, force = false) {
      const { $axios } = useNuxtApp()
      if (!force && this.summaries[accessUuid]) return

      this.loading = true
      this.error = null

      try {
        const res = await $axios.get(
          `/api/projects/${accessUuid}/earnings/summary`
        )
        this.summaries[accessUuid] = {
          data: res.data.data,
          fetchedAt: Date.now(),
        }
      } catch (err: any) {
        this.error =
          err.response?.data?.error || 'Failed to fetch earnings summary'
      } finally {
        this.loading = false
      }
    },

    async fetchTransactions(
      accessUuid: string,
      page: number,
      perPage = 15,
      force = false
    ) {
      const { $axios } = useNuxtApp()
      const existing = this.transactionsCache[accessUuid]?.[page]

      // Simple check: if we have data and not forcing, skip fetch
      if (!force && existing) return

      this.loading = true
      this.error = null

      try {
        const res = await $axios.get(
          `/api/projects/${accessUuid}/earnings/transactions`,
          {
            params: { page, per_page: perPage },
          }
        )
        if (!this.transactionsCache[accessUuid]) {
          this.transactionsCache[accessUuid] = {}
        }
        this.transactionsCache[accessUuid][page] = {
          data: res.data.data,
          pagination: res.data.meta,
          fetchedAt: Date.now(),
        }
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to fetch transactions'
      } finally {
        this.loading = false
      }
    },
  },
})
