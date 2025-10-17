// middleware/wallet-layout.ts

export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith('/wallet')) {
    // List of wallet pages that should use a different layout
    const excludedPaths = ['/wallet/activate', '/wallet/verify-pin']

    // Apply wallet layout only if the path is not in the excluded list
    if (!excludedPaths.includes(to.path)) {
      setPageLayout('wallet-layout')
    }
  }
})
