export default defineNuxtPlugin(() => {
  addRouteMiddleware(
    'wallet-layout',
    (to) => {
      if (to.path.startsWith('/wallet')) {
        setPageLayout('wallet-layout')

        // Set additional meta data if needed
        to.meta.section = 'wallet'

        // Ensure layout is set in meta
        to.meta.layout = 'wallet'
      }
    },
    { global: true }
  )
})
