<!-- LoginForm.vue -->
<template>
  <v-form @submit.prevent="handleLogin" ref="form" class="login-form">
    <v-text-field
      v-model="credentials.email"
      label="Email"
      placeholder="email@example.com"
      variant="outlined"
      density="compact"
      prepend-inner-icon="mdi-email"
      :persistent-placeholder="true"
      :single-line="true"
      class="custom-text-field mb-3"
      autocomplete="email"
      type="email"
      name="email"
      :rules="emailRules"
    ></v-text-field>

    <v-text-field
      v-model="credentials.password"
      label="Password"
      placeholder="Enter your password"
      :type="showPassword ? 'text' : 'password'"
      variant="outlined"
      density="compact"
      :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="togglePasswordVisibility"
      prepend-inner-icon="mdi-lock"
      :persistent-placeholder="true"
      :single-line="true"
      class="custom-text-field mb-3"
      autocomplete="current-password"
      name="password"
      :rules="passwordRules"
    ></v-text-field>

    <div class="d-flex justify-end mb-3">
      <NuxtLink
        to="/password/reset"
        class="text-decoration-none text-caption text-primary forgot-link"
      >
        Forgot Password?
      </NuxtLink>
    </div>

    <AlertMessage
      :message="authStore.loginError"
      type="error"
      :visible="!!authStore.loginError"
      class="mb-3"
    />

    <v-btn
      type="submit"
      color="primary"
      block
      :loading="isLoading"
      class="text-body-1 login-btn"
      height="42"
    >
      Log In
    </v-btn>

    <!-- Social Login Section -->
    <SocialLoginButtons 
      mode="login"
      @social-success="handleSocialSuccess"
      @social-error="handleSocialError"
      class="mt-3"
    />
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const form = ref<InstanceType<typeof import('vuetify').VForm> | null>(null)
const showPassword = ref(false)
const isLoading = ref(false)

const credentials = reactive({
  email: '',
  password: '',
})

// Validation rules
const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Invalid email format',
]

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters',
]

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  const isValid = form.value?.validate()
  if (!isValid) return

  isLoading.value = true
  authStore.loginError = null

  try {
    await authStore.login(credentials)
    await authStore.fetchUser()
    clearForm()
    emit('login-success')
  } catch (error: any) {
    console.error('Login error:', error)
    authStore.loginError = error.message || 'Login failed'
  } finally {
    isLoading.value = false
  }
}

const clearForm = () => {
  credentials.email = ''
  credentials.password = ''
  form.value?.reset()
}

const emit = defineEmits<{
  (e: 'login-success'): void
}>()

const handleSocialSuccess = (data: any) => {
  // Social login success is handled by the auth store
  emit('login-success')
}

const handleSocialError = (error: string) => {
  authStore.loginError = error
}
</script>

<style scoped>
.login-form {
  padding: 0;
  width: 100%;
}

.custom-text-field {
  width: 100%;
}

.login-btn {
  transition: background-color 0.3s ease;
  font-weight: 500;
}

.login-btn:hover {
  background-color: rgb(var(--v-theme-primary)) !important;
  opacity: 0.8 !important;
  color: white !important;
}

.forgot-link:hover {
  text-decoration: underline;
}
</style>
