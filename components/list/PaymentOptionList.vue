<template>
  <v-list dense>
    <v-list-item v-for="(option, index) in options" :key="index" class="payment-option">
      <v-list-item-icon class="payment-icon">
        <img :src="option.icon" :alt="option.name" />
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title class="payment-title">{{ option.name }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps({
  options: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.payment-option {
  border-radius: 8px;
  margin: 10px 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 10px;
  transition: background-color 0.2s ease-in-out;
}

.payment-option:hover {
  background-color: #f5f5f5;
}

.payment-icon img {
  width: 40px; /* Adjust as needed */
  height: auto;
}

.payment-title {
  font-weight: 500;
  margin-left: 10px; /* Adjust spacing based on your design */
}
</style>
