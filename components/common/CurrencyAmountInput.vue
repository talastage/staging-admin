<!-- components/common/CurrencyAmountInput.vue -->
<template>
  <v-text-field
    :model-value="displayValue"
    type="text"
    :label="label"
    :rules="combinedRules"
    :required="required"
    :placeholder="placeholder"
    :hint="hint"
    :persistent-hint="!!hint"
    :error-messages="errorMessages"
    :disabled="disabled"
    :loading="loading"
    class="currency-amount-input"
    @input="handleInput"
    :density="smAndDown ? 'compact' : 'default'"
  >
    <template #prepend>
      <div class="currency-prefix">
        {{ currencyPrefix }}
      </div>
    </template>
  </v-text-field>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCurrencyStore } from '~/stores/useCurrencies'
import { useDisplay } from 'vuetify'

interface Props {
  modelValue: number | null
  label?: string
  required?: boolean
  placeholder?: string
  hint?: string
  errorMessages?: string[]
  disabled?: boolean
  loading?: boolean
  rules?: ((v: any) => boolean | string)[]
  useSymbol?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Amount',
  required: false,
  placeholder: '',
  hint: '',
  errorMessages: () => [],
  disabled: false,
  loading: false,
  rules: () => [],
  useSymbol: true,
})

const emit = defineEmits(['update:modelValue'])

const currencyStore = useCurrencyStore()
const { mobile, smAndDown } = useDisplay()

// Initialize currency data if not already fetched
onMounted(async () => {
  if (!currencyStore.isFetched) {
    await currencyStore.fetchCurrencies()
  }
})

// Compute the currency prefix (symbol or code)
const currencyPrefix = computed(() => {
  const currency = currencyStore.selectedCurrency
  if (!currency) return ''
  return props.useSymbol ? currency.symbol : currency.code
})

// Format display value
const displayValue = computed(() => {
  return props.modelValue?.toString() || ''
})

// Combine custom rules with number validation
const combinedRules = computed(() => {
  const numberRule = (v: string) => {
    if (!v) return true
    const num = parseFloat(v)
    return !isNaN(num) || 'Please enter a valid number'
  }
  return [numberRule, ...props.rules]
})

// Handle input changes
const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  const numValue = value ? parseFloat(value) : null
  emit('update:modelValue', numValue)
}
</script>

<style scoped>
.currency-prefix {
  font-weight: 500;
  user-select: none;
  min-width: 24px;
  padding: 0 4px;
  white-space: nowrap;
}

:deep(.v-field__input) {
  min-width: 0;
  flex: 1;
}

:deep(.v-field__prepend-inner) {
  padding-right: 4px;
}

@media (max-width: 600px) {
  .currency-prefix {
    min-width: 20px;
    padding: 0 2px;
    font-size: 0.9rem;
  }
  
  :deep(.v-field__input) {
    font-size: 0.9rem;
  }
}

@media (max-width: 400px) {
  .currency-prefix {
    min-width: 16px;
    font-size: 0.85rem;
  }
}
</style>