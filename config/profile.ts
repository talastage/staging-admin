// config/profile.ts
import type { UserProfile } from '~/types'

export interface ProfileTab {
  title: string
  tab: string
  icon: string
  component: string
  requiresAuth?: boolean
  ownerOnly?: boolean // New property for owner-only tabs
  order: number
}

export const profileTabs: ProfileTab[] = [
  {
    title: 'Premieres',
    tab: 'projects',
    icon: 'tabler-layout-grid',
    component: 'UserProfileProjects',
    order: 0, // First tab (was order: 1)
  },
  {
    title: 'Investments',
    tab: 'investments',
    icon: 'tabler-handshake',
    component: 'UserInvestments',
    requiresAuth: true,
    ownerOnly: true, // Only visible to profile owner
    order: 1, // Updated order (was order: 2)
  },
  {
    title: 'Featured In',
    tab: 'castings',
    icon: 'tabler-award',
    component: 'UserCredits',
    order: 2, // Updated order (was order: 3)
  },
  {
    title: 'Watching',
    tab: 'watching',
    icon: 'tabler-eye',
    component: 'UserWatching',
    requiresAuth: true,
    order: 3, // Updated order (was order: 4)
  },
  {
    title: 'Followers',
    tab: 'followers',
    icon: 'tabler-users',
    component: 'UserFans',
    order: 4, // Updated order (was order: 5)
  },
  {
    title: 'Following',
    tab: 'following',
    icon: 'tabler-star',
    component: 'UserFanning',
    order: 5, // Updated order (was order: 6)
  },
]

export const DEFAULT_TAB = 'projects' // Changed from 'about' to 'projects'
export const VALID_TABS = profileTabs.map((tab) => tab.tab)
