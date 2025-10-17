<template>
  <div class="countdown-timer">
    <template v-if="isExpired"> Time expired </template>
    <template v-else>
      <span class="countdown-value">{{ formattedTime }}</span>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  endTime: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['time-expired'])

const remainingTime = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
})
const isExpired = ref(false)
const intervalId = ref(null)

const formattedTime = computed(() => {
  const { days, hours, minutes, seconds } = remainingTime.value

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s remaining`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s remaining`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s remaining`
  } else {
    return `${seconds}s remaining`
  }
})

const calculateRemainingTime = () => {
  const now = new Date().getTime()
  const endTimeMs = new Date(props.endTime).getTime()
  const timeDifference = endTimeMs - now

  if (timeDifference <= 0) {
    isExpired.value = true
    remainingTime.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }

    // Clear interval and emit expired event
    if (intervalId.value) {
      clearInterval(intervalId.value)
      emit('time-expired')
    }
    return
  }

  // Calculate time values
  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24))
  const hours = Math.floor(
    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  )
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000)

  remainingTime.value = { days, hours, minutes, seconds }
}

onMounted(() => {
  // Calculate initial time
  calculateRemainingTime()

  // Set up interval to update every second
  intervalId.value = setInterval(calculateRemainingTime, 1000)
})

onUnmounted(() => {
  // Clean up interval when component is destroyed
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})
</script>

<style scoped>
.countdown-timer {
  display: inline-block;
}

.countdown-value {
  font-weight: 500;
}
</style>
