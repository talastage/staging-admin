import { defineStore } from 'pinia'

interface ProjectCredit {
  id: number
  user: {
    id: number
    username: string
    display_name: string
    profile_photo: string
    talent: string
  }
  role: {
    id: number | null
    name: string
    is_custom: boolean
    category: {
      id: number
      name: string
    } | null
  }
  status: string
  created_at: string
}

interface CategoryGroup {
  category: {
    id: number
    name: string
  }
  credits: ProjectCredit[]
}

interface ProjectCreditState {
  categoryGroups: CategoryGroup[]
  isLoading: boolean
  error: string | null
  page: number
  hasMorePages: boolean
  perPage: number
  totalMembers: number
}

export const useProjectCreditStore = defineStore('projectCredits', {
  state: (): ProjectCreditState => ({
    categoryGroups: [],
    isLoading: false,
    error: null,
    page: 1,
    hasMorePages: true,
    perPage: 16,
    totalMembers: 0,
  }),

  actions: {
    async fetchCredits(projectAccessUuid: string, page = 1) {
      this.isLoading = true
      this.error = null
      const { $axios } = useNuxtApp()

      try {
        const { data } = await $axios.get(
          `/guest/projects/${projectAccessUuid}/credits`,
          {
            params: {
              page,
              per_page: this.perPage,
            },
          }
        )

        // Update total members
        this.totalMembers = data.meta.total_members

        // Handle pagination
        this.hasMorePages = data.meta.current_page < data.meta.last_page
        this.page = data.meta.current_page

        // Merge new data
        if (page === 1) {
          this.categoryGroups = data.data
        } else {
          this.mergeNewGroups(data.data)
        }

        return data.data
      } catch (error: any) {
        this.error = error?.response?.data?.message || error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async addCredit(projectAccessUuid: string, creditData: any) {
      this.isLoading = true
      this.error = null
      const { $axios } = useNuxtApp()

      try {
        const { data } = await $axios.post(
          `/api/projects/${projectAccessUuid}/credits`,
          creditData,
          {
            headers: {
              Accept: 'application/json',
            },
          }
        )

        // Add to local state immediately
        this.addCreditToState(data.data)
        return data.data
      } catch (error: any) {
        this.error = error?.response?.data?.message || 'Failed to add credit'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateCredit(
      projectAccessUuid: string,
      creditId: number,
      creditData: any
    ) {
      this.isLoading = true
      this.error = null
      const { $axios } = useNuxtApp()

      try {
        const { data } = await $axios.patch(
          `/api/projects/${projectAccessUuid}/credits/${creditId}`,
          creditData,
          {
            headers: {
              Accept: 'application/json',
            },
          }
        )

        // Update local state immediately
        this.updateCreditInState(data.data)
        return data.data
      } catch (error: any) {
        this.error = error?.response?.data?.message || 'Failed to update credit'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteCredit(projectAccessUuid: string, creditId: number) {
      this.isLoading = true
      this.error = null
      const { $axios } = useNuxtApp()

      try {
        await $axios.delete(
          `/api/projects/${projectAccessUuid}/credits/${creditId}`,
          {
            headers: {
              Accept: 'application/json',
            },
          }
        )

        // Update local state immediately - no page refresh needed
        this.removeCreditFromState(creditId)
        return true
      } catch (error: any) {
        this.error = error?.response?.data?.message || 'Failed to delete credit'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Efficient state management methods
    addCreditToState(credit: ProjectCredit) {
      const categoryId = credit.role?.category?.id
      const categoryName = credit.role?.category?.name || 'Uncategorized'

      // Find existing category group
      let targetGroup = this.categoryGroups.find(
        (group) => group.category.id === categoryId
      )

      if (targetGroup) {
        // Add to existing category at the beginning
        targetGroup.credits.unshift(credit)
      } else {
        // Create new category group
        this.categoryGroups.unshift({
          category: {
            id: categoryId || 0,
            name: categoryName,
          },
          credits: [credit],
        })
      }

      // Update total count
      this.totalMembers++
    },

    updateCreditInState(updatedCredit: ProjectCredit) {
      for (const group of this.categoryGroups) {
        const creditIndex = group.credits.findIndex(
          (credit) => credit.id === updatedCredit.id
        )

        if (creditIndex !== -1) {
          // Check if category changed
          const newCategoryId = updatedCredit.role?.category?.id
          const currentCategoryId = group.category.id

          if (newCategoryId !== currentCategoryId) {
            // Remove from current category
            group.credits.splice(creditIndex, 1)

            // Add to new category
            this.addCreditToState(updatedCredit)
            this.totalMembers-- // Adjust since addCreditToState increments

            // Clean up empty categories
            this.cleanupEmptyCategories()
          } else {
            // Same category, just update in place
            group.credits[creditIndex] = updatedCredit
          }
          break
        }
      }
    },

    removeCreditFromState(creditId: number) {
      let removed = false

      for (const group of this.categoryGroups) {
        const creditIndex = group.credits.findIndex(
          (credit) => credit.id === creditId
        )

        if (creditIndex !== -1) {
          group.credits.splice(creditIndex, 1)
          removed = true
          break
        }
      }

      if (removed) {
        // Update total count
        this.totalMembers = Math.max(0, this.totalMembers - 1)

        // Clean up empty categories
        this.cleanupEmptyCategories()
      }
    },

    cleanupEmptyCategories() {
      this.categoryGroups = this.categoryGroups.filter(
        (group) => group.credits.length > 0
      )
    },

    mergeNewGroups(newGroups: CategoryGroup[]) {
      newGroups.forEach((newGroup) => {
        const existingGroup = this.categoryGroups.find(
          (group) => group.category.id === newGroup.category.id
        )

        if (existingGroup) {
          // Avoid duplicates when merging
          const existingIds = new Set(existingGroup.credits.map((c) => c.id))
          const newCredits = newGroup.credits.filter(
            (c) => !existingIds.has(c.id)
          )
          existingGroup.credits.push(...newCredits)
        } else {
          this.categoryGroups.push(newGroup)
        }
      })
    },

    resetState() {
      this.categoryGroups = []
      this.page = 1
      this.hasMorePages = true
      this.isLoading = false
      this.error = null
      this.totalMembers = 0
    },
  },

  getters: {
    getTotalCredits: (state) =>
      state.categoryGroups.reduce(
        (total, group) => total + group.credits.length,
        0
      ),

    getCreditById: (state) => (creditId: number) => {
      for (const group of state.categoryGroups) {
        const credit = group.credits.find((credit) => credit.id === creditId)
        if (credit) return credit
      }
      return null
    },

    hasCredits: (state) => state.getTotalCredits > 0,

    getCreditsByCategory: (state) => (categoryId: number) => {
      const group = state.categoryGroups.find(
        (g) => g.category.id === categoryId
      )
      return group ? group.credits : []
    },

    getAllCategories: (state) =>
      state.categoryGroups.map((group) => group.category),
  },
})
