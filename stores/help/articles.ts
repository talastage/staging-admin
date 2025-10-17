// stores\help\articles.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Article {
  id: string
  title: string
  content: string
  slug: string
  thumbnail_url?: string
  created_at?: string
  updated_at?: string
  is_popular?: boolean
  category?: {
    id: string
    name: string
    slug: string
  }
  sub_category?: {
    id: string
    name: string
    slug: string
  }
}

export const useArticleStore = defineStore('article', () => {
  const article = ref<Article | null>(null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Cache mechanism to avoid redundant API calls
  const cache = ref<Record<string, Article>>({})

  async function loadArticleData(
    categorySlug: string,
    subCategorySlug: string,
    articleSlug: string
  ) {
    const { $axios } = useNuxtApp()

    // Generate cache key
    const cacheKey = `${categorySlug}/${subCategorySlug}/${articleSlug}`

    // Reset state
    isLoading.value = true
    error.value = null

    try {
      // Check cache first
      if (cache.value[cacheKey]) {
        article.value = cache.value[cacheKey]
        isLoading.value = false
        return
      }

      // Fetch from API using the new route structure
      const response = await $axios.get(
        `/api/help/categories/${categorySlug}/${subCategorySlug}/${articleSlug}`
      )

      if (response.data && response.data.data) {
        // Extract article from the data property of the response
        article.value = response.data.data
        // Store in cache
        cache.value[cacheKey] = article.value
      } else {
        throw new Error('Article not found')
      }
    } catch (err) {
      console.error('Failed to load article:', err)
      error.value = 'Article not found'
      article.value = null
    } finally {
      isLoading.value = false
    }
  }

  function clearCache() {
    cache.value = {}
  }

  return {
    article,
    isLoading,
    error,
    loadArticleData,
    clearCache,
  }
})
