<!-- components/WalletPinVerificationDialog.vue -->
<template>
  <BaseDialog
    v-model="internalDialog"
    title="Verify Wallet PIN"
    max-width="450px"
    :show-close-button="true"
  >
    <template #default>
      <div class="pa-4">
        <p class="text-body-1 text-center mb-6">
          Please enter your 6-digit wallet PIN to confirm this action
        </p>
        <WalletPinVerification
          @verified="handleVerified"
          @error="handleError"
          @forgot-pin="handleForgotPin"
        />
      </div>
    </template>
  </BaseDialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
})

const emit = defineEmits([
  'update:modelValue',
  'verified',
  'error',
  'forgot-pin',
])

const internalDialog = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newVal) => {
    internalDialog.value = newVal
  }
)

watch(internalDialog, (newVal) => {
  emit('update:modelValue', newVal)
})

const handleVerified = () => {
  emit('verified')
  internalDialog.value = false
}

const handleError = (err) => {
  emit('error', err)
}

const handleForgotPin = () => {
  emit('forgot-pin')
  internalDialog.value = false
}
</script>
