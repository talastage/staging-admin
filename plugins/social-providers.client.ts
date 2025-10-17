export default defineNuxtPlugin(async () => {
  const { useSocialProvidersStore } = await import('~/stores/useSocialProviders')
  
  // Preload social providers on app initialization
  const socialStore = useSocialProvidersStore()
  
  // Fetch providers in background without blocking app initialization
  if (process.client) {
    nextTick(() => {
      socialStore.fetchActiveProviders()
    })
  }
})