<template>
  <v-list-item
    :class="{ unread: !notification.is_read }"
    @click="markAsRead"
    class="notification-item"
  >
    <template v-slot:prepend>
      <v-avatar :color="getAvatarColor" size="40">
        <v-icon>{{ getIcon }}</v-icon>
      </v-avatar>
    </template>

    <v-list-item-title class="text-subtitle-1 mb-1">
      {{ notification.data.title }}
    </v-list-item-title>

    <v-list-item-subtitle>
      {{ notification.data.message }}
    </v-list-item-subtitle>

    <v-list-item-subtitle class="d-flex align-center mt-1">
      <v-chip size="x-small" :color="getStatusColor" class="me-2">
        {{ notification.data.status }}
      </v-chip>
      <span class="text-caption text-grey">
        {{ formattedDate }}
      </span>
    </v-list-item-subtitle>

    <template v-if="notification.data.order_id" #append>
      <v-chip size="small" variant="outlined" class="text-caption">
        {{ notification.data.order_id }}
      </v-chip>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDateFormatter } from '@/composables/useDateFormatter'

// Type definitions
type TransactionType =
  | 'transfer'
  | 'payment'
  | 'deposit'
  | 'withdrawal'
  | 'refund'
type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed'

interface TransactionData {
  title: string
  message: string
  transaction_id: number
  amount: number
  type: TransactionType
  status: TransactionStatus
  wallet_id: number
  sender_id?: number
  order_id?: string
  currency_id?: number
}

interface NotificationAction {
  label: string
  type: string
  payload: Record<string, any>
}

interface Notification {
  id: string
  type: string
  data: TransactionData
  read_at: string | null
  created_at: string
  created_at_human: string
  is_read: boolean
  actions: NotificationAction[]
  title: string
  message: string
}

// Props and emits
const props = defineProps<{
  notification: Notification
}>()

const emit = defineEmits<{
  read: [notificationId: string]
  action: [
    notificationId: string,
    actionType: string,
    payload: Record<string, any>
  ]
}>()

// Composables
const { formatRelativeDate } = useDateFormatter()

// Computed properties
const formattedDate = computed((): string => {
  return formatRelativeDate(props.notification.created_at)
})

const getAvatarColor = computed((): string => {
  const colors: Record<TransactionType, string> = {
    transfer: 'primary',
    payment: 'secondary',
    deposit: 'success',
    withdrawal: 'warning',
    refund: 'error',
  }
  return colors[props.notification.data.type] || 'grey'
})

const getIcon = computed((): string => {
  const icons: Record<TransactionType, string> = {
    transfer: 'mdi-bank-transfer',
    payment: 'mdi-credit-card',
    deposit: 'mdi-bank-transfer-in',
    withdrawal: 'mdi-bank-transfer-out',
    refund: 'mdi-cash-refund',
  }
  return icons[props.notification.data.type] || 'mdi-bell'
})

const getStatusColor = computed((): string => {
  const colors: Record<TransactionStatus, string> = {
    completed: 'success',
    pending: 'warning',
    failed: 'error',
    reversed: 'error',
  }
  return colors[props.notification.data.status] || 'grey'
})

// Methods
const markAsRead = (): void => {
  if (!props.notification.is_read) {
    emit('read', props.notification.id)
  }
}

const handleAction = (action: NotificationAction): void => {
  emit('action', props.notification.id, action.type, action.payload)
}
</script>

<style scoped lang="scss">
.notification-item {
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgb(var(--v-theme-surface-variant));
  }

  &.unread {
    background-color: rgb(var(--v-theme-primary-lighten-4));

    &:hover {
      background-color: rgb(var(--v-theme-primary-lighten-3));
    }
  }

  :deep(.v-list-item__content) {
    overflow: visible;
  }

  .v-chip {
    text-transform: capitalize;
  }
}
</style>
