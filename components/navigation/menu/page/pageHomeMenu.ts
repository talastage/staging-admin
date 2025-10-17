import type { Menu } from '~/types/navigationMenu/menu'

const getHomeMenu = (): Menu[] => {
  const publicMainMenu: Menu[] = [
    {
      title: 'Home',
      icon: 'mdi-home',
      to: '/',
      color: '#065fd4',
    },
    {
      title: 'Investments',
      icon: 'mdi-currency-usd',
      to: '/investments',
      color: '#7C3AED',
    },
    {
      title: 'About',
      icon: 'mdi-account',
      to: '/about',
      color: '#606060',
    },
  ]

  return publicMainMenu
}

export default getHomeMenu
