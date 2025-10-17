<!-- components/support/SupportChat.vue -->
<template>
  <v-card class="support-chat d-flex flex-column">
    <v-card-title class="chat-header">
      <div>
        <h3>{{ ticket?.subject }}</h3>
        <span class="text-subtitle-2">{{ ticket?.category?.name }}</span>
      </div>
      <v-spacer />
      <support-ticket-status
        v-if="ticket"
        :ticket="ticket"
        @updated="emit('statusUpdated')"
      />
    </v-card-title>

    <v-card-text class="chat-messages flex-grow-1 overflow-y-auto">
      <v-container class="pa-2">
        <template v-if="messages.length">
          <div
            v-for="(message, index) in messages"
            :key="message.uuid"
            class="mb-4"
          >
            <div
              :class="[
                'message-wrapper d-flex',
                message.type === 'user' ? 'justify-end' : 'justify-start',
              ]"
            >
              <div
                :class="[
                  'message-bubble pa-3 rounded',
                  message.type === 'user' ? 'user-message' : 'agent-message',
                ]"
              >
                <div class="d-flex align-center mb-1">
                  <v-avatar size="24" class="mr-2">
                    <v-img
                      :src="message.user?.avatar || '/default-avatar.png'"
                    />
                  </v-avatar>
                  <span class="text-caption">{{ message.user?.name }}</span>
                  <span class="text-caption ml-2">
                    {{ formatDate(message.created_at) }}
                  </span>
                </div>

                <div class="message-content">{{ message.message }}</div>

                <support-attachment-preview
                  v-if="message.attachments?.length"
                  :attachments="message.attachments"
                  class="mt-2"
                />
              </div>
            </div>
          </div>
        </template>
        <v-alert v-else type="info" text="No messages yet" />
      </v-container>
    </v-card-text>

    <v-divider />

    <v-card-text class="chat-input pa-2">
      <v-form @submit.prevent="sendMessage" ref="form">
        <div class="d-flex align-center">
          <support-file-upload
            v-model="attachments"
            :max-files="5"
            button-only
            class="mr-2"
          />

          <v-textarea
            v-model="newMessage"
            rows="1"
            auto-grow
            hide-details
            density="comfortable"
            placeholder="Type your message..."
            @keydown.enter.prevent="sendMessage"
          />

          <v-btn
            color="primary"
            icon
            class="ml-2"
            :loading="sending"
            @click="sendMessage"
          >
            <v-icon>mdi-send</v-icon>
          </v-btn>
        </div>

        <div v-if="attachments.length" class="mt-2">
          <support-attachment-preview
            :attachments="attachments"
            :deletable="true"
            @delete="removeAttachment"
          />
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useSupport } from '~/composables/useSupport'

const props = defineProps<{
  ticketUuid: string
}>()

const emit = defineEmits<{
  (e: 'statusUpdated'): void
}>()

const {
  currentTicket: ticket,
  messages,
  sendMessage: sendMessageApi,
  uploadAttachment,
} = useSupport()

const form = ref(null)
const newMessage = ref('')
const attachments = ref([])
const sending = ref(false)

const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

const sendMessage = async () => {
  if (!newMessage.value.trim() && !attachments.value.length) return

  sending.value = true
  try {
    const message = await sendMessageApi(props.ticketUuid, newMessage.value)

    // Upload attachments if any
    if (attachments.value.length) {
      for (const file of attachments.value) {
        await uploadAttachment(message.uuid, file)
      }
    }

    newMessage.value = ''
    attachments.value = []
  } catch (error) {
    // Error handling done in composable
  } finally {
    sending.value = false
  }
}

const removeAttachment = (index: number) => {
  attachments.value.splice(index, 1)
}

// Auto-scroll to bottom when new messages arrive
watch(messages, () => {
  nextTick(() => {
    const container = document.querySelector('.chat-messages')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  })
})
</script>

<style scoped>
.support-chat {
  height: 100%;
  min-height: 500px;
}

.chat-messages {
  background-color: rgb(var(--v-theme-background));
}

.message-bubble {
  max-width: 70%;
  word-break: break-word;
}

.user-message {
  background-color: rgb(var(--v-theme-primary), 0.1);
}

.agent-message {
  background-color: rgb(var(--v-theme-surface-variant));
}
</style>
