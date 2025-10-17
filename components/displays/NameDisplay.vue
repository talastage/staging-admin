<template>
  <span class="user-name-display">{{ fullName }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
});

const fullName = computed(() => {
  return `${props.firstName} ${props.lastName}`;
});
</script>

<style scoped>
.user-name-display {
  font-weight: 500;
}
</style>
