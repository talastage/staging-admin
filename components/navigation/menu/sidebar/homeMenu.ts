// components/navigation/menu/sidebar/homeMenu.ts
import { markRaw } from 'vue'
import type {
  Menu,
  PageMenuItem,
  DividerMenuItem,
} from '~/types/navigationMenu/menu'
import {
  HomeIcon,
  VideoIcon,
  MicrophoneIcon,
  CurrencyDollarIcon,
  WalletIcon,
  GiftIcon,
  BookmarkIcon,
  SettingsIcon,
} from 'vue-tabler-icons'
import { useAuthStore } from '~/stores/auth'
import { useCookie } from '#imports'

const getHomeMenu = (): Menu[] => {
  let isLoggedIn = false
  
  try {
    const authStore = useAuthStore()
    const tokenFromCookie = !process.client ? useCookie<string | null>('auth_token').value : null
    isLoggedIn = authStore.isLoggedIn || !!tokenFromCookie
  } catch (e) {
    isLoggedIn = false
  }

  const publicMainMenu: Menu[] = [
    {
      title: 'Home',
      icon: markRaw(HomeIcon),
      to: '/',
      color: '#065fd4',
      type: 'regular',
    },
    {
      title: 'Watch Premieres',
      icon: markRaw(VideoIcon),
      to: '/premieres',
      color: '#c00',
      type: 'regular',
    },
    // {
    //   title: 'Upcoming Premieres',
    //   icon: markRaw(VideoIcon),
    //   to: '/upcoming',
    //   color: '#c00',
    //   type: 'regular',
    // },
    {
      title: 'Discover Talents',
      icon: markRaw(MicrophoneIcon),
      to: '/talents',
      color: '#8B5CF6',
      type: 'regular',
    },
    // {
    //   title: 'Find Investors',
    //   icon: markRaw(CurrencyDollarIcon),
    //   to: '/investors',
    //   color: '#7C3AED',
    //   type: 'regular',
    // },
  ]

  const privateMainMenu: Menu[] = [
    {
      title: 'Watching',
      icon: markRaw(SettingsIcon),
      to: '/watching',
      color: '#DC2626',
      type: 'regular',
    },
    {
      title: 'Tips',
      icon: markRaw(GiftIcon),
      to: '/tips',
      color: '#F59E0B',
      type: 'regular',
    },
    {
      title: 'Payments',
      icon: markRaw(GiftIcon),
      to: '/payments',
      color: '#EA580C',
      type: 'regular',
    },
    {
      title: 'My Wallet',
      icon: markRaw(WalletIcon),
      to: '/wallet',
      color: '#2563EB',
      type: 'regular',
    },
    // {
    //   title: 'Saved Talents',
    //   icon: markRaw(BookmarkIcon),
    //   to: '/talents/collections',
    //   color: '#606060',
    //   type: 'regular',
    // },
  ]

  // Only include privateMainMenu if user is authenticated
  return isLoggedIn
    ? [...publicMainMenu, ...privateMainMenu]
    : publicMainMenu
}

// Export the function as default
export default getHomeMenu

// Export additional types if needed
export type { Menu, PageMenuItem, DividerMenuItem }
