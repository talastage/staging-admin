<template>
    <v-icon>{{ icon }}</v-icon>
  </template>
  
  <script setup lang="ts">
  import { computed, defineProps } from "vue";
  
  const props = defineProps({
    walletName: {
      type: String,
      required: true,
    },
  });
  
  const icon = computed(() => {
    switch (props.walletName.toLowerCase()) {
      case "apple pay":
        return "mdi-apple";
      case "google pay":
        return "mdi-google";
      case "samsung pay":
        return "mdi-cellphone";
      case "credit card":
        return "mdi-credit-card";
      default:
        return "mdi-wallet";
    }
  });
  </script>
  