<!-- TalentRegisterForm.vue - Refactored version -->
<template>
  <div class="talent-register-form">
    <!-- Current Talent Display (Update Mode) -->
    <div
      v-if="!isCreateMode && currentTalentDisplay"
      class="current-talent mb-6"
    >
      <UserTalentDisplay :user-talent="currentTalentDisplay" :compact="true" />
    </div>

    <!-- Manual Selection Section -->
    <BaseContent
      :title="isCreateMode ? 'Choose Your  Category' : 'Update Your  Category'"
      :subtitle="
        isCreateMode
          ? 'Select the category that best represents you'
          : 'Switch to a different category that better matches you.'
      "
    >
      <template #action>
        <v-btn
          v-if="!isDialogMode && !showSuccess"
          color="primary"
          @click="debouncedSubmit"
          :disabled="!formIsValid || isUpdating || registering"
          :loading="isUpdating || registering"
          size="large"
          class="register-btn"
        >
          {{ isCreateMode ? 'Register Talent' : 'Save Changes' }}
        </v-btn>
      </template>
      <template #content>
        <div class="manual-talent-selection">
          <SelectTalentCategory
            v-model="selectedCategory"
            :disabled="isUpdating || registering"
          />
          <SelectTalent
            v-model="selectedTalent"
            :category="selectedCategory"
            :disabled="isUpdating || registering"
          />
        </div>
      </template>
    </BaseContent>

    <!-- Request New Category -->
    <div class="text-center mt-6">
      <ReportMissingTalentDialog />
    </div>

    <!-- Success Alert -->
    <v-alert
      v-if="showSuccess"
      type="success"
      class="mt-4"
      closable
      @click:close="showSuccess = false"
    >
      {{ successMessage }}
    </v-alert>

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      class="mt-4"
      closable
      @click:close="error = null"
      title="Error"
      text="Please try again or contact support if the problem persists."
    >
      {{ error }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  defineProps,
  defineEmits,
  nextTick,
} from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTalentCategoryStore } from '@/stores/useTalentCategories'
import debounce from 'lodash/debounce'
import type { TalentCategory, Talent } from '@/types/categories'
import BaseContent from '@/components/base/BaseContent.vue'

const props = defineProps<{
  mode: 'create' | 'update'
  isDialogMode?: boolean
  autoFetchPopular?: boolean
}>()

const emit = defineEmits(['talent-updated', 'success', 'error'])

const authStore = useAuthStore()
const talentCategoryStore = useTalentCategoryStore()
const { $axios } = useNuxtApp()

const isCreateMode = computed(() => props.mode === 'create')
const isDialogMode = computed(() => props.isDialogMode ?? false)

const user = computed(() => authStore.user?.value)
const currentTalentDisplay = computed(() => {
  if (!user.value?.talent_details) return null
  const { category, talent, category_id, talent_id } = user.value.talent_details
  return { category, talent, category_id, talent_id }
})

// State
const isUpdating = ref(false)
const error = ref<string | null>(null)
const showSuccess = ref(false)
const successMessage = ref('')
const retryCount = ref(0)
const successTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const errorTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const isInitialized = ref(false)
const registering = ref(false)

const selectedCategory = ref<TalentCategory | null>(null)
const selectedTalent = ref<Talent | null>(null)

const MAX_RETRIES = 2

const formIsValid = computed(() => {
  // Check if manual selection is complete
  const hasManualSelection =
    selectedCategory.value?.id && selectedTalent.value?.id

  if (!hasManualSelection) return false

  if (!isCreateMode.value && hasManualSelection) {
    // For update mode, check if selection is different from current
    if (
      currentTalentDisplay.value?.category_id === selectedCategory.value?.id &&
      currentTalentDisplay.value?.talent_id === selectedTalent.value?.id
    ) {
      return false
    }
  }

  return true
})

function clearTimeouts() {
  if (successTimeout.value) clearTimeout(successTimeout.value)
  if (errorTimeout.value) clearTimeout(errorTimeout.value)
}

function handleError(err: any) {
  const errorMessage =
    typeof err === 'string'
      ? err
      : err.response?.data?.message ||
        'Failed to save talent. Please try again.'

  error.value = errorMessage
  emit('error', errorMessage)

  errorTimeout.value = setTimeout(() => {
    error.value = null
  }, 5000) as any
}

async function submitTalent() {
  if (!formIsValid.value) return

  isUpdating.value = true
  error.value = null
  showSuccess.value = false
  clearTimeouts()

  try {
    const payload = {
      talent_category_id: selectedCategory.value?.id,
      talent_id: selectedTalent.value?.id,
    }

    let response
    if (isCreateMode.value) {
      response = await $axios.post('/api/user/talent', payload)
    } else {
      response = await $axios.put('/api/user/talent', payload)
    }

    if (
      response.data.message === 'Talent created successfully' ||
      response.data.message === 'Talent updated successfully'
    ) {
      authStore.updateUser({
        has_talent: 'yes',
        talent: selectedCategory.value?.name || null,
        talent_details: {
          category: selectedCategory.value?.name || '',
          talent: selectedTalent.value?.name || '',
          talent_id: selectedTalent.value?.id,
          category_id: selectedCategory.value?.id,
        },
      })

      successMessage.value = response.data.message
      showSuccess.value = true

      emit('talent-updated', selectedCategory.value)
      emit('success', response.data.message)

      if (!isDialogMode.value) {
        successTimeout.value = setTimeout(() => {
          resetForm()
        }, 3000) as any
      }
    }
  } catch (err: any) {
    console.error('Error saving talent:', err)

    if (err.isAxiosError && retryCount.value < MAX_RETRIES) {
      retryCount.value++
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * retryCount.value)
      )
      return submitTalent()
    }

    handleError(err)
  } finally {
    isUpdating.value = false
    retryCount.value = 0
  }
}

const debouncedSubmit = debounce(submitTalent, 300, {
  leading: true,
  trailing: false,
})

function resetForm() {
  selectedCategory.value = null
  selectedTalent.value = null
  error.value = null
  showSuccess.value = false
  successMessage.value = ''
  isInitialized.value = false
}

// Initialize form - improved version
const initializeForm = async () => {
  if (isInitialized.value) {
    console.log('⚠️ Form already initialized, skipping...')
    return
  }

  console.log('[TalentRegisterForm] Initializing...', {
    isCreateMode: isCreateMode.value,
    isDialogMode: isDialogMode.value,
  })

  try {
    // Pre-populate form for update mode
    if (!isCreateMode.value && currentTalentDisplay.value?.category_id) {
      console.log('[TalentRegisterForm] Pre-populating form for update mode...')
      const cat = talentCategoryStore.categories.find(
        (c) => c.id === currentTalentDisplay.value?.category_id
      )
      if (cat) {
        selectedCategory.value = cat
        if (cat.slug) {
          await talentCategoryStore.fetchCategoryTalents(cat.slug)
          selectedTalent.value =
            talentCategoryStore.talents.find(
              (tal) => tal.id === currentTalentDisplay.value?.talent_id
            ) || null
        }
      }
    }

    isInitialized.value = true
    console.log('[TalentRegisterForm] Form initialization complete')
  } catch (error) {
    console.error('[TalentRegisterForm] Error during form initialization:', error)
  }
}

// Clear manual selection when they're changed
watch(selectedCategory, () => {
  if (selectedCategory.value) {
    // Reset any validation errors
    error.value = null
  }
})

// Expose methods for parent components
defineExpose({
  submitTalent: debouncedSubmit,
  resetForm,
  formIsValid,
  isUpdating,
  registering,
  initializeForm,
})

onMounted(async () => {
  console.log('[TalentRegisterForm] Component mounted')
  await nextTick()
  await initializeForm()
})

onBeforeUnmount(() => {
  debouncedSubmit.cancel()
  clearTimeouts()
})
</script>

<style scoped>
.talent-register-form {
  width: 100%;
}

.section-header {
  border-left: 4px solid rgb(var(--v-theme-primary));
  padding-left: 16px;
}

.manual-talent-selection {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 16px;
}

.current-talent {
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 12px;
  padding: 16px;
}

.register-btn {
  font-weight: 600;
  min-width: 160px;
  letter-spacing: 0.5px;
}
</style>
