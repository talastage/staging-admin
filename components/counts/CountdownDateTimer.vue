<template>
  <span>{{ displayTime }}</span>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTimeFormatting } from '@/composables/useTimeFormatting'

const { formatTime, formatCountdown } = useTimeFormatting()

interface Props {
  seconds?: number | null
  targetDate?: Date | string | null
}

const props = withDefaults(defineProps<Props>(), {
  seconds: null,
  targetDate: null,
})

const emit = defineEmits<{
  (e: 'finished'): void
}>()

const remainingTime = ref(props.seconds)
const intervalId = ref<number | null>(null)

const displayTime = computed(() => {
  if (props.targetDate) {
    return formatCountdown(props.targetDate)
  }

  if (remainingTime.value !== null) {
    return formatTime(remainingTime.value)
  }

  return 'Almost done...'
})

const countdown = () => {
  if (props.targetDate) {
    const now = new Date().getTime()
    const target = new Date(props.targetDate).getTime()

    if (now >= target) {
      if (intervalId.value) {
        clearInterval(intervalId.value)
      }
      emit('finished')
    }
  } else if (remainingTime.value !== null) {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      if (intervalId.value) {
        clearInterval(intervalId.value)
      }
      emit('finished')
    }
  }
}

onMounted(() => {
  intervalId.value = window.setInterval(countdown, 1000)
})

onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})
</script>
