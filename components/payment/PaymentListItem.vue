<!-- components/payments/PaymentListItem.vue -->
<template>
  <BaseCard
    :to="`/payments/payment-${payment.reference}`"
    hover
    class="mb-3 payment-list-item"
  >
    <v-card-text class="pa-4">
      <div class="payment-item-content">
        <!-- Left Section: Project/User Preview -->
        <div class="preview-section">
          <!-- For Project Payments -->
          <template
            v-if="
              ['project_watching', 'project_tip'].includes(
                payment.payment_type
              ) && payment.project
            "
          >
            <div 
              class="project-preview clickable" 
              @click.stop="navigateToProject(payment.project.access_uuid)"
            >
              <v-img
                :src="payment.project.thumbnail_url"
                :alt="payment.project.name"
                :width="smAndDown ? 64 : 80"
                :height="smAndDown ? 36 : 45"
                cover
                class="rounded-lg project-thumbnail"
              >
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular indeterminate color="grey-lighten-4" size="20" />
                  </div>
                </template>
                <div class="play-overlay">
                  <v-icon color="white" size="20">mdi-play</v-icon>
                </div>
              </v-img>
              <div class="text-caption mt-1 project-name">
                {{ truncateText(payment.project.name, 40) }}
              </div>
            </div>
          </template>

          <!-- For User Tips -->
          <template
            v-else-if="payment.payment_type === 'tip' && payment.recipient"
          >
            <div 
              class="user-preview clickable" 
              @click.stop="navigateToUser(payment.recipient.username)"
            >
              <UserAvatar
                :username="payment.recipient.username"
                :profile_photo="payment.recipient.profile_photo"
                :size="smAndDown ? 'sm' : 'md'"
                class="user-avatar"
              />
              <div class="text-caption mt-1 recipient-name">
                {{ payment.recipient.display_name }}
              </div>
            </div>
          </template>
        </div>

        <!-- Right Section: Payment Details -->
        <div class="payment-details">
          <div class="d-flex align-center justify-between mb-2 payment-header">
            <div class="d-flex align-center">
              <v-icon
                :color="getStatusColor(payment.status)"
                :size="smAndDown ? 18 : 20"
                class="mr-2"
              >
                {{ getStatusIcon(payment.status) }}
              </v-icon>
              <span :class="smAndDown ? 'text-subtitle-2' : 'text-subtitle-1'" class="font-weight-medium">
                {{
                  currencyFormatter(
                    payment.amount,
                    payment.currency.symbol,
                    payment.currency.code
                  )
                }}
              </span>
            </div>
            <v-chip
              :color="getStatusColor(payment.status)"
              size="small"
              class="status-chip"
              variant="tonal"
            >
              {{ formatStatus(payment.status) }}
            </v-chip>
          </div>

          <!-- Payment Info -->
          <div class="text-body-2 text-medium-emphasis mb-2 payment-info">
            <div class="d-flex align-center flex-wrap gap-2">
              <div class="d-flex align-center">
                <v-icon size="14" class="mr-1">mdi-clock-outline</v-icon>
                <span class="date-text">{{ formatRelativeDate(payment.created_at) }}</span>
              </div>
              <v-divider vertical class="separator-divider" />
              <span class="payment-type">{{ formatPaymentType(payment.payment_type) }}</span>
            </div>
          </div>

          <!-- Payment Method & Order Info -->
          <div class="d-flex align-center justify-between text-caption text-medium-emphasis">
            <div class="d-flex align-center payment-method">
              <v-icon size="14" class="mr-1">mdi-wallet-outline</v-icon>
              <span>{{ payment.payment_method.name }}</span>
            </div>
            <span class="order-ref">Order #{{ payment.order.reference.slice(-8) }}</span>
          </div>
        </div>

        <!-- Navigation Chevron -->
        <div class="chevron-container">
          <v-icon size="18" color="grey-lighten-1">mdi-chevron-right</v-icon>
        </div>
      </div>
    </v-card-text>
  </BaseCard>
</template>

<script setup lang="ts">
import { useDateFormatter } from '~/composables/useDateFormatter'
import { useCurrencyFormatter } from '~/composables/useCurrencyFormatter'
import { useDisplay } from 'vuetify'

interface PaymentProps {
  payment: {
    reference: string
    amount: string
    status: string
    payment_type: string
    created_at: string
    processed_at: string
    currency: {
      code: string
      symbol: string
    }
    payment_method: {
      id: number
      name: string
      logo_url: string | null
    }
    order: {
      reference: string
      status: string
      total_amount: string
      completed_at: string
    }
    project?: {
      id: number
      access_uuid: string
      name: string
      thumbnail_url: string
      video_url: string
      created_at: string
      views_count: number
    }
    recipient?: {
      id: number
      username?: string
      display_name: string
      profile_photo: string
    }
  }
}

const props = defineProps<PaymentProps>()

const { formatRelativeDate } = useDateFormatter()
const { currencyFormatter } = useCurrencyFormatter()
const { mobile, smAndDown } = useDisplay()
const router = useRouter()

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    failed: 'error',
    cancelled: 'grey',
    refunded: 'purple',
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    pending: 'mdi-clock-outline',
    processing: 'mdi-progress-clock',
    completed: 'mdi-check-circle',
    failed: 'mdi-alert-circle',
    cancelled: 'mdi-cancel',
    refunded: 'mdi-cash-refund',
  }
  return icons[status] || 'mdi-help-circle'
}

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const formatPaymentType = (type: string) => {
  const types: Record<string, string> = {
    tip: 'User Tip',
    project_tip: 'Project Tip',
    project_watching: 'Project Purchase',
  }
  return types[type] || type
}

const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const navigateToProject = (accessUuid: string) => {
  router.push(`/watch/${accessUuid}`)
}

const navigateToUser = (username?: string) => {
  if (username) {
    router.push(`/${username}`)
  }
}
</script>

<style scoped lang="scss">
.payment-list-item {
  transition: all 0.2s ease;
  border: 1px solid rgba(var(--v-border-color), 0.12);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: rgba(var(--v-theme-primary), 0.3);
  }
}

.payment-item-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.preview-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.payment-details {
  flex: 1;
  min-width: 0;
}

.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  padding: 4px;
  
  &:hover {
    background: rgba(var(--v-theme-primary), 0.08);
    transform: scale(1.02);
  }
}

.project-preview {
  position: relative;
  text-align: center;
}

.project-thumbnail {
  position: relative;
  overflow: hidden;
  
  &:hover .play-overlay {
    opacity: 1;
  }
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.user-preview {
  text-align: center;
}

.user-avatar {
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
}

.project-name,
.recipient-name {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.payment-header {
  align-items: flex-start;
}

.status-chip {
  font-size: 0.75rem;
  height: 20px;
}

.payment-info {
  .gap-2 {
    gap: 8px;
  }
}

.separator-divider {
  height: 12px;
  opacity: 0.5;
}

.payment-method,
.order-ref {
  font-size: 0.75rem;
}

.chevron-container {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  height: 100%;
  margin-left: 8px;
}

/* Responsive styles */
@media (max-width: 768px) {
  .payment-item-content {
    gap: 8px;
  }
  
  .preview-section {
    min-width: 64px;
  }
  
  .project-name,
  .recipient-name {
    max-width: 64px;
    font-size: 0.7rem;
  }
  
  .payment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .status-chip {
    align-self: flex-start;
  }
  
  .separator-divider {
    display: none;
  }
  
  .payment-info .gap-2 {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

@media (max-width: 600px) {
  .payment-item-content {
    flex-direction: column;
    gap: 12px;
  }
  
  .preview-section {
    flex-direction: row;
    width: 100%;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    min-width: auto;
  }
  
  .project-preview,
  .user-preview {
    display: flex;
    align-items: center;
    gap: 8px;
    text-align: left;
  }
  
  .project-name,
  .recipient-name {
    margin-top: 0;
    max-width: 200px;
    font-size: 0.8rem;
  }
  
  .chevron-container {
    position: absolute;
    top: 16px;
    right: 16px;
  }
  
  .payment-details {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .payment-item-content {
    gap: 8px;
  }
  
  .preview-section {
    gap: 8px;
  }
  
  .project-name,
  .recipient-name {
    max-width: 150px;
  }
}

/* Dark mode enhancements */
.v-theme--dark .payment-list-item {
  &:hover {
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
  }
}

.v-theme--dark .clickable:hover {
  background: rgba(var(--v-theme-primary), 0.12);
}
</style>