<template>
    <span>{{ formattedTime }}</span>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue';
  
  const props = defineProps({
    expiresIn: {
      type: Number,
      required: true
    }
  });
  
  const timeRemaining = ref(props.expiresIn * 60); // Convert minutes to seconds
  
  const formattedTime = computed(() => {
    const minutes = Math.floor(timeRemaining.value / 60);
    const seconds = timeRemaining.value % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });
  
  let timer;
  
  onMounted(() => {
    timer = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--;
      } else {
        clearInterval(timer);
      }
    }, 1000);
  });
  
  onUnmounted(() => {
    clearInterval(timer);
  });
  </script>