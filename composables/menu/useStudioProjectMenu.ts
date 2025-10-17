// composables\menu\useStudioProjectMenu.ts

import {
  CashIcon,
  DetailsIcon,
  ReceiptIcon,
  UsersIcon,
  SettingsIcon,
  HomeIcon,
  AwardIcon,
} from 'vue-tabler-icons'

export default function useStudioProjectMenu(access_uuid: string) {
  return [
    {
      title: 'Home',
      icon: HomeIcon,
      to: '/',
    },
    {
      title: 'Detail',
      icon: DetailsIcon,
      to: `/studio/projects/${access_uuid}/detail`,
    },
    {
      title: 'Investors',
      icon: UsersIcon,
      to: `/studio/projects/${access_uuid}/investors`,
    },
    {
      title: 'Cast & Crew',
      icon: AwardIcon,
      to: `/studio/projects/${access_uuid}/cast-crew`,
    },
  ]
}
