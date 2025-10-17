<template>
  <div class="display-amount">
    <span class="label">{{ title }}</span>
    <span :class="['amount', amountClass]">{{ formattedAmount }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  amount: {
    type: Number,
    required: true,
  },
  currencySymbol: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'fee', 'total'].includes(value),
  },
})

const formattedAmount = computed(() => {
  return `${props.currencySymbol}${props.amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
})

const amountClass = computed(() => {
  switch (props.type) {
    case 'fee':
      return 'fee-amount'
    case 'total':
      return 'total-amount'
    default:
      return 'default-amount'
  }
})
</script>

<style scoped>
.display-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
}

.label {
  font-size: 1rem;
  color: #616161;
}

.amount {
  font-size: 1.1rem;
  font-weight: 500;
}

.default-amount {
  color: #2196f3;
}

.fee-amount {
  color: #ff9800;
}

.total-amount {
  color: #4caf50;
}
</style>
