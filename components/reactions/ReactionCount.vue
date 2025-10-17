// components/reactions/ReactionCount.vue
<template>
  <span class="ml-1 text-body-2">{{ formattedCount }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{
  count: number;
  formatNumber?: boolean;
}>();

const formattedCount = computed(() => {
  if (!props.formatNumber) return props.count;
  
  if (props.count >= 1000000) {
    return `${(props.count / 1000000).toFixed(1)}M`;
  } else if (props.count >= 1000) {
    return `${(props.count / 1000).toFixed(1)}K`;
  }
  return props.count;
});
</script>