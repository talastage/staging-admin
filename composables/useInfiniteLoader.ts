// composables/useInfiniteLoader.ts
import { ref, Ref, onMounted, watch } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

export interface UseInfiniteLoaderOptions {
  immediate?: boolean
}

/**
 * A reusable composable for infinite loading with a sentinel element.
 *
 * @param fetchPage - A function that fetches/merges data for the given page.
 * @param hasMore - A function (or ref) indicating if more data is available.
 * @param options - Optional configuration (e.g. immediate load).
 *
 * @returns sentinelRef, page, isLoading, initLoader
 */
export function useInfiniteLoader(
  fetchPage: (page: number) => Promise<void>,
  hasMore: Ref<boolean> | (() => boolean),
  options: UseInfiniteLoaderOptions = {}
) {
  const page = ref(1)
  const isLoading = ref(false)
  const sentinelRef = ref<HTMLElement | null>(null)

  async function loadNextPage() {
    if (typeof hasMore === 'function' ? !hasMore() : !hasMore.value) return
    isLoading.value = true
    try {
      page.value += 1
      await fetchPage(page.value)
    } catch (err) {
      console.error('Infinite loader error:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function initLoader() {
    page.value = 1
    isLoading.value = true
    try {
      await fetchPage(page.value)
    } catch (err) {
      console.error('Initial load error:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Observe sentinel to trigger loading of the next page
  useIntersectionObserver(
    sentinelRef,
    ([entry]) => {
      if (entry.isIntersecting && !isLoading.value) {
        loadNextPage()
      }
    },
    { threshold: 0.1 }
  )

  // Optionally load on mount
  onMounted(() => {
    if (options.immediate !== false) initLoader()
  })

  return {
    sentinelRef,
    page,
    isLoading,
    initLoader,
    loadNextPage,
  }
}
