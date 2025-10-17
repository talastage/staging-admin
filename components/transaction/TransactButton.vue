<template>
  <v-btn
    :color="color"
    :disabled="disabled"
    @click="handleTransact"
    class="transact-button"
    block
  >
    {{ title }}
    <v-icon right>{{ icon }}</v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  amount: {
    type: Number,
    required: true
  },
  transactionType: {
    type: String,
    required: true,
    validator: (value: string) => ['withdraw', 'deposit', 'transfer', 'tip', 'project_tip', 'project_watching'].includes(value)
  },
  title: {
    type: String,
    default: 'Pay'
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['transact']);

const color = computed(() => {
  switch (props.transactionType) {
    case 'withdraw':
      return 'error';
    case 'deposit':
      return 'success';
    default:
      return 'primary';
  }
});

const icon = computed(() => {
  switch (props.transactionType) {
    case 'withdraw':
      return 'mdi-cash-minus';
    case 'deposit':
      return 'mdi-cash-plus';
    case 'transfer':
      return 'mdi-bank-transfer';
    case 'tip':
    case 'project_tip':
      return 'mdi-gift';
    case 'project_watching':
      return 'mdi-eye-check';
    default:
      return 'mdi-cash';
  }
});

const handleTransact = () => {
  emit('transact', {
    amount: props.amount,
    type: props.transactionType
  });
};
</script>

<style scoped>
.transact-button {
  min-width: 200px;
}
</style>