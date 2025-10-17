<template>
  <v-list>
    <TransactionItem
      v-for="transaction in transactions"
      :key="transaction.id"
      :transaction="transaction"
    />
  </v-list>
</template>

<script setup>

defineProps({
  transactions: {
    type: Array,
    required: true
  }
});
</script>