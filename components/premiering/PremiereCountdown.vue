<!-- components/PremiereCountdown.vue -->
<template>
  <div class="premiere-countdown">
    <div v-if="countdown" class="d-flex align-center">
      <v-icon icon="mdi-clock-outline" size="small" class="mr-2" />
      <span class="countdown-text"> Premieres in {{ formatCountdown }} </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  premiereDate: string
}>()

const countdown = ref<{
  days: number
  hours: number
  minutes: number
  seconds: number
} | null>(null)

const updateCountdown = () => {
  const now = new Date().getTime()
  const premiere = new Date(props.premiereDate).getTime()
  const diff = premiere - now

  if (diff <= 0) {
    countdown.value = null
    return
  }

  countdown.value = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

const formatCountdown = computed(() => {
  if (!countdown.value) return ''

  const { days, hours, minutes, seconds } = countdown.value

  if (days > 0) {
    return `${days}d ${hours}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
})

let timer: NodeJS.Timer

onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.premiere-countdown {
  font-size: 0.875rem;
  color: var(--v-medium-emphasis-color);
}

.countdown-text {
  font-weight: 500;
}
</style>
