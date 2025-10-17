<template>
  <v-avatar v-if="earning.user_image" size="40" class="user-image">
    <v-img :src="earning.user_image" alt="User Image"></v-img>
  </v-avatar>
  <v-icon
    v-else
    :icon="transactionIcon"
    size="40"
    class="transaction-icon"
  ></v-icon>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  earning: {
    type: Object,
    required: true,
  },
});

const transactionIcon = computed(() => {
  switch (props.earning.transaction_type) {
    case "deposit":
      return "mdi-cash-plus";
    case "transfer":
      return "mdi-bank-transfer";
    case "withdrawal":
      return "mdi-cash-minus";
    case "payment":
      return "mdi-currency-usd";
    default:
      return "mdi-information";
  }
});
</script>

<style scoped>
.user-image {
  border: 2px solid #ffffff;
}

.transaction-icon {
  color: #555555;
}
</style>
