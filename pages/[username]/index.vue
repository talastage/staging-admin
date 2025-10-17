<template>
  <div class="profile-redirect">
    <div class="loading-spinner"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { DEFAULT_TAB } from '~/config/profile'
import { useProfileStore } from '@/stores/useProfileStore'

const router = useRouter()
const route = useRoute()
const profileStore = useProfileStore()

onMounted(async () => {
  try {
    const username = route.params.username
    
    // Check if this is a valid username route or a 404
    if (NON_USERNAME_ROUTES.includes(username)) {
      await router.replace('/404')
      return
    }
    
    // Use the profile store to check if user exists
    const userExists = await profileStore.fetchProfile(username)
    
    if (userExists) {
      await router.replace(`/${username}/${DEFAULT_TAB}`)
    } else {
      // If user not found, redirect to user not found page
      await router.replace('/user-not-found')
    }
  } catch (error) {
    console.error('Navigation error:', error)
    await router.replace('/error')
  }
})

// Import the centralized routes list
import { NON_USERNAME_ROUTES } from '~/utils/routes'
</script>

<style scoped>
.profile-redirect {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #1867C0;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>