// stores/usePasswordResetStore.ts

import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import { reactive } from 'vue'

interface PasswordResetState {
  resetToken: string | null
  email: string | null
  resetCode: string | null
  isLoading: boolean
  error: string | null
}

interface SendResetCodeResponse {
  message: string
  sent_to: string
  destination: string
  expires_in: number
}

interface VerifyResetCodeResponse {
  message: string
  reset_token: string
}

interface ResetPasswordResponse {
  message: string
}

export const usePasswordResetStore = defineStore('passwordReset', () => {
  const { $axios } = useNuxtApp()

  const state = reactive<PasswordResetState>({
    resetToken: null,
    email: null,
    resetCode: null,
    isLoading: false,
    error: null,
  })

  const sendResetCode = async (
    email: string
  ): Promise<SendResetCodeResponse> => {
    state.isLoading = true
    state.error = null

    try {
      const response = await $axios.post('/auth/forgot-password', {
        email,
      })

      // Store the email for later use
      state.email = email

      return response.data as SendResetCodeResponse
    } catch (error: any) {
      state.error = error.response?.data?.message || 'Failed to send reset code'
      throw error
    } finally {
      state.isLoading = false
    }
  }

  const verifyResetCode = async (
    email: string,
    code: string
  ): Promise<VerifyResetCodeResponse> => {
    state.isLoading = true
    state.error = null

    try {
      const response = await $axios.post('/auth/verify-reset-code', {
        email,
        code,
      })

      // Store the reset token and code from the response
      state.email = email
      state.resetToken = response.data.reset_token
      state.resetCode = code

      return response.data as VerifyResetCodeResponse
    } catch (error: any) {
      state.error =
        error.response?.data?.message || 'Failed to verify reset code'
      throw error
    } finally {
      state.isLoading = false
    }
  }

  const resetPassword = async (
    email: string,
    newPassword: string,
    resetToken: string | null = null
  ): Promise<ResetPasswordResponse> => {
    state.isLoading = true
    state.error = null

    try {
      // Use provided token or fall back to stored token
      const tokenToUse = resetToken || state.resetToken

      if (!tokenToUse) {
        throw new Error('No reset token available')
      }

      const response = await $axios.post('/auth/reset-password', {
        email,
        new_password: newPassword,
        reset_token: tokenToUse,
      })

      // Clear the reset state after successful password reset
      clearResetState()

      return response.data as ResetPasswordResponse
    } catch (error: any) {
      state.error = error.response?.data?.message || 'Failed to reset password'
      throw error
    } finally {
      state.isLoading = false
    }
  }

  const clearResetState = () => {
    state.resetToken = null
    state.email = null
    state.resetCode = null
    state.error = null
    state.isLoading = false
  }

  const clearError = () => {
    state.error = null
  }

  // Computed getters for easier access to state
  const getResetToken = (): string | null => state.resetToken
  const getEmail = (): string | null => state.email
  const getResetCode = (): string | null => state.resetCode
  const getIsLoading = (): boolean => state.isLoading
  const getError = (): string | null => state.error

  return {
    state,
    sendResetCode,
    verifyResetCode,
    resetPassword,
    clearResetState,
    clearError,
    getResetToken,
    getEmail,
    getResetCode,
    getIsLoading,
    getError,
  }
})
