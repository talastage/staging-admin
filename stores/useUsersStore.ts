// stores/useUsersStore.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useNuxtApp } from '#app'

interface User {
  id: number
  display_name: string // Updated to reflect the new field
  username: string
  profile_photo: string
  is_registered: boolean // Adding this based on your response structure
  role: string // Also adding this based on your API response
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getUserById = async (userId: number): Promise<User> => {
    isLoading.value = true
    error.value = null
    try {
      const { $axios } = useNuxtApp()
      const response = await $axios.get(`/api/users/${userId}`)
      return response.data
    } catch (err) {
      console.error('Error fetching user:', err)
      error.value = 'Failed to fetch user. Please try again.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateUser = async (
    userId: number,
    userData: Partial<User>
  ): Promise<User> => {
    isLoading.value = true
    error.value = null
    try {
      const { $axios } = useNuxtApp()
      const response = await $axios.put(`/api/users/${userId}`, userData)
      return response.data
    } catch (err) {
      console.error('Error updating user:', err)
      error.value = 'Failed to update user. Please try again.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    users,
    isLoading,
    error,
    getUserById,
    updateUser,
  }
})
