<template>
  <span :class="['date-display', customClass]">{{ formattedDate }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDateFormatter } from '@/composables/useDateFormatter'

const props = defineProps({
  date: {
    type: String,
    required: true,
  },
  showFullDate: {
    type: Boolean,
    default: false,
  },
  customClass: {
    type: String,
    default: '',
  },
})

const { formatRelativeDate, formatFullDate } = useDateFormatter()

const formattedDate = computed(() => {
  if (!props.date) return 'Unknown Date'

  return props.showFullDate
    ? `${formatFullDate(props.date)} (${formatRelativeDate(props.date)})`
    : formatRelativeDate(props.date)
})
</script>

<style scoped>
.date-display {
  font-size: 0.9rem;
  color: #666;
}
</style>
