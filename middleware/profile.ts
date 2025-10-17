// middleware/profile.ts

import { VALID_TABS, DEFAULT_TAB, profileTabs } from '~/config/profile'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  // Validate username exists
  if (!to.params.username) {
    console.warn('No username provided in profile route')
    return navigateTo('/')
  }

  // Handle index route - redirect to default tab
  if (!to.params.tab) {
    return navigateTo(`/${to.params.username}/${DEFAULT_TAB}`)
  }

  // Validate tab is valid
  const currentTab = to.params.tab as string
  if (!VALID_TABS.includes(currentTab)) {
    console.warn(`Invalid profile tab: ${currentTab}`)
    return navigateTo(`/${to.params.username}/${DEFAULT_TAB}`)
  }

  // Check auth requirements for protected tabs
  const tab = profileTabs.find((t) => t.tab === currentTab)
  if (tab?.requiresAuth) {
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) {
      return navigateTo('/login', {
        query: {
          redirect: to.fullPath,
          message: 'Please login to view this content',
        },
      })
    }
  }
})
