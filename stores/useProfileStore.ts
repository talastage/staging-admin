// stores/useProfileStore.ts

import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import { useAuthStore } from './auth'
import { ref, computed } from 'vue'
import { UserProfile } from '@/types/user' // Adjust the path based on your project structure

export const useProfileStore = defineStore('profile', () => {
  const nuxtApp = useNuxtApp()
  // Resolve an API client in a server/client-safe manner. Projects may expose $axios or $api.
  const $axios = (nuxtApp as any).$axios || (nuxtApp as any).$api || null
  const authStore = useAuthStore()

  // State
  const loading = ref(false)
  const error = ref<string | null>(null)
  const userProfile = ref<UserProfile | null>(null)

  // Getters
  const isProfileOwner = computed(() => {
    return authStore.user?.value?.username === userProfile.value?.username
  })

  // Actions
  const fetchProfile = async (username: string) => {
    if (!username) {
      error.value = 'Username is required'
      return false
    }

    // Optionally, avoid refetching if already fetched
    if (userProfile.value?.username === username) {
      return true // User already loaded, return true
    }

    loading.value = true
    error.value = null

    try {
      if ($axios && typeof $axios.get === 'function') {
        const { data } = await $axios.get(`/api/user/${username}`)
        // Support common response shapes
        userProfile.value = (data?.user ?? data?.data ?? data) as UserProfile
      } else {
        // Fallback to use $fetch if no client available
        const fetched = await (nuxtApp as any).$fetch(`/api/user/${username}`)
        userProfile.value = (fetched?.user ?? fetched?.data ?? fetched) as UserProfile
      }
      return true
    } catch (err: any) {
      // Check if it's a 404 error specifically
      if (err?.response?.status === 404) {
        return false // Return false to indicate user not found
      }
      
      error.value =
        err instanceof Error ? err.message : 'Failed to load profile'
      console.error('Error fetching profile:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const updateUserPhoto = async (newPhotoPath: string) => {
    if (!authStore.user?.value) {
      throw new Error('User must be logged in to update photo')
    }

    try {
      await $axios.post('/api/profile/update-photo', { photo: newPhotoPath })

      // Update both auth store and profile data
      if (authStore.user && authStore.user.value) {
        authStore.user.value.profile_photo = newPhotoPath
      }
      if (userProfile.value && isProfileOwner.value) {
        userProfile.value.profile_photo = newPhotoPath
      }

      try {
        if (authStore.user && authStore.user.value) {
          localStorage.setItem('user', JSON.stringify(authStore.user.value))
        }
      } catch (e) {
        // ignore localStorage errors in SSR or restricted environments
      }
      return true
    } catch (error) {
      console.error('Error updating user photo:', error)
      throw error
    }
  }

  const updateUsername = async (newUsername: string) => {
    if (!authStore.user?.value) {
      throw new Error('User must be logged in to update username')
    }

    try {
      await $axios.post('/api/profile/update-username', {
        username: newUsername,
      })

      const nextChangeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      // Update auth store
      if (authStore.user && authStore.user.value) {
        authStore.user.value.username = newUsername
        authStore.user.value.can_change_username = false
        authStore.user.value.next_username_change_date = nextChangeDate
      }

      // Update profile data if viewing own profile
      if (userProfile.value && isProfileOwner.value) {
        userProfile.value.username = newUsername
        // If 'can_change_username' and 'next_username_change_date' are part of UserProfile, uncomment below
        // userProfile.value.can_change_username = false
        // userProfile.value.next_username_change_date = nextChangeDate
      }

      try {
        if (authStore.user && authStore.user.value) {
          localStorage.setItem('user', JSON.stringify(authStore.user.value))
        }
      } catch (e) {
        // ignore localStorage errors in SSR or restricted environments
      }
      return true
    } catch (error) {
      console.error('Error updating username:', error)
      throw error
    }
  }

  const clearProfile = () => {
    userProfile.value = null
    error.value = null
    loading.value = false
  }

  return {
    // State
    loading,
    error,
    userProfile,

    // Getters
    isProfileOwner,

    // Actions
    fetchProfile,
    updateUserPhoto,
    updateUsername,
    clearProfile,
  }
})
