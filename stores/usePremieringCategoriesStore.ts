// stores/usePremieringCategoriesStore.ts

import { defineStore } from 'pinia'
import { usePremieringCategories } from '~/composables/premiering/usePremieringCategories'

export const usePremieringCategoriesStore = defineStore(
  'premieringCategories',
  {
    state: () => ({
      categories: [],
      categoriesWithProjects: [],
      currentCategory: null,
      currentCategoryProjects: [],
      loading: false,
      error: null,
      pagination: {
        currentPage: 1,
        lastPage: 1,
        perPage: 20,
        total: 0,
      },
    }),

    actions: {
      async fetchCategories() {
        const {
          fetchCategories,
          categories: fetchedCategories,
          error: fetchError,
        } = usePremieringCategories()

        this.loading = true
        this.error = null

        await fetchCategories()

        this.categories = fetchedCategories.value
        this.error = fetchError.value
        this.loading = false
      },

      async fetchCategoriesWithProjects() {
        const {
          fetchCategoriesWithProjects,
          categoriesWithProjects: fetchedCategoriesWithProjects,
          error: fetchError,
        } = usePremieringCategories()

        this.loading = true
        this.error = null

        await fetchCategoriesWithProjects()

        this.categoriesWithProjects = fetchedCategoriesWithProjects.value
        this.error = fetchError.value
        this.loading = false
      },

      async fetchCategoryProjects(slug, page = 1) {
        const {
          fetchCategoryProjects,
          currentCategory: fetchedCategory,
          currentCategoryProjects: fetchedProjects,
          pagination: fetchedPagination,
          error: fetchError,
        } = usePremieringCategories()

        this.loading = true
        this.error = null

        await fetchCategoryProjects(slug, page)

        if (page === 1) {
          this.currentCategory = fetchedCategory.value
          this.currentCategoryProjects = fetchedProjects.value
        } else {
          this.currentCategoryProjects = [
            ...this.currentCategoryProjects,
            ...fetchedProjects.value,
          ]
        }

        this.pagination = fetchedPagination.value
        this.error = fetchError.value
        this.loading = false
      },

      async loadMoreProjects() {
        if (
          !this.loading &&
          this.currentCategory &&
          this.pagination.currentPage < this.pagination.lastPage
        ) {
          await this.fetchCategoryProjects(
            this.currentCategory.slug,
            this.pagination.currentPage + 1
          )
        }
      },

      resetCurrentCategory() {
        this.currentCategory = null
        this.currentCategoryProjects = []
        this.pagination = {
          currentPage: 1,
          lastPage: 1,
          perPage: 20,
          total: 0,
        }
      },
    },

    getters: {
      hasMorePages: (state) =>
        state.pagination.currentPage < state.pagination.lastPage,
      isLoading: (state) => state.loading,
      getCategoryBySlug: (state) => (slug) =>
        state.categories.find((category) => category.slug === slug),
    },
  }
)
