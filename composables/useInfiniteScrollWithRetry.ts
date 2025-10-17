// composables/useInfiniteScrollWithRetry.ts

import { ref, onMounted, onUnmounted, Ref } from 'vue'

interface InfiniteScrollOptions {
  threshold?: number
  throttle?: number
  direction?: 'vertical' | 'horizontal'
  initialLoadDelay?: number
  retryDelay?: number
  maxRetries?: number
}

export function useInfiniteScrollWithRetry<T>(
  fetchItems: (page: number) => Promise<T[]>,
  options: InfiniteScrollOptions = {}
) {
  const defaultOptions: InfiniteScrollOptions = {
    threshold: 200,
    throttle: 300,
    direction: 'vertical',
    initialLoadDelay: 100,
    retryDelay: 2000,
    maxRetries: 2
  }

  const mergedOptions = { ...defaultOptions, ...options }
  const items: Ref<T[]> = ref([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const hasMore = ref(true)
  const currentPage = ref(1)
  const retryCount = ref(0)

  let ticking = false

  const checkScrollPosition = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (mergedOptions.direction === 'vertical') {
          const scrollPosition = window.innerHeight + window.scrollY
          const bodyHeight = document.body.offsetHeight
          if (
            bodyHeight - scrollPosition < mergedOptions.threshold! &&
            hasMore.value &&
            !isLoading.value
          ) {
            loadMoreItems()
          }
        } else {
          // Horizontal scroll logic (if needed)
        }
        ticking = false
      })
      ticking = true
    }
  }

  const throttledCheckScroll = throttle(
    checkScrollPosition,
    mergedOptions.throttle!
  )

  const loadMoreItems = async () => {
    if (!hasMore.value || isLoading.value) return Promise.resolve()
    
    isLoading.value = true
    error.value = null
    
    try {
      const newItems = await fetchItems(currentPage.value)
      
      // Reset retry count on success
      retryCount.value = 0
      
      if (newItems && newItems.length > 0) {
        items.value = [...items.value, ...newItems]
        currentPage.value++
      } else {
        hasMore.value = false
      }
      
      return Promise.resolve()
    } catch (err) {
      error.value =
        err instanceof Error
          ? err
          : new Error('An error occurred while loading more items')
      
      console.error('Infinite scroll error:', error.value)
      
      // Implement retry logic
      if (retryCount.value < mergedOptions.maxRetries!) {
        retryCount.value++
        console.log(`Retrying (${retryCount.value}/${mergedOptions.maxRetries})...`)
        
        return new Promise((resolve) => {
          setTimeout(() => {
            isLoading.value = false
            loadMoreItems().then(resolve)
          }, mergedOptions.retryDelay)
        })
      }
      
      return Promise.reject(error.value)
    } finally {
      if (retryCount.value === 0) {
        isLoading.value = false
      }
    }
  }

  const refresh = async () => {
    currentPage.value = 1
    items.value = []
    isLoading.value = true
    error.value = null
    retryCount.value = 0

    try {
      const newItems = await fetchItems(currentPage.value)
      items.value = newItems || []
      hasMore.value = newItems && newItems.length > 0

      if (hasMore.value) {
        currentPage.value++
      }
    } catch (err) {
      error.value =
        err instanceof Error
          ? err
          : new Error('An error occurred while refreshing items')
      console.error('Error refreshing data:', error.value)
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    items.value = []
    currentPage.value = 1
    hasMore.value = true
    isLoading.value = false
    error.value = null
    retryCount.value = 0
  }

  onMounted(() => {
    window.addEventListener('scroll', throttledCheckScroll)
    if (mergedOptions.initialLoadDelay! > 0) {
      setTimeout(loadMoreItems, mergedOptions.initialLoadDelay)
    } else {
      loadMoreItems()
    }
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', throttledCheckScroll)
  })

  return {
    items,
    isLoading,
    error,
    hasMore,
    reset,
    refresh,
    loadMoreItems,
  }
}

function throttle(func: Function, limit: number) {
  let lastFunc: ReturnType<typeof setTimeout>
  let lastRan: number
  return function (this: any) {
    const context = this
    const args = arguments
    if (!lastRan) {
      func.apply(context, args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }
}