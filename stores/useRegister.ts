// stores/useRegister.ts
import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import { useAuthStore } from './auth'
import { useRouter } from 'vue-router'

interface Country {
  id: number
  code: string
  name: string
  phone_code: string
}

interface RegisterErrors {
  email: string
  first_name: string
  last_name: string
  display_name: string
  gender: string
  country_id: string
  birthday: string
  password: string
  verification_code: string
}

export const useRegisterStore = defineStore('register', {
  state: () => ({
    step: 'contact-info',
    email: '',
    firstName: '',
    lastName: '',
    displayName: '',
    gender: '',
    country: null as Country | null,
    birthday: '',
    password: '',
    userId: null as number | null,
    isVerificationSent: false,
    // Social registration fields
    isSocialRegistration: false,
    socialUserId: null as number | null,
    socialData: null as any,
    errors: {
      email: '',
      first_name: '',
      last_name: '',
      display_name: '',
      gender: '',
      country_id: '',
      birthday: '',
      password: '',
      verification_code: '',
    } as RegisterErrors,
  }),

  getters: {
    hasErrors: (state) =>
      Object.values(state.errors).some((error) => error !== ''),
    formData: (state) => ({
      email: state.email,
      first_name: state.firstName,
      last_name: state.lastName,
      display_name: state.displayName,
      gender: state.gender,
      country_id: state.country?.id,
      birthday: state.birthday,
      password: state.password,
    }),
  },

  actions: {
    setStep(step: string) {
      this.step = step
    },

    async registerEmail() {
      const { $axios } = useNuxtApp()
      try {
        const response = await $axios.post('/api/register/contact-info', {
          email: this.email,
        })
        this.userId = response.data.user_id
        this.clearErrors()

        // Handle both new registrations and incomplete registrations
        if (response.data.message.includes('resent') || response.data.incomplete_registration) {
          this.setStep('verification')
        }

        return response.data
      } catch (error: any) {
        this.handleError(error)
        throw error
      }
    },

    async verifyCode(code: string) {
      const { $axios } = useNuxtApp()
      try {
        const response = await $axios.post('/api/register/verify-code', {
          email: this.email,
          code: code,
        })
        this.setStep('personal-info')
        this.clearErrors()
        return response.data
      } catch (error: any) {
        this.handleError(error)
        throw error
      }
    },

    async resendVerificationCode() {
      const { $axios } = useNuxtApp()
      try {
        const response = await $axios.post('/api/register/resend-code', {
          email: this.email,
        })
        this.clearErrors()
        return response.data
      } catch (error: any) {
        this.handleError(error)
        throw error
      }
    },

    async completeRegistration(formData: any) {
      try {
        const result = await this.registerPersonalInfo()
        this.clearErrors()
        return result
      } catch (error: any) {
        this.handleError(error)
        throw error
      }
    },

    async registerPersonalInfo() {
      const { $axios } = useNuxtApp()
      const router = useRouter()
      const authStore = useAuthStore()

      try {
        if (!this.validatePersonalInfo()) {
          throw new Error('Please check the form for errors')
        }

        const response = await $axios.post('/api/register/personal-info', {
          user_id: this.userId,
          first_name: this.firstName,
          last_name: this.lastName,
          display_name: this.displayName || null,
          gender: this.gender,
          country_id: this.country?.id,
          birthday: this.birthday,
          password: this.password,
        })

        this.clearErrors()

        // Handle login after successful registration
        if (response.data.user && response.data.token) {
          await authStore.handleRegistrationSuccess({
            user: response.data.user,
            token: response.data.token,
          })
        }

        return response.data
      } catch (error: any) {
        this.handleError(error)
        throw error
      }
    },

    handleError(error: any) {
      if (error.response) {
        if (error.response.status === 422) {
          const responseErrors = error.response.data.errors || {}
          // Clear existing errors first
          this.clearErrors()

          // Check for single error message in error.response.data.error
          if (error.response.data.error) {
            this.errors.email = error.response.data.error
            throw new Error(error.response.data.error)
          }

          // Map backend error keys to frontend keys
          const errorMapping: Record<string, keyof RegisterErrors> = {
            email: 'email',
            country_id: 'country_id',
            first_name: 'first_name',
            last_name: 'last_name',
            display_name: 'display_name',
            gender: 'gender',
            birthday: 'birthday',
            password: 'password',
          }

          // Process each error
          Object.entries(responseErrors).forEach(([key, messages]) => {
            const frontendKey = errorMapping[key]
            if (frontendKey) {
              this.errors[frontendKey] = Array.isArray(messages)
                ? messages[0]
                : messages
            }
          })

          // Handle specific error cases
          if (responseErrors.age) {
            this.errors.birthday = 'You must be at least 18 years old'
          }
        } else if (error.response.data.error) {
          // Handle other error responses with a single error message
          this.errors.email = error.response.data.error
          throw new Error(error.response.data.error)
        }
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error('An unexpected error occurred')
      }
    },

    clearErrors() {
      Object.keys(this.errors).forEach((key) => {
        this.errors[key as keyof RegisterErrors] = ''
      })
    },

    setSocialRegistration(data: { userId: number; socialData: any; isSocial: boolean }) {
      this.isSocialRegistration = data.isSocial
      this.socialUserId = data.userId
      this.socialData = data.socialData
      
      // Pre-fill form data from social provider
      if (data.socialData) {
        this.firstName = data.socialData.first_name || ''
        this.lastName = data.socialData.last_name || ''
        this.email = data.socialData.email || ''
      }
    },

    resetForm() {
      this.step = 'contact-info'
      this.email = ''
      this.firstName = ''
      this.lastName = ''
      this.displayName = ''
      this.gender = ''
      this.country = null
      this.birthday = ''
      this.password = ''
      this.userId = null
      this.isVerificationSent = false
      // Reset social fields
      this.isSocialRegistration = false
      this.socialUserId = null
      this.socialData = null
      this.clearErrors()
    },

    validateContactInfo(): boolean {
      this.clearErrors()
      let isValid = true

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!this.email || !emailRegex.test(this.email)) {
        this.errors.email = 'Please enter a valid email address'
        isValid = false
      }

      return isValid
    },

    validatePersonalInfo(): boolean {
      this.clearErrors()
      let isValid = true

      // Required field validations
      if (!this.firstName?.trim()) {
        this.errors.first_name = 'First name is required'
        isValid = false
      }

      if (!this.lastName?.trim()) {
        this.errors.last_name = 'Last name is required'
        isValid = false
      }

      if (!this.gender) {
        this.errors.gender = 'Gender is required'
        isValid = false
      }

      if (!this.country) {
        this.errors.country_id = 'Country is required'
        isValid = false
      }

      if (!this.birthday) {
        this.errors.birthday = 'Birthday is required'
        isValid = false
      }

      // Password validation
      if (!this.password) {
        this.errors.password = 'Password is required'
        isValid = false
      } else {
        const passwordChecks = [
          {
            condition: this.password.length >= 8,
            message: 'at least 8 characters',
          },
          {
            condition: /[a-z]/.test(this.password),
            message: 'one lowercase letter',
          },
          {
            condition: /[A-Z]/.test(this.password),
            message: 'one uppercase letter',
          },
          { condition: /\d/.test(this.password), message: 'one number' },
          {
            condition: /[!@#$%^&*(),.?":{}|<>]/.test(this.password),
            message: 'one special character',
          },
        ]

        const failedChecks = passwordChecks.filter((check) => !check.condition)
        if (failedChecks.length > 0) {
          this.errors.password =
            'Password must include ' +
            failedChecks.map((check) => check.message).join(', ')
          isValid = false
        }
      }

      // Optional display name validation
      if (this.displayName && this.displayName.length > 255) {
        this.errors.display_name = 'Display name cannot exceed 255 characters'
        isValid = false
      }

      return isValid
    },
  },
})
