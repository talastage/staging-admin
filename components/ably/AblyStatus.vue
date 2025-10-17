<template>
  <div class="ably-status">
    <div class="status-indicator" :class="connectionStateClass">
      <span class="status-text"> Ably: {{ connectionState }} </span>
      <span v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $ably } = useNuxtApp()
const connectionState = ref('checking')
const errorMessage = ref('')

const connectionStateClass = computed(
  () => `connection-${connectionState.value}`
)

onMounted(() => {
  // First verify if Ably key exists
  const config = useRuntimeConfig()
  if (!config.public.ablyKey) {
    connectionState.value = 'failed'
    errorMessage.value = 'Ably key is missing'
    return
  }

  // Verify if Ably instance exists
  if (!$ably) {
    connectionState.value = 'failed'
    errorMessage.value = 'Ably instance not initialized'
    return
  }

  // Set initial state
  connectionState.value = $ably.connection.state

  const handleConnectionStateChange = (stateChange: any) => {
    connectionState.value = stateChange.current
    if (stateChange.reason) {
      errorMessage.value = stateChange.reason.message
    } else {
      errorMessage.value = ''
    }
  }

  // Listen to all connection state changes
  $ably.connection.on((stateChange) => {
    handleConnectionStateChange(stateChange)
  })

  // Force connection check
  try {
    $ably.connection.connect()
  } catch (error: any) {
    connectionState.value = 'failed'
    errorMessage.value = error.message
  }
})

onUnmounted(() => {
  if ($ably) {
    $ably.connection.off()
  }
})
</script>

<style scoped>
.ably-status {
  padding: 8px;
  border-radius: 4px;
  display: inline-block;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
}

.status-text {
  font-weight: 500;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
}

.connection-checking {
  background-color: #9ca3af;
  color: white;
}

.connection-connected {
  background-color: #22c55e;
  color: white;
}

.connection-disconnected {
  background-color: #f59e0b;
  color: white;
}

.connection-failed {
  background-color: #dc2626;
  color: white;
}

.connection-suspended {
  background-color: #6b7280;
  color: white;
}
</style>
