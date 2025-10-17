import { markRaw } from 'vue'
import { SettingsIcon, UserIcon, HelpIcon } from 'vue-tabler-icons'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

export const profileMenu = computed(() => ({
  title: 'Your Profile',
  icon: markRaw(UserIcon),
  children: [
    {
      title: 'My Profile',
      icon: markRaw(UserIcon),
      to: user.value ? `/${user.value.username}` : '#',
    },
    {
      title: 'Settings',
      icon: markRaw(SettingsIcon),
      to: '/account/settings',
    },
    {
      title: 'Help and Support',
      icon: markRaw(HelpIcon),
      to: '/help',
    },
  ],
}))
