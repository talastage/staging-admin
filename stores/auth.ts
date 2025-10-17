// stores/auth.ts
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useNuxtApp, useCookie, useState, navigateTo } from '#imports'

// Define interfaces according to your data structure
interface UserRole {
  id: number
  name: string
  slug: string
}

interface User {
  id: number
  first_name: string
  last_name: string
  username: string
  profile_photo: string
  display_name: string
  has_talent: 'yes' | 'no' | 'undecided'
  talent: string | null
  talent_details: any | null
  email: string
  phone: string
  country_id: number
  has_self_investment: boolean
  can_change_username: boolean
  next_username_change_date: string | null
  role: UserRole
  is_fanned_by_auth_user: boolean
  is_fanning_auth_user: boolean
  timezone?: string
  created_at: string
  updated_at: string
}

interface LoginCredentials {
  email: string
  password: string
  timezone?: string
}

interface LoginResponse {
  user: User
  token: string
}

export const useAuthStore = defineStore('auth', () => {
  const { $api } = useNuxtApp()

  // SSR-safe state management
  const token = useCookie<string | null>('auth_token', { default: () => null, sameSite: 'lax', path: '/' })
  const user = useState<User | null>('user', () => null)
  const loginError = useState<string | null>('loginError', () => null)

  // Computed state
  const isLoggedIn = computed(() => !!token.value && !!user.value)

  // Backwards-compatibility proxy for code that expects `authStore.state.user`
  // (some components in this repo reference `authStore.state.user`).
  const state = computed(() => ({
    user: user.value,
    token: token.value,
  }))

  // --- Private Functions ---
  const _setAuth = ({ newUser, newToken }: { newUser: User | null; newToken: string | null }) => {
    user.value = newUser
    token.value = newToken
  }

  // --- Actions ---
  const login = async (credentials: LoginCredentials) => {
    if (!credentials.timezone) {
      credentials.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    }
    // The $api service handles CSRF automatically
    const { user: loggedInUser, token: loggedInToken } = await $api.post<LoginResponse>('/auth/user/login', credentials)
    _setAuth({ newUser: loggedInUser, newToken: loggedInToken })
    await navigateTo('/')
  }

  const logout = async () => {
    try {
      if (token.value) {
        await $api.post('/auth/user/logout', {})
      }
    } catch (error) {
      console.error('Logout failed, but clearing state anyway.', error)
    } finally {
      _setAuth({ newUser: null, newToken: null })
      await navigateTo('/')
    }
  }

  const fetchUser = async () => {
    if (!token.value) {
      if (user.value) {
        _setAuth({ newUser: null, newToken: null })
      }
      return
    }

    try {
      // The $api service automatically uses the token from the cookie
      const response = await $api.get<{ user: User } | { data: User }>('/auth/user/user')
      const fetchedUser = 'user' in response ? response.user : response.data
      _setAuth({ newUser: fetchedUser, newToken: token.value })
    } catch (error: any) {
      console.error('Failed to fetch user:', error.message)
      if (error.statusCode === 401 || error.statusCode === 419) {
        _setAuth({ newUser: null, newToken: null })
      }
    }
  }

  const clearLoginError = () => {
    loginError.value = null
  }

  const handleRegistrationSuccess = async (data: LoginResponse) => {
    _setAuth({ newUser: data.user, newToken: data.token })
  }

  return {
    // State
    user,
    token,
    // Compatibility
    state,
    loginError,

    // Getters
    isLoggedIn,

    // Actions
    login,
    logout,
    fetchUser,
    clearLoginError,
    handleRegistrationSuccess,
  }
})