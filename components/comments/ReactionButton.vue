<template>
    <v-btn
      text
      small
      :color="isActive ? 'primary' : ''"
      @click="toggleReaction"
    >
      <v-icon left>{{ icon }}</v-icon>
      {{ label }} ({{ count }})
    </v-btn>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  
  const props = defineProps({
    type: {
      type: String,
      required: true
    },
    commentId: {
      type: Number,
      required: true
    },
    count: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['reactionToggled']);
  
  const icon = computed(() => props.type === 'like' ? 'mdi-thumb-up' : 'mdi-thumb-down');
  const label = computed(() => props.type === 'like' ? 'Like' : 'Dislike');
  
  const toggleReaction = () => {
    emit('reactionToggled', props.type);
  };
  </script>