<!-- pages/test/pusher.vue -->
<template>
  <div class="pa-4">
    <h1>Pusher Connection Test</h1>

    <v-card class="ma-4 pa-4">
      <h2>Connection Status: {{ connectionStatus }}</h2>

      <v-btn
        @click="initializePusher"
        :disabled="connectionStatus === 'connected'"
        color="primary"
        class="mr-2"
      >
        Connect to Pusher
      </v-btn>

      <v-btn
        @click="disconnect"
        :disabled="connectionStatus === 'disconnected'"
        color="error"
        class="mr-2"
      >
        Disconnect
      </v-btn>

      <v-btn
        @click="testChannel"
        :disabled="connectionStatus !== 'connected'"
        color="success"
      >
        Test Channel
      </v-btn>
    </v-card>

    <v-card class="ma-4 pa-4">
      <h3>Debug Info</h3>
      <pre>{{ debugInfo }}</pre>
    </v-card>

    <v-card class="ma-4 pa-4">
      <h3>Messages</h3>
      <div v-for="message in messages" :key="message.id" class="mb-2">
        <v-chip>{{ message.timestamp }}</v-chip>
        {{ message.text }}
      </div>
    </v-card>
  </div>
</template>

<script setup>
const { connectionStatus, initializePusher, subscribeTo, disconnect } =
  usePusher()
const config = useRuntimeConfig()

const messages = ref([])
const debugInfo = ref({})

const addMessage = (text) => {
  messages.value.push({
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    text,
  })
}

const testChannel = () => {
  try {
    const channel = subscribeTo('test-channel')
    if (channel) {
      channel.bind('test-event', (data) => {
        addMessage(`Received: ${JSON.stringify(data)}`)
      })
      addMessage('Subscribed to test-channel')
    }
  } catch (error) {
    addMessage(`Error: ${error.message}`)
  }
}

// Update debug info
watchEffect(() => {
  debugInfo.value = {
    connectionStatus: connectionStatus.value,
    pusherKey: config.public.pusherKey,
    pusherCluster: config.public.pusherCluster,
    pusherForceTLS: config.public.pusherForceTLS,
    frontendUrl: config.public.frontendUrl,
    backendUrl: config.public.backendUrl,
  }
})

onMounted(() => {
  addMessage('Page loaded')
})
</script>
