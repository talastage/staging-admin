<!-- components/CurrencySelector.vue -->
<template>
  <div class="currency-selector">
    <div v-if="loading" class="currency-selector__loading">
      <span class="loader"></span>
    </div>

    <div v-else class="currency-selector__container">
      <label v-if="label" :for="id" class="currency-selector__label">{{
        label
      }}</label>

      <div class="currency-selector__select-wrapper">
        <select
          :id="id"
          v-model="selectedCurrencyId"
          class="currency-selector__select"
          @change="handleChange"
        >
          <option
            v-for="currency in currencies"
            :key="currency.id"
            :value="currency.id"
            :selected="currency.id === modelValue"
          >
            {{ currency.name }} ({{ currency.code }})
          </option>
        </select>

        <div class="currency-selector__selected" v-if="selectedCurrency">
          <span class="currency-selector__symbol">{{
            selectedCurrency.symbol
          }}</span>
          <span class="currency-selector__code">{{
            selectedCurrency.code
          }}</span>
        </div>
      </div>

      <p v-if="error" class="currency-selector__error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCurrencies, type Currency } from '~/composables/useCurrencies'

const props = defineProps({
  modelValue: {
    type: Number,
    default: null,
  },
  label: {
    type: String,
    default: 'Select Currency',
  },
  autoLoad: {
    type: Boolean,
    default: true,
  },
  id: {
    type: String,
    default: () =>
      `currency-selector-${Math.random().toString(36).substring(2, 9)}`,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const {
  currencies,
  userCurrency,
  isLoading: loading,
  error,
  fetchCurrencies,
} = useCurrencies()
const selectedCurrencyId = ref(props.modelValue)

const selectedCurrency = computed(() => {
  if (!selectedCurrencyId.value) return null
  return currencies.value.find((c) => c.id === selectedCurrencyId.value) || null
})

const handleChange = () => {
  emit('update:modelValue', selectedCurrencyId.value)

  if (selectedCurrency.value) {
    emit('change', selectedCurrency.value)
  }
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== selectedCurrencyId.value) {
      selectedCurrencyId.value = newVal
    }
  }
)

watch(userCurrency, (newVal) => {
  if (newVal && !props.modelValue) {
    selectedCurrencyId.value = newVal.id
    emit('update:modelValue', newVal.id)
  }
})

onMounted(async () => {
  if (props.autoLoad) {
    await fetchCurrencies()

    if (!props.modelValue && userCurrency.value) {
      selectedCurrencyId.value = userCurrency.value.id
      emit('update:modelValue', userCurrency.value.id)
    }
  }
})

// Expose component methods and properties
defineExpose({
  reload: fetchCurrencies,
  currencies,
  selectedCurrency,
})
</script>

<style scoped>
.currency-selector {
  position: relative;
  width: 100%;
}

.currency-selector__loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 40px;
}

.loader {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.currency-selector__label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.currency-selector__select-wrapper {
  position: relative;
}

.currency-selector__select {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 3rem;
  appearance: none;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: #fff;
  font-size: 1rem;
  line-height: 1.5;
  color: #1a202c;
}

.currency-selector__selected {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;
}

.currency-selector__symbol {
  margin-right: 0.5rem;
  font-weight: 500;
  color: #2d3748;
}

.currency-selector__code {
  font-weight: 500;
  color: #4a5568;
}

.currency-selector__error {
  margin-top: 0.5rem;
  color: #e53e3e;
  font-size: 0.875rem;
}
</style>
