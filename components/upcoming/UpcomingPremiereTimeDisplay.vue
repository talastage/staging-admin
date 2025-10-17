<!-- components/UpcomingPremiereTimeDisplay.vue -->
<template>
  <div class="premiere-time-display">
    <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
    <div class="premiere-time-display__content">
      <div class="premiere-time-display__relative">{{ relativeTimeText }}</div>
      <div class="premiere-time-display__exact">{{ exactTimeText }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDateFormatter } from '~/composables/useDateFormatter'

interface PremiereTimeDisplayProps {
  premiereDate: string
}

const props = defineProps<PremiereTimeDisplayProps>()

const { formatRelativeDate } = useDateFormatter()

const relativeTimeText: ComputedRef<string> = computed(() => {
  const relativeDate = formatRelativeDate(props.premiereDate)

  // Emphasize "Premieres" for future dates and remove the "in" prefix
  if (relativeDate.startsWith('in ')) {
    return `Premieres ${relativeDate}`
  }

  return relativeDate
})

const exactTimeText: ComputedRef<string> = computed(() => {
  const date = new Date(props.premiereDate)

  const monthNames: readonly string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ] as const

  const formatTimeUnit = (unit: number): string => {
    return unit.toString().padStart(2, '0')
  }

  const day = date.getDate()
  const month = monthNames[date.getMonth()]
  const hours = formatTimeUnit(date.getHours())
  const minutes = formatTimeUnit(date.getMinutes())

  return `${day} ${month} at ${hours}:${minutes}`
})
</script>

<style scoped>
.premiere-time-display {
  display: flex;
  align-items: flex-start;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
}

.premiere-time-display__content {
  display: flex;
  flex-direction: column;
}

.premiere-time-display__relative {
  font-weight: 500;
  line-height: 1.2;
}

.premiere-time-display__exact {
  font-size: 0.75rem;
  opacity: 0.85;
  margin-top: 2px;
}

:deep(.v-theme--light) .premiere-time-display {
  color: rgba(0, 0, 0, 0.87);
}

:deep(.v-theme--light) .premiere-time-display__exact {
  color: rgba(0, 0, 0, 0.7);
}
</style>
