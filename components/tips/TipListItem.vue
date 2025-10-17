<template>
  <v-card class="tip-card" elevation="1" hover>
    <v-card-text class="pa-4">
      <div class="d-flex align-center">
        <!-- User Avatar -->
        <UserAvatar
          :username="getUsernameForTip(tip)"
          :profile_photo="getAvatarForTip(tip)"
          :size="48"
          :disableLink="false"
          class="me-3"
        />

        <!-- Main Content -->
        <div class="flex-grow-1">
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center">
              <span class="text-h6 font-weight-medium me-2">
                {{ getNameForTip(tip) }}
              </span>
              <v-chip
                :color="tip.status === 'completed' ? 'success' : 'warning'"
                size="small"
                variant="tonal"
              >
                {{ tip.status }}
              </v-chip>
            </div>
            <span class="text-caption text-medium-emphasis">
              {{ formatRelativeDate(tip.created_at) }}
            </span>
          </div>

          <!-- Transaction Details -->
          <div class="transaction-details">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="amount-section">
                <div class="d-flex align-center">
                  <v-icon 
                    :color="isSent ? 'error' : 'success'" 
                    :icon="isSent ? 'mdi-arrow-up-right' : 'mdi-arrow-down-left'"
                    size="20"
                    class="me-2"
                  />
                  <span class="text-h6 font-weight-bold" :class="isSent ? 'text-error' : 'text-success'">
                    {{ isSent ? tip.gross_amount.formatted : tip.net_amount.formatted }}
                  </span>
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ isSent ? 'Sent' : 'Received' }}
                </div>
              </div>
            </div>

            <!-- Fee Breakdown (for sent tips) -->
            <div v-if="isSent" class="fee-breakdown">
              <v-divider class="my-2" />
              <div class="d-flex justify-space-between text-caption">
                <span>Gross Amount:</span>
                <span>{{ tip.gross_amount.formatted }}</span>
              </div>
              <div class="d-flex justify-space-between text-caption">
                <span>Service Fee:</span>
                <span class="text-error">-{{ tip.app_service_fee.formatted }}</span>
              </div>
              <div class="d-flex justify-space-between text-caption font-weight-medium">
                <span>Net Amount:</span>
                <span>{{ tip.net_amount.formatted }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Tip } from '~/types/tips'
import { useDateFormatter } from '~/composables/useDateFormatter'
import UserAvatar from '~/components/user/UserAvatar.vue'

const { formatRelativeDate } = useDateFormatter()

const props = defineProps<{
  tip: Tip
  currentUserId: number
}>()

const isSent = computed(() => props.tip.record_type === 'sent')

const getNameForTip = (tip: Tip): string => {
  // For self-tips, show "Self" when sent, show own name when received
  if (tip.tipper.id === tip.recipient.id) {
    return isSent.value ? 'Self' : (tip.recipient.display_name || tip.recipient.username)
  }
  
  return isSent.value
    ? tip.recipient.display_name || tip.recipient.username
    : tip.tipper.display_name || tip.tipper.username
}

const getUsernameForTip = (tip: Tip): string => {
  // For self-tips, use current user's username
  if (tip.tipper.id === tip.recipient.id) {
    return tip.recipient.username
  }
  
  return isSent.value ? tip.recipient.username : tip.tipper.username
}

const getAvatarForTip = (tip: Tip): string => {
  // For self-tips, use current user's avatar
  if (tip.tipper.id === tip.recipient.id) {
    return tip.recipient.profile_photo
  }
  
  return isSent.value ? tip.recipient.profile_photo : tip.tipper.profile_photo
}
</script>

<style scoped>
.tip-card {
  border-radius: 12px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.tip-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.transaction-details {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  padding: 12px;
}

.amount-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fee-breakdown {
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 6px;
  padding: 8px;
  margin-top: 8px;
}

.fee-breakdown .d-flex {
  margin-bottom: 4px;
}

.fee-breakdown .d-flex:last-child {
  margin-bottom: 0;
  padding-top: 4px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .tip-card {
    border-color: rgba(255, 255, 255, 0.12);
  }
  
  .transaction-details {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .fee-breakdown {
    background-color: rgba(255, 255, 255, 0.08);
  }
  
  .fee-breakdown .d-flex:last-child {
    border-top-color: rgba(255, 255, 255, 0.12);
  }
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  .tip-card {
    margin-bottom: 8px;
  }
  
  .transaction-details {
    padding: 10px;
  }
  
  .fee-breakdown {
    padding: 6px;
  }
}
</style>