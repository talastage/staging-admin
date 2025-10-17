<template>
  <v-dialog v-model="dialogVisible" max-width="600px" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <div>
          <h2 class="text-h5 mb-1">
            {{ isEditing ? 'Edit Investor' : 'Add Investor' }}
          </h2>
          <p class="text-body-2 text-grey mb-0">
            {{
              isEditing
                ? "Modify this investor's share in your project"
                : 'Add a new investor to your project'
            }}
          </p>
        </div>
        <v-btn icon variant="text" @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Error alert that displays all form errors -->
      <v-alert
        v-if="formError"
        type="error"
        variant="tonal"
        closable
        class="mx-4 mt-2"
        @click:close="formError = ''"
      >
        {{ formError }}
      </v-alert>

      <v-divider></v-divider>

      <v-card-text class="pa-4">
        <v-window v-model="step">
          <!-- Step 1: Search Investor using InvestorSearch -->
          <v-window-item :value="1">
            <div class="mb-4">
              <h3 class="text-h6 mb-2">Search Investor</h3>
              <p class="text-body-2 text-grey-darken-1">
                Search for an investor to add to your project.
              </p>
            </div>

            <!-- Using InvestorSearch instead of PageSearch -->
            <InvestorSearch
              :min-search-length="2"
              :debounce-ms="300"
              @user-selected="handleInvestorableSelected"
              @page-selected="handleInvestorableSelected"
            />
          </v-window-item>

          <!-- Step 2: Set Equity -->
          <v-window-item :value="2">
            <div class="mb-6">
              <h3 class="text-h6 mb-2">Set Investor Equity</h3>
              <p class="text-body-2 text-grey-darken-1">
                Define the equity percentage for this investor. They will
                receive this percentage of project earnings.
              </p>
            </div>

            <!-- Selected Investor Card -->
            <v-card variant="outlined" class="mb-6 pa-3">
              <div class="d-flex align-center">
                <v-avatar size="40" color="primary" class="mr-3">
                  <v-img
                    v-if="
                      selectedInvestorable?.avatar_url ||
                      selectedInvestorable?.profile_photo
                    "
                    :src="
                      selectedInvestorable?.avatar_url ||
                      selectedInvestorable?.profile_photo
                    "
                    :alt="getInvestorableName()"
                  />
                  <span v-else class="text-h6 white--text">
                    {{ getInitials(getInvestorableName()) }}
                  </span>
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-medium">
                    {{ getInvestorableName() }}
                  </div>
                  <div class="text-caption text-grey">
                    @{{
                      selectedInvestorable?.slug ||
                      selectedInvestorable?.username
                    }}
                  </div>
                  <div class="text-caption text-primary">
                    {{
                      selectedInvestorable?.type === 'user' ? 'User' : 'Page'
                    }}
                  </div>
                </div>
                <v-btn
                  variant="text"
                  color="primary"
                  class="ml-auto"
                  @click="step = 1"
                >
                  Change
                </v-btn>
              </div>
            </v-card>

            <!-- Equity Input with improved error handling -->
            <v-text-field
              v-model.number="equityPercentage"
              label="Equity Percentage"
              type="number"
              min="0"
              max="100"
              step="0.01"
              :rules="equityRules"
              required
              variant="outlined"
              :error-messages="equityError"
              hint="Enter the percentage of project earnings this investor will receive"
              persistent-hint
              class="mb-2"
              @update:model-value="clearErrors"
            >
              <template #append>
                <span class="text-grey">%</span>
              </template>
            </v-text-field>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-btn
          v-if="step === 2"
          variant="outlined"
          @click="step = 1"
          class="mr-2"
        >
          Back
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="step === 2"
          color="primary"
          :loading="isSubmitting"
          :disabled="!isValid || isSubmitting"
          @click="confirmInvestor"
        >
          {{ isEditing ? 'Update Investor' : 'Add Investor' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useProjectInvestorsStore } from '@/stores/useProjectInvestorsStore'
import type { Page } from '@/types/page'
import type { User } from '@/types/user'

interface Props {
  modelValue: boolean
  accessUuid: string
  editingInvestor?: {
    id: number
    investorable: Page | User
    investorable_type: string
    share_percentage: number
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'investor-added': []
  'investor-updated': []
}>()

const investorStore = useProjectInvestorsStore()

// State
const step = ref(1)
const selectedInvestorable = ref<((Page | User) & { type: string }) | null>(
  null
)
const equityPercentage = ref<number>(0)

const isSubmitting = ref(false)
const equityError = ref('')
const formError = ref('')

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEditing = computed(() => !!props.editingInvestor)

const isValid = computed(() => {
  if (!selectedInvestorable.value) return false
  const eq = Number(equityPercentage.value)
  if (isNaN(eq) || eq <= 0 || eq > 100) return false

  // If editing, only enable "Update" if something actually changed
  if (isEditing.value && props.editingInvestor) {
    const currentEquity = parseFloat(eq.toFixed(2))
    const originalEquity = parseFloat(
      props.editingInvestor.share_percentage.toFixed(2)
    )
    if (currentEquity !== originalEquity) return true

    // If the user changed the underlying investorable? (rare, but just in case)
    if (
      selectedInvestorable.value?.id !== props.editingInvestor.investorable?.id
    ) {
      return true
    }
    return false
  }
  return true
})

// Rules
const equityRules = [
  (v: number | '') => v !== '' || 'Equity percentage is required',
  (v: number | '') => {
    const num = typeof v === 'string' ? parseFloat(v) : v
    if (isNaN(num)) return 'Please enter a valid number'
    return (num > 0 && num <= 100) || 'Equity must be between 0.01 and 100%'
  },
]

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && props.editingInvestor) {
      // Add the type property to the investorable object
      const investorableType = props.editingInvestor.investorable_type
        .toLowerCase()
        .includes('user')
        ? 'user'
        : 'page'

      selectedInvestorable.value = {
        ...props.editingInvestor.investorable,
        type: investorableType,
      }
      equityPercentage.value = Number(props.editingInvestor.share_percentage)
      step.value = 2
    } else if (!newVal) {
      resetForm()
    }
  }
)

watch(
  () => props.editingInvestor,
  (newVal) => {
    if (newVal) {
      // Add the type property to the investorable object
      const investorableType = newVal.investorable_type
        .toLowerCase()
        .includes('user')
        ? 'user'
        : 'page'

      selectedInvestorable.value = {
        ...newVal.investorable,
        type: investorableType,
      }
      equityPercentage.value = Number(newVal.share_percentage)
      step.value = 2
    }
  },
  { immediate: true }
)

// Methods
function getInvestorableName(): string {
  if (!selectedInvestorable.value) return ''

  if (selectedInvestorable.value.type === 'user') {
    return (
      selectedInvestorable.value.name ||
      selectedInvestorable.value.display_name ||
      ''
    )
  } else {
    return selectedInvestorable.value.name || ''
  }
}

function getInitials(name?: string): string {
  if (!name) return ''
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function handleInvestorableSelected(item: (Page | User) & { type: string }) {
  selectedInvestorable.value = { ...item }
  step.value = 2
}

function clearErrors() {
  formError.value = ''
  equityError.value = ''
}

// Enhanced error handling function that displays all errors in the alert
function handleError(error: any) {
  // Reset existing errors
  clearErrors()

  // Default error message
  let defaultMessage = 'An error occurred. Please try again.'

  // Extract error data from response
  const responseData = error.response?.data

  // Check if we have errors in the response
  if (responseData) {
    // Direct error messages (Laravel validation errors format)
    if (responseData.errors) {
      const errors = responseData.errors
      const errorMessages = []

      // Handle share_percentage errors
      if (errors.share_percentage) {
        equityError.value = errors.share_percentage[0]
        errorMessages.push(`Equity: ${errors.share_percentage[0]}`)
      }

      // Handle investorable_id errors
      if (errors.investorable_id) {
        errorMessages.push(errors.investorable_id[0])
      }

      // Handle investorable_type errors
      if (errors.investorable_type) {
        errorMessages.push(errors.investorable_type[0])
      }

      // If any other errors exist, concatenate them
      const otherErrors = Object.entries(errors)
        .filter(
          ([key]) =>
            ![
              'share_percentage',
              'investorable_id',
              'investorable_type',
            ].includes(key)
        )
        .map(([key, messages]) => `${key}: ${messages[0]}`)

      if (otherErrors.length > 0) {
        errorMessages.push(...otherErrors)
      }

      // Set the form error if we have error messages
      if (errorMessages.length > 0) {
        formError.value = errorMessages.join('. ')
      }
    }
    // If there's a message field but no errors object
    else if (responseData.message) {
      formError.value = responseData.message
    }
  }

  // If we still don't have any errors set, use default
  if (!formError.value && !equityError.value) {
    formError.value = defaultMessage
  }
}

async function confirmInvestor() {
  if (!isValid.value || !selectedInvestorable.value) return
  isSubmitting.value = true
  clearErrors()

  try {
    const eq = Number(equityPercentage.value)

    // Determine investorable type based on the selected item type
    const investorableType =
      selectedInvestorable.value.type === 'user'
        ? 'App\\Models\\User'
        : 'App\\Models\\Page'

    // Make sure we have a valid equity percentage
    const sharePercentage = parseFloat(eq.toFixed(2))
    if (
      isNaN(sharePercentage) ||
      sharePercentage <= 0 ||
      sharePercentage > 100
    ) {
      equityError.value =
        'Please enter a valid equity percentage between 0.01 and 100'
      return
    }

    // If editing
    if (isEditing.value && props.editingInvestor) {
      await investorStore.updateProjectInvestor(
        props.accessUuid,
        props.editingInvestor.id,
        {
          share_percentage: sharePercentage,
          // Only update these if actually changed
          ...(selectedInvestorable.value.id !==
          props.editingInvestor.investorable?.id
            ? {
                investorable_type: investorableType,
                investorable_id: selectedInvestorable.value.id,
              }
            : {}),
        }
      )
      emit('investor-updated')
    } else {
      // Creating new
      await investorStore.createProjectInvestor(props.accessUuid, {
        investorable_type: investorableType,
        investorable_id: selectedInvestorable.value.id,
        share_percentage: sharePercentage,
      })
      emit('investor-added')
    }

    closeDialog()
  } catch (error: any) {
    handleError(error)
  } finally {
    isSubmitting.value = false
  }
}

function closeDialog() {
  dialogVisible.value = false
  resetForm()
}

function resetForm() {
  step.value = 1
  selectedInvestorable.value = null
  equityPercentage.value = 0
  clearErrors()
  isSubmitting.value = false
}
</script>

<style scoped>
.v-alert {
  margin-bottom: 16px;
}
</style>
