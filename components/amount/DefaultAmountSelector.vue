<template>
  <div class="default-amount-selector">
    <!-- Preset Buttons -->
    <div class="preset-amounts mb-4">
      <div class="preset-amounts-label mb-2">
        <v-icon size="small" color="primary" class="mr-1">mdi-lightning-bolt</v-icon>
        <span>Quick amounts</span>
      </div>
      <v-row dense v-if="!loading && !error">
        <v-col v-for="preset in amounts" :key="preset.id" cols="6" sm="4">
          <v-btn
            block
            :color="isSelectedPreset(preset.amount) ? 'primary' : ''"
            :variant="isSelectedPreset(preset.amount) ? 'elevated' : 'outlined'"
            @click="selectPreset(preset.amount)"
            class="mb-2 preset-btn"
            elevation="2"
          >
            {{ preset.formatted }}
          </v-btn>
        </v-col>
      </v-row>

      <!-- Loading State -->
      <v-progress-circular
        v-else-if="loading"
        indeterminate
        color="primary"
        class="mt-4"
      />

      <!-- Error State -->
      <v-alert v-else-if="error" type="error" class="mt-4">
        {{ error }}
      </v-alert>
    </div>

    <!-- Custom Amount Input -->
    <div class="custom-amount-section">
      <div class="custom-amount-label mb-2">
        <v-icon size="small" color="primary" class="mr-1">mdi-pencil</v-icon>
        <span>Enter custom amount</span>
      </div>
      <v-text-field
        v-model="localAmount"
        :label="`Amount in ${currencyLabel}`"
        :prefix="currencyLabel"
        type="number"
        :min="0.01"
        :max="maxAmount"
        :error-messages="errorMessage"
        @blur="validateAmount"
        @input="clearErrorOnInput"
        variant="outlined"
        density="comfortable"
        class="custom-amount-input"
        hint="Enter any amount you wish to give"
        persistent-hint
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDefaultAmountStore } from '~/stores/useDefaultAmountStore'

interface Props {
  modelValue: number
  maxAmount: number
  // We also accept a currency object from the parent
  currency?: {
    id: number
    code: string
    symbol: string
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const defaultAmountStore = useDefaultAmountStore()
const { amounts, currency, loading, error } = storeToRefs(defaultAmountStore)
const errorMessage = ref('')

// If the parent passes its currency, we can fallback to the store currency if not provided
const currencyLabel = computed(() => {
  if (props.currency && props.currency.symbol) {
    return props.currency.symbol
  } else if (currency.value?.symbol) {
    return currency.value.symbol
  }
  // fallback
  return ''
})

// For two-way binding
const localAmount = computed({
  get: () => props.modelValue.toString(),
  set: (value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      emit('update:modelValue', numValue)
    }
  },
})

// Indicate if a preset is selected
function isSelectedPreset(presetValue: number): boolean {
  return Number(props.modelValue) === Number(presetValue)
}

// When user clicks a preset, set that as the parent's amount
function selectPreset(presetValue: number): void {
  errorMessage.value = ''
  emit('update:modelValue', Number(presetValue))
}

// Clear error message when user starts typing
function clearErrorOnInput(): void {
  if (errorMessage.value) {
    errorMessage.value = ''
  }
}

// Validate custom input on blur
function validateAmount(): void {
  const numValue = parseFloat(localAmount.value)
  if (isNaN(numValue) || numValue <= 0) {
    errorMessage.value = 'Please enter a valid positive amount'
    emit('update:modelValue', 0)
    return
  }
  if (numValue > props.maxAmount) {
    errorMessage.value = `Maximum amount is ${currencyLabel.value}${props.maxAmount}`
    emit('update:modelValue', props.maxAmount)
    return
  }
  errorMessage.value = ''
}

// Fetch amounts on mount if not already loaded
onMounted(() => {
  if (amounts.value.length === 0 && !loading.value) {
    defaultAmountStore.fetchDefaultAmounts()
  }
})

// Select first amount when data is loaded
watch(
  () => amounts.value,
  (newAmounts) => {
    if (newAmounts.length > 0) {
      // Convert to number to ensure proper comparison
      const numAmount = Number(props.modelValue)

      // If the amount is 0 or doesn't match any preset amount, use the first preset
      if (
        numAmount === 0 ||
        !newAmounts.some((item) => Number(item.amount) === numAmount)
      ) {
        emit('update:modelValue', Number(newAmounts[0].amount))
      }
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.preset-btn {
  font-weight: 500;
  transition: all 0.2s ease;
}

.preset-btn:hover {
  transform: translateY(-2px);
}

.preset-amounts-label, 
.custom-amount-label {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
}

.custom-amount-input {
  transition: all 0.3s ease;
}

.custom-amount-input:focus-within {
  transform: scale(1.01);
}
</style>