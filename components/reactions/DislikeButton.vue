<template>
  <v-btn
    variant="text"
    size="large"
    :disabled="isLoading"
    :color="isDisliked ? 'primary' : undefined"
    @click="handleClick"
    class="dislike-button"
  >
    <v-icon :color="isDisliked ? 'primary' : undefined" size="24" class="mr-2">
      mdi-thumb-down
    </v-icon>
    <span class="text-body-1">{{ count }}</span>
  </v-btn>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  isDisliked: {
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
    emit('reaction', 'dislike')
  }
}
</script>

<style scoped>
.dislike-button {
  transition: all 0.2s ease;
}
.dislike-button:hover {
  transform: scale(1.05);
}
</style>
