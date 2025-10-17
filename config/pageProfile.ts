// config/pageProfile.ts
export interface PageProfileTab {
  title: string
  tab: string
  icon: string
  component: string
  requiresAuth?: boolean
  order: number
}

export const pageProfileTabs: PageProfileTab[] = [
  {
    title: 'About',
    tab: 'about',
    icon: 'tabler-info-circle',
    component: 'PageAbout',
    order: 1,
  },
  {
    title: 'Investments',
    tab: 'investments',
    icon: 'tabler-handshake',
    component: 'PageInvestments',
    requiresAuth: true,
    order: 2,
  },
]

/** The default tab is now 'about'. */
export const PAGE_DEFAULT_TAB = 'about'
export const PAGE_VALID_TABS = pageProfileTabs.map((tab) => tab.tab)
