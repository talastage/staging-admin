<template>
  <BaseCard>
    <!-- Loading Skeleton -->
    <div v-if="isLoading.default">
      <v-skeleton-loader type="article" />
    </div>

    <!-- Error State -->
    <div v-else-if="errors.default || errors.save">
      <v-alert
        type="error"
        variant="tonal"
        :text="errors.default || errors.save"
      />
      <v-btn color="primary" variant="text" @click="retryLoading">
        Retry Loading
      </v-btn>
    </div>

    <!-- Content -->
    <div v-else class="watch-fee-container">
      <div class="d-flex flex-column mb-3">
        <BaseTitle
          size="h6"
          tag="h3"
          :marginBottom="1"
          class="d-flex align-center"
        >
          <v-icon
            icon="mdi-currency-usd"
            class="mr-2"
            size="small"
            color="primary"
          />
          Set Watch Fee
          <v-chip
            v-if="watchFeeExists"
            color="success"
            class="ml-2"
            size="x-small"
            variant="flat"
          >
            Set
          </v-chip>
        </BaseTitle>

        <span class="text-body-2 text-medium-emphasis">
          Define how much viewers will need to pay to watch your content
        </span>
      </div>

      <v-alert
        color="info"
        variant="text"
        density="compact"
        class="mb-4 text-body-2 info-alert"
        border="start"
      >
        <template #prepend>
          <v-icon size="small" icon="mdi-information" />
        </template>
        <span>
          Minimum amount: <strong>{{ minimumAmount }}</strong>
        </span>
      </v-alert>

      <!-- Watch Fee Input Group -->
      <v-form @submit.prevent="saveWatchFee" :disabled="isLoading.save">
        <div class="d-flex fee-input-group">
          <v-text-field
            v-model="newWatchFee"
            type="text"
            density="compact"
            variant="outlined"
            label="Enter watch fee amount"
            :rules="[validateWatchFee]"
            :prefix="currencySymbol"
            :hint="getWatchFeeHint"
            :error-messages="errors.save"
            :loading="isLoading.save"
            persistent-hint
            hide-details="auto"
            @input="handleWatchFeeInput"
            @keyup.enter="saveWatchFee"
            class="flex-grow-1"
          >
            <template #append>
              <v-fade-transition>
                <v-icon
                  v-if="isWatchFeeValid"
                  color="success"
                  size="small"
                  icon="mdi-check-circle"
                />
              </v-fade-transition>
            </template>
          </v-text-field>

          <v-btn
            color="primary"
            :loading="isLoading.save"
            :disabled="!isWatchFeeValid"
            type="submit"
            class="ml-2 submit-btn"
            :height="40"
          >
            <span class="d-none d-sm-block">
              {{ watchFeeExists ? 'Update' : 'Set' }} Fee
            </span>
            <v-icon
              :icon="watchFeeExists ? 'mdi-update' : 'mdi-plus'"
              size="small"
              class="d-sm-none"
            />
          </v-btn>
        </div>
      </v-form>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useDebounceFn } from '@vueuse/core'
import { currencySymbols } from '~/composables/useCurrencySymbols'
import type { Project } from '~/types/studio-project'
import { usePremieringMediaUpload } from '~/stores/premiering/usePremieringMediaUpload'

/**
 * Props
 * - The project prop includes the current watch fee (if set) and its currency.
 */
const props = defineProps<{ project: Project }>()

const toast = useToast()
const { $axios } = useNuxtApp()
const premieringStore = usePremieringMediaUpload()

// State for default (minimum) watch fee fetched from backend
const defaultWatchFee = ref({
  amount: 0,
  currency: {
    id: 0,
    name: '',
    code: '',
    symbol: '',
  },
})

// Local input state; initialize from the project prop if a watch fee is already set.
const newWatchFee = ref(
  props.project.watch_fee ? props.project.watch_fee.toString() : ''
)
// Determine if the watch fee exists based on the project prop.
const watchFeeExists = computed(
  () => props.project.watch_fee !== null && props.project.watch_fee !== ''
)

const isLoading = ref({
  default: false,
  save: false,
})

const errors = ref({
  default: null as string | null,
  save: null as string | null,
})

// Computed Properties
const getCurrencyCode = computed(
  () => defaultWatchFee.value.currency.code || 'RWF'
)

const currencySymbol = computed(() => {
  return (
    currencySymbols[defaultWatchFee.value.currency.code] ||
    getCurrencyCode.value
  )
})

const minimumAmount = computed(() => {
  if (!defaultWatchFee.value.amount) return null
  const { amount, currency } = defaultWatchFee.value
  const symbol = currencySymbols[currency.code] || currency.code
  return `${symbol}${amount.toLocaleString()}`
})

const isWatchFeeValid = computed(() => {
  if (!newWatchFee.value) return false
  const amount = parseFloat(newWatchFee.value)
  return !isNaN(amount) && amount >= defaultWatchFee.value.amount
})

const getWatchFeeHint = computed(() => {
  if (!newWatchFee.value) {
    return 'Enter amount'
  }
  const amount = parseFloat(newWatchFee.value)
  if (isNaN(amount)) {
    return 'Please enter a valid number'
  }
  if (amount < defaultWatchFee.value.amount) {
    return `Amount must be at least ${minimumAmount.value}`
  }
  return 'Valid amount'
})

// Methods
function validateWatchFee(value: string): true | string {
  if (!value) return 'Amount is required'
  const amount = parseFloat(value)
  if (isNaN(amount)) return 'Please enter a valid number'
  if (amount < defaultWatchFee.value.amount) {
    return `Amount must be at least ${minimumAmount.value}`
  }
  return true
}

const debouncedValidation = useDebounceFn((value: string) => {
  validateWatchFee(value)
}, 300)

function handleWatchFeeInput(value: string): void {
  // Remove multiple decimal points and invalid characters; limit to 2 decimal places.
  const sanitized = value
    .replace(/\.(?=.*\.)/g, '')
    .replace(/[^\d.]/g, '')
    .replace(/(\.\d{2})\d+$/, '$1')
  newWatchFee.value = sanitized
  debouncedValidation(sanitized)
}

/**
 * Fetch the default (minimum) watch fee.
 * This logic is retained for validation and hint messages.
 */
async function fetchDefaultWatchFee(): Promise<void> {
  isLoading.value.default = true
  errors.value.default = null
  try {
    const response = await $axios.get('/api/default-amounts/default-watch-fee')
    if (response.data) {
      defaultWatchFee.value = response.data
    }
  } catch (error: any) {
    console.error('Error fetching default watch fee:', error)
    errors.value.default = 'Failed to fetch default watch fee'
    toast.error('Failed to fetch default watch fee')
  } finally {
    isLoading.value.default = false
  }
}

/**
 * Save (create/update) the watch fee.
 * After a successful API call, update the project state in the usePremieringMediaUpload store.
 */
async function saveWatchFee(): Promise<void> {
  if (!isWatchFeeValid.value) return
  isLoading.value.save = true
  errors.value.save = null
  try {
    const response = await $axios.post(
      `/api/project-watch-fees/${props.project.access_uuid}`,
      {
        watch_fee: parseFloat(newWatchFee.value),
        currency_id: defaultWatchFee.value.currency.id,
      }
    )
    if (response.data.watch_fee) {
      // Update the project state in the store with the new watch fee and currency.
      premieringStore.updateProject({
        watch_fee: response.data.watch_fee.amount,
        currency: response.data.watch_fee.currency,
      })
      toast.success('Watch fee updated successfully')
    }
  } catch (error: any) {
    console.error('Error saving watch fee:', error)
    const errorMessage =
      error.response?.data?.message || 'Failed to update watch fee'
    errors.value.save = errorMessage
    toast.error(errorMessage)
  } finally {
    isLoading.value.save = false
  }
}

function resetWatchFee(): void {
  newWatchFee.value = props.project.watch_fee
    ? props.project.watch_fee.toString()
    : ''
  errors.value.save = null
}

const retryLoading = async () => {
  errors.value.default = null
  await fetchDefaultWatchFee()
}

// Lifecycle Hook
onMounted(async () => {
  await fetchDefaultWatchFee()
  // Initialize newWatchFee from the project prop if available.
  if (props.project.watch_fee) {
    newWatchFee.value = props.project.watch_fee.toString()
  }
})
</script>
<style scoped>
.watch-fee-container {
  max-width: 600px;
  padding: 16px;
  border-radius: 8px;
}

.fee-input-group {
  position: relative;
  align-items: flex-start;
}

.submit-btn {
  min-width: 100px;
  align-self: flex-start;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.info-alert {
  border-radius: 4px;
  background-color: rgba(var(--v-theme-info), 0.04);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .watch-fee-container {
    padding: 12px;
  }

  .submit-btn {
    min-width: unset;
    width: 40px;
  }

  .fee-input-group {
    align-items: center;
  }
}
</style>
