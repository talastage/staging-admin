<template>
  <div>
    <v-container class="pa-4">
      <!-- Show current talent status if user has a talent -->
      <template v-if="userHasTalent">
        <BaseContent title="Your Talent" subtitle="Manage your current talent profile">
          <template #content>
            <TalentCurrentStatus @change-talent="handleChangeTalent" />
          </template>
        </BaseContent>
      </template>

      <!-- Show talent registration form if user has no talent -->
      <template v-else>
        <QuickTalentSelection 
          @talent-registered="handleQuickTalentRegistered"
          @talent-selected="handleQuickTalentSelected"
          @error="handleRegistrationError"
          class="mb-6"
        />
        <v-divider class="mb-6"></v-divider>
        <TalentRegisterForm
          mode="create"
          :is-dialog-mode="false"
          @talent-updated="handleTalentUpdated"
          @success="handleRegistrationSuccess"
          @error="handleRegistrationError"
          ref="talentRegisterForm"
        />
      </template>
    </v-container>

    <!-- Snackbars are now handled by the snack message store -->
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useAppsStore } from '@/stores/useApps'
import { useSnackMessageStore } from '@/stores/useSnackMessage'
import { computed, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import TalentCurrentStatus from '@/components/talent/TalentCurrentStatus.vue'
import TalentRegisterForm from '@/components/talent/TalentRegisterForm.vue'
import QuickTalentSelection from '@/components/talent/QuickTalentSelection.vue'
import BaseContent from '@/components/base/BaseContent.vue'

definePageMeta({
  middleware: 'auth', // Ensure user is authenticated
})

const authStore = useAuthStore()
const appsStore = useAppsStore()

// Using global snack message store for notifications

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

// Handle talent registration success
const handleTalentUpdated = async (talent: any) => {
  console.log('Talent updated:', talent)
  // Refresh user data to reflect the changes
  await authStore.fetchUser()
}

const router = useRouter()
const snackStore = useSnackMessageStore()

const handleRegistrationSuccess = (message: string) => {
  // Use snack store instead of local snackbar
  snackStore.success(message, { timeout: 3000 })
  
  // Redirect to home page after a delay
  setTimeout(() => {
    router.push('/')
  }, 3000)
}

const handleRegistrationError = (error: string) => {
  snackStore.error(error, { timeout: 5000 })
}

const talentRegisterForm = ref(null)

// QuickTalentSelection handlers
const handleQuickTalentRegistered = async (talent: any) => {
  console.log('Quick talent registered:', talent)
  await authStore.fetchUser()
  // Use the actual message from the response
  handleRegistrationSuccess(`Talent "${talent.name}" registered successfully!`)
}

const handleQuickTalentSelected = () => {
  // Clear manual selection in TalentRegisterForm when a quick talent is selected
  if (talentRegisterForm.value) {
    talentRegisterForm.value.resetForm()
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
