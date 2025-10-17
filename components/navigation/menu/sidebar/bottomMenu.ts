// bottomMenu.ts
import { markRaw } from 'vue'
import type { Menu } from '~/types/navigationMenu/menu'
import {
  HelpIcon,
  AlertTriangleIcon,
  SettingsIcon,
  FileTextIcon,
} from 'vue-tabler-icons'
import { useAuthStore } from '~/stores/auth'
import { useCookie } from '#imports'

const getBottomMenu = (): Menu[] => {
  let isLoggedIn = false
  
  try {
    const authStore = useAuthStore()
    const tokenFromCookie = !process.client ? useCookie<string | null>('auth_token').value : null
    isLoggedIn = authStore.isLoggedIn || !!tokenFromCookie
  } catch (e) {
    isLoggedIn = false
  }

  // Menu items visible to all users
  const publicBottomMenu: Menu[] = [
    {
      title: 'Help and Support',
      icon: markRaw(HelpIcon),
      to: '/help',
      color: '#4B5563',
    },
    {
      title: 'Policies',
      icon: markRaw(FileTextIcon),
      to: '/policies',
      color: '#4B5563',
    },
    {
      title: 'Report a Problem',
      icon: markRaw(AlertTriangleIcon),
      to: '/feedback/report',
      color: '#DC2626', // Red color to indicate issue reporting
    },
  ]

  // Menu items only visible to authenticated users
  const privateBottomMenu: Menu[] = [
    {
      title: 'Settings',
      icon: markRaw(SettingsIcon),
      to: '/account/settings',
      color: '#4B5563',
    },
  ]

  // Only include privateBottomMenu if user is authenticated
  return isLoggedIn
    ? [...privateBottomMenu, ...publicBottomMenu]
    : publicBottomMenu
}

export default getBottomMenu
