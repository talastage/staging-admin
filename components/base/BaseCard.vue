<!-- BaseCard.vue -->
<template>
  <v-card :elevation="elevation" :to="to" :ripple="!!to" class="base-card">
    <v-card-item>
      <slot></slot>
    </v-card-item>
  </v-card>
</template>

<script setup>
defineProps({
  elevation: {
    type: [Number, String],
    default: 10,
  },
  to: {
    type: [String, Object],
    default: null,
  },
})
</script>

<style scoped>
.base-card {
  border-radius: 12px;
  overflow: hidden;
}
</style>
