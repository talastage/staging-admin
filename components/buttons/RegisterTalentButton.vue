<!-- components/RegisterTalentButton.vue -->
<template>
  <BaseButton
    title="Register as Talent"
    :action="handleRegisterClick"
    :color="color"
    :variant="variant"
    :disabled="disabled"
    :loading="loading || isProcessing"
    :full-width="fullWidth"
    :prepend-icon="prependIcon"
    :append-icon="appendIcon"
    :custom-class="customClass"
    :elevation="elevation"
    :height="height"
  />
</template>

<script setup>
const router = useRouter()
const { $protectedAction } = useNuxtApp()
const isProcessing = ref(false)

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: 'primary',
  },
  variant: {
    type: String,
    default: 'elevated',
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
  prependIcon: {
    type: String,
    default: 'mdi-account-plus',
  },
  appendIcon: {
    type: String,
    default: '',
  },
  customClass: {
    type: String,
    default: '',
  },
  elevation: {
    type: [Number, String],
    default: 0,
  },
  height: {
    type: [Number, String],
    default: 40,
  },
})

const navigateToRegister = () => {
  router.push('/register/talent')
}

const handleRegisterClick = () => {
  isProcessing.value = true

  $protectedAction(
    () => Promise.resolve(), // Simple resolved promise as we just need auth check
    {
      requiresAuth: true,
      onSuccess: () => {
        navigateToRegister()
      },
      onError: (error) => {
        console.error('Error in protected action:', error)
      },
    }
  ).finally(() => {
    isProcessing.value = false
  })
}
</script>
