// middleware/auth.ts
import { useAuthStore } from '@/stores/auth'
import { useCookie } from '#imports'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Don't redirect from login/register pages - allow access
  if (['/register', '/login'].includes(to.path)) {
    return
  }

  // If user is not logged in and trying to access a protected route
  const tokenFromCookie = !process.client ? useCookie<string | null>('auth_token').value : null
  if (!authStore.isLoggedIn && !tokenFromCookie) {
    // Redirect to login page with the intended route as query parameter
    return navigateTo('/login', {
      query: {
        redirect: to.fullPath,
      },
    })
  }
})
