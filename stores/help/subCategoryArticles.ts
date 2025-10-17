// stores\help\subCategoryArticles.ts

import { defineStore } from 'pinia'
import { useSubCategoryArticles } from '~/composables/help/useSubCategoryArticles'

export const useSubCategoryArticlesStore = defineStore(
  'helpSubCategoryArticles',
  {
    state: () => ({
      subCategory: null as any | null,
      articles: [] as any[],
      pagination: null as any | null,
      isLoading: false,
      error: null as string | null,
      currentPage: 1,
      perPage: 10,
      currentCategorySlug: null as string | null,
      currentSubCategorySlug: null as string | null,
      isFetching: false,
    }),

    actions: {
      setCurrentPage(page: number) {
        this.currentPage = page
        if (this.currentCategorySlug && this.currentSubCategorySlug) {
          this.fetchSubCategory(
            this.currentCategorySlug,
            this.currentSubCategorySlug
          )
        }
      },

      async loadSubCategoryData(categorySlug: string, subCategorySlug: string) {
        this.currentCategorySlug = categorySlug
        this.currentSubCategorySlug = subCategorySlug
        if (this.isFetching) return
        await this.fetchSubCategory(categorySlug, subCategorySlug)
      },

      async fetchSubCategory(categorySlug: string, subCategorySlug: string) {
        if (this.isFetching) return
        this.isFetching = true
        this.isLoading = true
        this.error = null
        try {
          const { fetchSubCategory } = useSubCategoryArticles()
          const data = await fetchSubCategory(
            categorySlug,
            subCategorySlug,
            this.currentPage,
            this.perPage
          )
          this.subCategory = data.subcategory
          this.articles = data.helps
          this.pagination = data.pagination
        } catch (error) {
          this.error = 'Failed to load subcategory articles'
        } finally {
          this.isLoading = false
          this.isFetching = false
        }
      },
    },
  }
)
