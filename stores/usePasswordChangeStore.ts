// stores/usePasswordChangeStore.ts
import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'

interface PasswordChangeResponse {
  message: string
}

export const usePasswordChangeStore = defineStore('passwordChange', () => {
  const { $axios } = useNuxtApp()

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<PasswordChangeResponse> => {
    try {
      const response = await $axios.put('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
      return response.data
    } catch (error: any) {
      // Rethrow the error to be handled by the component
      throw error
    }
  }

  return {
    changePassword,
  }
})
