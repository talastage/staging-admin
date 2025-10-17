<template>
  <v-card class="promotion-fee-card" flat>
    <v-card-text>
      <p>Price per day: ${{ premieringFee.price_country_day }}</p>
      <p>Default days: {{ premieringFee.default_days }}</p>
      <p>Minimum days: {{ premieringFee.min_days }}</p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps({
  premieringFee: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.promotion-fee-card {
  padding: 20px;
  margin-top: 20px;
}
</style>
