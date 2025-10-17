<template>
  <v-card class="watch-fee-card">
    <div class="fee-info">
      <span>Watch Fee:</span>
      <strong>{{ watchFee.watch_fee }} {{ watchFee.currency.symbol }}</strong>
    </div>
  </v-card>
</template>

<script lang="ts" setup>
defineProps({
  watchFee: {
    type: Object,
    required: true,
  },
});
</script>
