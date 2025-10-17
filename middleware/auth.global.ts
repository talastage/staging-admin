// middleware/auth.global.ts
import { useAuthStore } from '@/stores/auth'
import { navigateTo } from '#app'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // On the server, if a token exists but we don't have a user object,
  // attempt to fetch the user. This populates the user state for SSR.
  if (process.server && authStore.token && !authStore.user) {
    await authStore.fetchUser()
  }

  // --- Route Protection ---
  const protectedPaths = [
    '/account',
    '/investments',
    '/payments',
    '/profile',
    '/studio',
    '/wallet',
    '/orders',
    '/tips',
    '/tip',
    '/notifications',
    '/fanning',
    '/fans',
    '/watching',
    '/investments',
    // Add other paths that require authentication
  ]

  const isProtectedRoute = protectedPaths.some((path) => to.path.startsWith(path))

  // If the user is trying to access a protected route without being logged in,
  // redirect them to the login page, preserving their intended destination.
  if (isProtectedRoute && !authStore.isLoggedIn) {
    console.log(`Auth middleware: blocking access to ${to.fullPath} and redirecting to login.`)
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }
})
