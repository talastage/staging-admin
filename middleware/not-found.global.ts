import { NON_USERNAME_ROUTES } from '~/utils/routes'

export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware for 404 page to avoid infinite redirects
  if (to.path === '/404') return

  // Get the first segment of the path (after the leading slash)
  const pathSegments = to.path.split('/').filter(Boolean)
  const firstSegment = pathSegments[0]
  
  // Skip checking for dynamic routes with parameters
  // This allows routes like /project/[access_uuid] to work properly
  if (pathSegments.length > 1 && NON_USERNAME_ROUTES.includes(firstSegment)) {
    // Check if there's a dynamic route that would match this path
    const router = useRouter()
    const routes = router.getRoutes()
    
    // Check for dynamic routes that would match this path pattern
    const hasDynamicRoute = routes.some(route => {
      const routeSegments = route.path.split('/').filter(Boolean)
      
      // If the first segment matches and the route has a dynamic parameter
      if (routeSegments[0] === firstSegment && routeSegments.length > 1) {
        // Check if any segment is dynamic (contains : or [)
        return routeSegments.some(segment => 
          segment.includes(':') || segment.includes('[') || segment.includes('*')
        )
      }
      return false
    })
    
    // If we found a dynamic route that could match this path, allow it through
    if (hasDynamicRoute) return
    
    // Otherwise, check if the exact route exists
    const exactRouteExists = routes.some(route => route.path === to.path)
    if (!exactRouteExists) {
      return navigateTo('/404')
    }
  }
})