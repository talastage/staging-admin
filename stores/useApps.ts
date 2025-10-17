// stores/useApps.ts
import { defineStore } from 'pinia'
import { ref, Ref, computed } from 'vue'

interface App {
  id: number
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  favicon_url: string | null
  is_active: boolean
  dark_mode: boolean
  timezone: string | null
  slogan: string | null
  analytics_tracking_id: string | null
  thumbnail_url: string | null
  created_at: string
  updated_at: string
  seo_description?: string
  meta_keywords?: string
  canonical_url?: string
  schema_markup?: any
  // Add additional SEO fields
  meta_title?: string
  meta_image?: string
  json_ld?: string
  alternate_languages?: Record<string, string>
  // PWA support
  pwa_name?: string
  pwa_short_name?: string
  pwa_theme_color?: string
  pwa_background_color?: string
}

interface CachedData {
  data: App
  timestamp: number
  version: string
  etag?: string // For HTTP caching
}

export const useAppsStore = defineStore('apps', () => {
  const talastageApp: Ref<App | null> = ref(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetchTimestamp = ref<number>(0)
  const etag = ref<string | null>(null)

  const CACHE_KEY = 'talastageApp'
  const CACHE_VERSION = '1.1' // Increment this when making breaking changes
  const CACHE_EXPIRATION = 1 * 60 * 60 * 1000 // 1 hour
  const FORCE_REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

  // Computed property for SEO elements
  const seoData = computed(() => {
    if (!talastageApp.value) return null

    return {
      title: talastageApp.value.name || 'TalaStage',
      description:
        talastageApp.value.seo_description ||
        'Connecting talents across the globe with opportunities to shine and thrive ✨',
      keywords: talastageApp.value.meta_keywords || '',
      image:
        talastageApp.value.thumbnail_url ||
        talastageApp.value.logo_url ||
        'https://talastage.com/app-logo.png',
      canonical: talastageApp.value.canonical_url || 'https://talastage.com',
      schemaMarkup: talastageApp.value.schema_markup || null,
    }
  })

  const isValidCache = (cachedData: CachedData): boolean => {
    return (
      cachedData.version === CACHE_VERSION &&
      Date.now() - cachedData.timestamp < CACHE_EXPIRATION
    )
  }

  const getCachedData = (): CachedData | null => {
    try {
      // Only use localStorage on client-side
      if (process.client) {
        const cachedData = localStorage.getItem(CACHE_KEY)
        if (!cachedData) return null

        const parsed = JSON.parse(cachedData) as CachedData
        return isValidCache(parsed) ? parsed : null
      }
      return null
    } catch (error) {
      console.error('Cache parsing error:', error)
      if (process.client) {
        localStorage.removeItem(CACHE_KEY)
      }
      return null
    }
  }

  const setCachedData = (data: App, etagValue?: string) => {
    try {
      if (process.client) {
        const cacheData: CachedData = {
          data,
          timestamp: Date.now(),
          version: CACHE_VERSION,
          etag: etagValue,
        }
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
      }
    } catch (error) {
      console.error('Cache setting error:', error)
    }
  }

  async function fetchTalaStageApp(forceRefresh = false) {
    const { $axios } = useNuxtApp()

    // Check if we should force refresh based on time interval
    const shouldForceRefresh =
      Date.now() - lastFetchTimestamp.value > FORCE_REFRESH_INTERVAL

    if (!forceRefresh && !shouldForceRefresh) {
      const cachedData = getCachedData()
      if (cachedData) {
        talastageApp.value = cachedData.data
        etag.value = cachedData.etag || null
        return
      }
    }

    loading.value = true
    error.value = null

    try {
      const headers: Record<string, string> = {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      }

      // Use ETag for HTTP caching
      if (etag.value) {
        headers['If-None-Match'] = etag.value
      }

      const response = await $axios.get('/api/apps/talastage', { headers })

      // Get ETag from response if available
      const responseEtag = response.headers['etag']

      talastageApp.value = response.data
      setCachedData(response.data, responseEtag)
      lastFetchTimestamp.value = Date.now()

      if (responseEtag) {
        etag.value = responseEtag
      }
    } catch (err: any) {
      // Handle 304 Not Modified response as success
      if (err.response && err.response.status === 304) {
        // Content hasn't changed, use cached data
        const cachedData = getCachedData()
        if (cachedData) {
          talastageApp.value = cachedData.data
          lastFetchTimestamp.value = Date.now()
        }
      } else {
        error.value = err.message
        // If fetch fails, try to use cached data as fallback
        const cachedData = getCachedData()
        if (cachedData && !talastageApp.value) {
          talastageApp.value = cachedData.data
        }
      }
    } finally {
      loading.value = false
    }
  }

  function clearCache() {
    if (process.client) {
      localStorage.removeItem(CACHE_KEY)
    }
    talastageApp.value = null
    lastFetchTimestamp.value = 0
    etag.value = null
  }

  // Add method to force refresh
  async function refreshData() {
    await fetchTalaStageApp(true)
  }

  return {
    talastageApp,
    loading,
    error,
    seoData,
    fetchTalaStageApp,
    clearCache,
    refreshData,
  }
})
