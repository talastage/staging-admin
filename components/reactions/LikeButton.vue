<template>
  <v-btn
    variant="text"
    size="large"
    :disabled="isLoading"
    :color="isLiked ? 'primary' : undefined"
    @click="handleClick"
    class="like-button"
  >
    <v-icon :color="isLiked ? 'primary' : undefined" size="24" class="mr-2">
      mdi-thumb-up
    </v-icon>
    <span class="text-body-1">{{ count }}</span>
  </v-btn>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  isLiked: {
    type: Boolean,
    default: false,
  },
  count: {
    type: Number,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['reaction'])

function handleClick() {
  if (!props.isLoading) {
    emit('reaction', 'like')
  }
}
</script>

<style scoped>
.like-button {
  transition: all 0.2s ease;
}
.like-button:hover {
  transform: scale(1.05);
}
</style>
