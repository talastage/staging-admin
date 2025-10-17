<template>
  <div>
    <v-container class="pa-4">
      <!-- Show current talent status if user has a talent -->
      <template v-if="userHasTalent">
        <TalentCurrentStatus @change-talent="handleChangeTalent" />
      </template>

      <!-- Show talent registration page if user has no talent -->
      <template v-else>
        <TalentRegisterPage />
      </template>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useAppsStore } from '@/stores/useApps'
import { computed, watch } from 'vue'

definePageMeta({
  middleware: 'auth', // Ensure user is authenticated
})

const authStore = useAuthStore()
const appsStore = useAppsStore()

// Check if user has talent
const userHasTalent = computed(() => {
  return !!authStore.user?.value?.talent
})

// Handle talent change request
const handleChangeTalent = async () => {
  // You might want to show a confirmation dialog here
  const confirmed = await confirm(
    'Are you sure you want to change your talent?'
  )
  if (confirmed) {
    // Reset talent status and show registration page
    await authStore.fetchUser() // Refresh user data
    // You might need to implement an API endpoint to reset talent
  }
}

// Fetch app data
await appsStore.fetchTalaStageApp()
const talastageApp = computed(() => appsStore.talastageApp)

// SEO and meta tags setup (keeping your existing setup)
watch(
  () => talastageApp.value,
  (appData) => {
    if (appData) {
      const title = `${
        userHasTalent.value ? 'Manage' : 'Register'
      } Your Talent - ${appData.name || 'TalaStage'}`
      // ... rest of your SEO setup
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
/* Your existing styles */
</style>
