<template>
  <span :class="['amount-display', customClass]">
    {{ formattedAmount }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCurrencyFormatter } from '~/composables/useCurrencyFormatter'
import { useDisplay } from 'vuetify'

const props = defineProps({
  amount: {
    type: Number,
    required: true,
  },
  currencySymbol: {
    type: String,
    required: true,
  },
  currencyCode: {
    type: String,
    default: '', // If not provided, we'll default it to currencySymbol
  },
  customClass: {
    type: String,
    default: '',
  },
})

const { currencyFormatter } = useCurrencyFormatter()
const { mobile, smAndDown, mdAndDown } = useDisplay()

const computedCurrencyCode = computed(() => {
  return props.currencyCode || props.currencySymbol
})

const formattedAmount = computed(() => {
  const formatted = currencyFormatter(
    props.amount,
    props.currencySymbol,
    computedCurrencyCode.value
  )
  return formatted !== null ? formatted : props.amount.toFixed(2)
})
</script>

<style scoped>
.amount-display {
  font-size: 1.25rem;
  font-weight: bold;
  display: inline-block;
  word-break: break-word;
  max-width: 100%;
}

@media (max-width: 960px) {
  .amount-display {
    font-size: 1.1rem;
  }
}

@media (max-width: 600px) {
  .amount-display {
    font-size: 1rem;
  }
}

@media (max-width: 400px) {
  .amount-display {
    font-size: 0.9rem;
  }
}
</style>