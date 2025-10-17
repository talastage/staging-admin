// plugins/route-guard.ts
import { NON_USERNAME_ROUTES } from '~/utils/routes'

export default defineNuxtPlugin((nuxtApp) => {
  // Add a global route guard
  nuxtApp.hook('page:start', (page) => {
    // Get the current route
    const route = useRoute()
    
    // Get the first segment of the path (after the leading slash)
    const pathSegments = route.path.split('/').filter(Boolean)
    const firstSegment = pathSegments[0]
    
    // If the first segment is in our non-username list and there's a second segment
    // that doesn't match any known route, redirect to 404
    if (NON_USERNAME_ROUTES.includes(firstSegment) && pathSegments.length > 1) {
      // We'll let the middleware handle the actual redirect if needed
      // This is just an additional safety measure
      console.log(`Route guard checking path: ${route.path}`)
    }
  })
})