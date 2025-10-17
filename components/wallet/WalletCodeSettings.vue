<template>
  <div class="wallet-code-section">
    <!-- Wallet Code Display -->
    <v-card variant="outlined" class="mb-4">
      <v-card-text class="pa-4">
        <div class="d-flex flex-column gap-2">
          <span class="text-subtitle-2 text-medium-emphasis"
            >Your Wallet Code</span
          >
          <div class="d-flex align-center gap-2">
            <v-text-field
              ref="walletCodeField"
              :model-value="walletStore.wallet?.data?.wallet_code"
              readonly
              density="comfortable"
              variant="outlined"
              hide-details
              :type="showCode ? 'text' : 'password'"
              :placeholder="hideCodePlaceholder"
            >
              <template v-slot:append-inner>
                <v-icon
                  @click="toggleCodeVisibility"
                  :icon="showCode ? 'mdi-eye-off' : 'mdi-eye'"
                  class="cursor-pointer"
                />
              </template>
            </v-text-field>
            <v-btn
              color="primary"
              variant="tonal"
              @click="copyWalletCode"
              :loading="copying"
              :disabled="!walletStore.wallet?.data?.wallet_code"
              icon
            >
              <v-icon>{{ copied ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Information Alert -->
    <v-alert
      type="info"
      variant="tonal"
      border="start"
      density="comfortable"
      class="mb-4"
    >
      <template v-slot:prepend>
        <v-icon icon="mdi-information" size="small" />
      </template>
      <div class="d-flex flex-column">
        <span class="font-weight-medium">Wallet Code Information</span>
        <span class="text-body-2">
          This is your unique wallet identifier. Share this code with others to
          receive transfers. Keep it secure and only share with trusted
          individuals.
        </span>
      </div>
    </v-alert>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      :timeout="2000"
      color="success"
      location="top"
    >
      Wallet code copied to clipboard!
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWalletStore } from '~/stores/useWalletStore'

const walletStore = useWalletStore()
const walletCodeField = ref<any>(null)
const showCode = ref(false)
const copying = ref(false)
const copied = ref(false)
const showSnackbar = ref(false)

const hideCodePlaceholder = computed(() => {
  const length = walletStore.wallet?.data?.wallet_code?.length || 8
  return '•'.repeat(length)
})

const toggleCodeVisibility = () => {
  showCode.value = !showCode.value
}

const copyWalletCode = async () => {
  const walletCode = walletStore.wallet?.data?.wallet_code
  if (!walletCode) return

  copying.value = true
  copied.value = false

  try {
    // Method 1: Using Clipboard API
    await navigator.clipboard.writeText(walletCode)
    copied.value = true
    showSnackbar.value = true
  } catch (error) {
    try {
      // Method 2: Fallback using select/execCommand
      if (walletCodeField.value) {
        const input = walletCodeField.value.$el.querySelector('input')
        const originalType = input.type
        input.type = 'text' // Temporarily show the text
        input.select()
        document.execCommand('copy')
        input.type = originalType // Restore the original type
        copied.value = true
        showSnackbar.value = true
      }
    } catch (fallbackError) {
      console.error('Failed to copy wallet code:', fallbackError)
    }
  } finally {
    copying.value = false
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

// Optional: Fetch wallet data if not already loaded
onMounted(async () => {
  if (!walletStore.wallet?.data) {
    await walletStore.fetchWallet()
  }
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
