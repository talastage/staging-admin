<template>
  <div class="talent-register-dialog">
    <v-dialog
      v-model="dialogVisibleInternal"
      max-width="700px"
      persistent
      :scrim="true"
    >
      <v-card>
        <v-card-text class="pa-4 pt-6">
          <!-- Quick Talent Selection -->
          <QuickTalentSelection
            v-if="isCreateMode"
            @talent-registered="handleQuickTalentRegistered"
            @talent-selected="handleQuickTalentSelected"
            @error="handleError"
          />

          <v-divider v-if="isCreateMode" class="my-4"></v-divider>

          <!-- Manual Talent Selection Form -->
          <TalentRegisterForm
            ref="talentFormRef"
            :mode="mode"
            :is-dialog-mode="true"
            @talent-updated="handleTalentUpdated"
            @success="handleSuccess"
            @error="handleError"
          />
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeDialog" :disabled="isFormBusy">
            {{ showSuccess ? 'Close' : 'Cancel' }}
          </v-btn>
          <v-btn
            v-if="!showSuccess"
            color="primary"
            @click="submitForm"
            :disabled="!formIsValid || isFormBusy"
            :loading="isFormBusy"
            size="large"
            class="register-btn"
          >
            {{ isCreateMode ? 'Register Talent' : 'Save Changes' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onBeforeUnmount,
  defineProps,
  defineEmits,
} from 'vue'
import { useRouter } from 'vue-router'
import { useSnackMessageStore } from '@/stores/useSnackMessage'
import TalentRegisterForm from '~/components/talent/TalentRegisterForm.vue'
import QuickTalentSelection from '~/components/talent/QuickTalentSelection.vue'

const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'update'
}>()

const emit = defineEmits(['update:modelValue', 'talent-updated'])

const isCreateMode = computed(() => props.mode === 'create')

const dialogVisibleInternal = ref(props.modelValue)
watch(
  () => props.modelValue,
  (val) => {
    dialogVisibleInternal.value = val
  }
)
watch(dialogVisibleInternal, (val) => {
  emit('update:modelValue', val)
})

// Form reference and state
const talentFormRef = ref<InstanceType<typeof TalentRegisterForm> | null>(null)
const showSuccess = ref(false)
const successTimeout = ref<number | null>(null)

const formIsValid = computed(() => {
  return talentFormRef.value?.formIsValid ?? false
})

const isFormBusy = computed(() => {
  const form = talentFormRef.value
  return form?.isUpdating || form?.registering || false
})

// Form methods
const submitForm = () => {
  talentFormRef.value?.submitTalent()
}

const handleTalentUpdated = (talent: any) => {
  emit('talent-updated', talent)
}

const router = useRouter()
const snackStore = useSnackMessageStore()

const handleSuccess = (message: string) => {
  showSuccess.value = true
  
  // Show success message using snack store
  snackStore.success(message, { timeout: 3000 })

  // Auto-close dialog and redirect after success
  successTimeout.value = setTimeout(() => {
    closeDialog()
    router.push('/') // Redirect to home page
  }, 3000)
}

const handleQuickTalentRegistered = (talent: any) => {
  emit('talent-updated', talent)
  // Use the actual talent name in the success message
  handleSuccess(`Talent "${talent.name}" registered successfully!`)
}

const handleQuickTalentSelected = (talent: any) => {
  // When a talent is selected from QuickTalentSelection, reset the form
  talentFormRef.value?.resetForm()
}

const handleError = (error: string) => {
  // Show error using snack store
  snackStore.error(error, { timeout: 5000 })
  console.error('Talent registration error:', error)
}

function closeDialog() {
  dialogVisibleInternal.value = false
  resetDialog()
}

function resetDialog() {
  showSuccess.value = false
  talentFormRef.value?.resetForm()
  clearTimeout()
}

function clearTimeout() {
  if (successTimeout.value) {
    clearTimeout(successTimeout.value)
    successTimeout.value = null
  }
}

// Initialize form when dialog opens
watch(dialogVisibleInternal, async (isVisible) => {
  if (isVisible && talentFormRef.value) {
    await talentFormRef.value.initializeForm()
  }
})

onBeforeUnmount(() => {
  clearTimeout()
})
</script>

<style scoped>
.register-btn {
  font-weight: 600;
  min-width: 160px;
  letter-spacing: 0.5px;
}
</style>