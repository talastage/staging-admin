<!-- components/WalletPinVerification.vue -->
<template>
  <div class="wallet-pin-verification">
    <v-form @submit.prevent="verifyPin">
      <v-otp-input
        v-model="pin"
        :length="6"
        type="number"
        @finish="verifyPin"
        class="mb-4"
        :disabled="isLoading"
        placeholder="•"
        autofocus
      />
      <v-btn
        color="primary"
        type="submit"
        :loading="isLoading"
        :disabled="!isValidPin || isLoading"
        block
        elevation="0"
      >
        Verify PIN
      </v-btn>
    </v-form>
    <v-btn
      variant="text"
      color="primary"
      @click="forgotPin"
      :disabled="isLoading"
      class="mt-2"
    >
      Forgot PIN?
    </v-btn>
    <v-alert v-if="error" type="error" class="mt-4" density="compact">
      {{ error }}
    </v-alert>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useWalletAuthStore } from '~/stores/useWalletAuthStore'

const emit = defineEmits(['verified', 'error', 'forgot-pin'])

const walletAuthStore = useWalletAuthStore()
const pin = ref('')
const isLoading = ref(false)
const error = ref('')

const isValidPin = computed(() => pin.value.length === 6)

const verifyPin = async () => {
  if (!isValidPin.value) return

  isLoading.value = true
  error.value = ''

  try {
    await walletAuthStore.verifyPin(pin.value)
    emit('verified')
    pin.value = '' // Clear PIN after successful verification
  } catch (err) {
    error.value = walletAuthStore.authError || 'Invalid PIN. Please try again.'
    emit('error', err)
  } finally {
    isLoading.value = false
  }
}

const forgotPin = () => {
  emit('forgot-pin')
}
</script>

<style scoped>
.wallet-pin-verification {
  max-width: 400px;
  margin: 0 auto;
}

:deep(.v-otp-input input) {
  font-size: 1.25rem;
  border-radius: 6px;
}

.v-btn {
  border-radius: 8px;
  text-transform: none;
}
</style>
