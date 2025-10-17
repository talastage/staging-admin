import type { Menu } from '~/types/navigationMenu/menu'
import { HelpIcon } from 'vue-tabler-icons'
import { mdiAlertOutline } from '@mdi/js'

const getBottomMenu = (): Menu[] => {
  return [
    {
      title: 'Help and Support',
      icon: HelpIcon,
      to: '/help',
      color: '#4B5563',
    },
    {
      title: 'Report a Problem',
      icon: 'mdi-alert-outline', // Vuetify icon string syntax
      // Alternative using v-icon with path:
      // icon: () => h('v-icon', { icon: mdiAlertOutline }),
      to: '/feedback/report',
      color: '#DC2626',
    },
  ]
}

export default getBottomMenu
