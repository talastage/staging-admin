<!-- components/support/SupportTicketStatus.vue -->
<template>
  <div class="support-ticket-status">
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          :color="getStatusColor(ticket.status)"
          :loading="updating"
          class="text-none"
        >
          {{ ticket.status }}
          <v-icon end>mdi-chevron-down</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item
          v-for="status in availableStatuses"
          :key="status"
          :value="status"
          @click="updateStatus(status)"
        >
          <template v-slot:prepend>
            <v-icon :color="getStatusColor(status)" size="small">
              {{ getStatusIcon(status) }}
            </v-icon>
          </template>
          <v-list-item-title>{{ status }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="showConfirmation" max-width="400">
      <v-card>
        <v-card-title>Confirm Status Change</v-card-title>
        <v-card-text>
          Are you sure you want to change the ticket status to
          {{ pendingStatus }}?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showConfirmation = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="confirmStatusUpdate"
            :loading="updating"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSupport } from '~/composables/useSupport'

const props = defineProps<{
  ticket: {
    uuid: string
    status: string
  }
}>()

const emit = defineEmits(['updated'])

const { updateTicketStatus } = useSupport()

const updating = ref(false)
const showConfirmation = ref(false)
const pendingStatus = ref('')

const availableStatuses = ['open', 'pending', 'resolved', 'closed']

const getStatusColor = (status: string) => {
  const colors = {
    open: 'primary',
    pending: 'warning',
    resolved: 'success',
    closed: 'grey',
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status: string) => {
  const icons = {
    open: 'mdi-ticket',
    pending: 'mdi-clock-outline',
    resolved: 'mdi-check-circle',
    closed: 'mdi-close-circle',
  }
  return icons[status] || 'mdi-ticket'
}

const updateStatus = (status: string) => {
  if (status === props.ticket.status) return
  pendingStatus.value = status
  showConfirmation.value = true
}

const confirmStatusUpdate = async () => {
  updating.value = true
  try {
    await updateTicketStatus(props.ticket.uuid, pendingStatus.value)
    emit('updated')
    showConfirmation.value = false
  } catch (error) {
    // Error handling in composable
  } finally {
    updating.value = false
  }
}
</script>
