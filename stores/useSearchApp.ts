// stores/useSearchApp.ts
import { debounce } from 'lodash-es'

export const useSearchApp = defineStore('searchApp', {
  state: () => ({
    searchResults: {
      projects: {
        results: [],
        total: 0,
        current_page: 1,
        per_page: 18,
        last_page: 1,
      },
      users: {
        results: [],
        total: 0,
        current_page: 1,
        per_page: 18,
        last_page: 1,
      },
    },
    loading: false,
    error: null as string | null,
    lastQuery: '' as string,
  }),

  actions: {
    async search(query: string, page: number = 1) {
      const trimmedQuery = query.trim()
      if (!trimmedQuery) return

      // Avoid duplicate searches
      if (page === 1 && this.lastQuery === trimmedQuery && this.searchResults.users.results.length > 0) {
        return this.searchResults
      }

      this.loading = true
      this.error = null
      this.lastQuery = trimmedQuery

      try {
        const { $axios } = useNuxtApp()
        const response = await $axios.get('/api/search/app', {
          params: { query: trimmedQuery, page },
        })

        // Update the state with the response data
        if (page === 1) {
          this.searchResults = {
            projects: {
              results: response.data.projects.results || [],
              total: response.data.projects.total,
              current_page: response.data.projects.current_page,
              per_page: response.data.projects.per_page,
              last_page: response.data.projects.last_page,
            },
            users: {
              results: response.data.users.results || [],
              total: response.data.users.total,
              current_page: response.data.users.current_page,
              per_page: response.data.users.per_page,
              last_page: response.data.users.last_page,
            },
          }
        } else {
          // Append results for pagination
          this.searchResults = {
            projects: {
              ...this.searchResults.projects,
              results: [
                ...this.searchResults.projects.results,
                ...(response.data.projects.results || []),
              ],
            },
            users: {
              ...this.searchResults.users,
              results: [
                ...this.searchResults.users.results,
                ...(response.data.users.results || []),
              ],
            },
          }
        }

        return this.searchResults
      } catch (error) {
        console.error('Search error:', error)
        this.error = 'Failed to perform search'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Debounced search for real-time search
    debouncedSearch: debounce(function(this: any, query: string, page: number = 1) {
      return this.search(query, page)
    }, 300),

    clearResults() {
      this.searchResults = {
        projects: {
          results: [],
          total: 0,
          current_page: 1,
          per_page: 18,
          last_page: 1,
        },
        users: {
          results: [],
          total: 0,
          current_page: 1,
          per_page: 18,
          last_page: 1,
        },
      }
      this.error = null
      this.lastQuery = ''
    },
  },
})
