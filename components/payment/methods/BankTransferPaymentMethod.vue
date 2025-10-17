<template>
  <v-card class="pa-4" outlined @click="selectMethod">
    <v-card-title>
      <v-avatar left>
        <v-icon>mdi-bank</v-icon>
      </v-avatar>
      <span>{{ method.payment_method.name }}</span>
    </v-card-title>
    <v-card-subtitle v-if="method.user_bank_accounts && method.user_bank_accounts.length">
      Account Number: {{ method.user_bank_accounts[0].account_number }}
      <br />
      Account Holder Name: {{ method.user_bank_accounts[0].account_holder_name }}
    </v-card-subtitle>
    <v-card-subtitle v-else>
      Bank details not available
    </v-card-subtitle>
  </v-card>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  method: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['method-selected']);

const selectMethod = () => {
  emit('method-selected', props.method);
};
</script>

<style scoped>
/* Add any specific styles for your component here */
</style>
