<template>
  <div class="user-profile-settings-card mb-3">
    <div class="profile-section">
      <div class="profile-info">
        <UserProfilePhoto :user="user" />
        <div class="user-details">
          <h3>@{{ user.username }}</h3>
          <p>{{ websiteUrl }}</p>
        </div>
      </div>
      <v-btn
        @click="openUsernameDialog"
        color="primary"
        :disabled="!user.can_change_username"
      >
        Change Username
      </v-btn>
    </div>

    <BaseDialog v-model="dialog" title="Change Username" max-width="400px">
      <v-text-field
        v-model="newUsername"
        label="New Username"
        :error-messages="usernameErrors"
        :disabled="!user.can_change_username"
        :rules="[required, username]"
        @input="handleUsernameInput"
      ></v-text-field>
      <p v-if="!user.can_change_username" class="warning-text">
        Your username can be changed once every 30 days. You can change it again
        after {{ user.next_username_change_date }}.
      </p>
      <p v-if="isChecking" class="info-text">
        Checking username availability...
      </p>
      <p v-else-if="isAvailable" class="success-text">Username is available!</p>
      <p v-else-if="isAvailable === false" class="error-text">
        Username is not available.
      </p>
      <template #actions>
        <BaseButton
          title="Save"
          @click="confirmUsernameChange"
          :disabled="
            !isUsernameValid || !user.can_change_username || !isAvailable
          "
          :loading="loading"
          color="primary"
          full-width
        />
      </template>
    </BaseDialog>

    <ConfirmDialog
      v-model="showConfirmDialog"
      title="Confirm Username Change"
      @confirm="changeUsername"
    >
      <p>
        Are you sure you want to change your username to @{{ newUsername }}?
      </p>
    </ConfirmDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useNuxtApp } from '#app'
import { useAuthStore } from '~/stores/auth'
import { useValidation } from '~/composables/useValidation'
import { useDebounce } from '~/composables/useDebounce'

const { $axios, $toast } = useNuxtApp()
const authStore = useAuthStore()
const { required, username } = useValidation()
const { debounce } = useDebounce()

const user = computed(() => authStore.user?.value)

const dialog = ref(false)
const showConfirmDialog = ref(false)
const newUsername = ref('')
const loading = ref(false)
const usernameErrors = ref([])
const isAvailable = ref(null)
const isChecking = ref(false)

const websiteUrl = computed(() => `www.talaconnect.com/@${user.value.username}`)

const isUsernameValid = computed(() => {
  return newUsername.value && username(newUsername.value) === true
})

const openUsernameDialog = () => {
  if (user.value.can_change_username) {
    newUsername.value = user.value.username
    isAvailable.value = null
    usernameErrors.value = []
    dialog.value = true
  }
}

const checkUsername = async () => {
  if (!isUsernameValid.value || newUsername.value === user.value.username) {
    isAvailable.value = null
    return
  }

  isChecking.value = true
  isAvailable.value = null

  try {
    const response = await $axios.get(
      `/api/user/check-username/${newUsername.value}`
    )
    isAvailable.value = response.data.available
  } catch (error) {
    console.error('Error checking username:', error)
    isAvailable.value = false

    // Handle validation errors from backend
    if (error.response?.data?.errors) {
      usernameErrors.value = Object.values(error.response.data.errors).flat()
    }
  } finally {
    isChecking.value = false
  }
}

const debouncedCheckUsername = debounce(checkUsername, 300)

const handleUsernameInput = () => {
  // Clear previous errors
  usernameErrors.value = []
  isAvailable.value = null

  // If username is same as current, don't check
  if (newUsername.value === user.value.username) {
    return
  }

  // Only check if username is valid
  if (isUsernameValid.value) {
    debouncedCheckUsername()
  }
}

const confirmUsernameChange = () => {
  if (
    !isUsernameValid.value ||
    !user.value.can_change_username ||
    !isAvailable.value ||
    newUsername.value === user.value.username
  ) {
    return
  }
  showConfirmDialog.value = true
}

const changeUsername = async () => {
  loading.value = true
  usernameErrors.value = []

  try {
    const response = await $axios.post('/api/user/change-username', {
      username: newUsername.value,
    })

    // Handle successful response
    if (response.data && response.data.username) {
      // Update the auth store with the new username
      authStore.updateUsername(response.data.username)

      // Show success message
      $toast.success(response.data.message || 'Username changed successfully!')

      // Close dialogs
      dialog.value = false
      showConfirmDialog.value = false

      // Reset form state
      isAvailable.value = null
      usernameErrors.value = []
    }
  } catch (error) {
    console.error('Username change error:', error)

    // Handle validation errors
    if (error.response?.data?.errors) {
      usernameErrors.value = Object.values(error.response.data.errors).flat()
    } else if (error.response?.data?.error) {
      usernameErrors.value = [error.response.data.error]
    } else {
      usernameErrors.value = ['An error occurred while changing the username.']
    }

    // Show error toast
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Failed to change username. Please try again.'
    $toast.error(errorMessage)
  } finally {
    loading.value = false
  }
}

// Watch for username changes to reset availability check
watch(newUsername, (newVal) => {
  if (newVal !== user.value.username) {
    isAvailable.value = null
  }
})

onMounted(() => {
  if (!user.value) {
    authStore.fetchUser()
  }
})
</script>

<style scoped>
.user-profile-settings-card {
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.profile-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.profile-info {
  display: flex;
  align-items: center;
}

.user-details {
  margin-left: 16px;
}

.user-details h3 {
  margin: 0;
  font-size: 1.2em;
}

.user-details p {
  margin: 4px 0 0;
  color: #666;
  font-size: 0.9em;
}

.warning-text {
  color: #ff9800;
  font-size: 0.9em;
  margin-top: 8px;
}

.info-text {
  color: #2196f3;
  font-size: 0.9em;
  margin-top: 8px;
}

.success-text {
  color: #4caf50;
  font-size: 0.9em;
  margin-top: 8px;
}

.error-text {
  color: #f44336;
  font-size: 0.9em;
  margin-top: 8px;
}
</style>
