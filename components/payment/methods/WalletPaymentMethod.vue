<template>
  <v-card class="pa-4" outlined @click="selectMethod">
    <v-card-title>
      <v-avatar left>
        <v-icon>mdi-wallet-outline</v-icon>
      </v-avatar>
      <span>{{ method.payment_method.name }}</span>
    </v-card-title>
    <v-card-subtitle v-if="method.wallets && method.wallets.length">
      Wallet Code: {{ method.wallets[0].wallet_code }}
      <br />
      Balance: {{ method.wallets[0].balance }}
    </v-card-subtitle>
    <v-card-subtitle v-else>
      Wallet details not available
    </v-card-subtitle>
  </v-card>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  method: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["method-selected"]);

const selectMethod = () => {
  emit("method-selected", props.method);
};
</script>

<style scoped>
/* Add any specific styles for your component here */
</style>
