<!-- components/WithdrawalList.vue -->
<template>
  <div>
    <v-table>
      <thead>
        <tr>
          <th>Reference</th>
          <th>Date</th>
          <th>Amount</th>
          <th>Method</th>
          <th>Status</th>
          <th>Estimated Completion</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="withdrawal in withdrawals" :key="withdrawal.id">
          <td>{{ withdrawal.reference_number }}</td>
          <td>{{ formatDate(withdrawal.created_at) }}</td>
          <td>
            <div class="d-flex flex-column">
              <span>{{ formatCurrency(withdrawal.amount) }}</span>
              <small class="text-grey">
                Fee: {{ formatCurrency(withdrawal.fee) }}
              </small>
            </div>
          </td>
          <td>
            <div class="d-flex align-center">
              <v-avatar
                size="24"
                class="mr-2"
                v-if="withdrawal.payment_method?.logo_url"
              >
                <v-img :src="withdrawal.payment_method.logo_url" />
              </v-avatar>
              {{ withdrawal.payment_method?.name || 'Unknown' }}
            </div>
          </td>
          <td>
            <v-chip
              :color="getStatusColor(withdrawal.status)"
              size="small"
              :text="formatStatus(withdrawal.status)"
            />
          </td>
          <td>
            <template
              v-if="
                withdrawal.timeline &&
                ['pending', 'processing'].includes(withdrawal.status)
              "
            >
              <div class="d-flex flex-column">
                <span>{{ withdrawal.timeline.formatted_local_time }}</span>
                <v-tooltip location="bottom">
                  <template v-slot:activator="{ props }">
                    <small
                      class="text-caption"
                      :class="
                        withdrawal.timeline.remaining?.is_overdue
                          ? 'text-error'
                          : 'text-primary'
                      "
                      v-bind="props"
                    >
                      {{ withdrawal.timeline.formatted_remaining }}
                    </small>
                  </template>
                  <span>
                    {{
                      withdrawal.timeline.remaining?.is_overdue
                        ? 'This withdrawal is taking longer than expected'
                        : 'Estimated time remaining'
                    }}
                  </span>
                </v-tooltip>

                <v-progress-linear
                  v-if="!withdrawal.timeline.remaining?.is_overdue"
                  :model-value="calculateProgressPercentage(withdrawal)"
                  color="primary"
                  height="4"
                  class="mt-1"
                />
              </div>
            </template>
            <template v-else-if="withdrawal.status === 'completed'">
              <span class="text-success">Completed</span>
            </template>
            <template
              v-else-if="['rejected', 'failed'].includes(withdrawal.status)"
            >
              <span class="text-error">Cancelled</span>
            </template>
            <template v-else>
              <span>-</span>
            </template>
          </td>
          <td>
            <v-btn
              icon="mdi-eye"
              variant="text"
              size="small"
              color="primary"
              :to="`/withdrawals/${withdrawal.id}`"
            />
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup>
import { format } from 'date-fns'

const props = defineProps({
  withdrawals: {
    type: Array,
    default: () => [],
  },
})

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return format(new Date(dateString), 'MMM d, yyyy h:mm a')
}

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

// Get status color
const getStatusColor = (status) => {
  const statusColors = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    rejected: 'error',
    failed: 'error',
  }

  return statusColors[status] || 'grey'
}

// Format status
const formatStatus = (status) => {
  const statusLabels = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    rejected: 'Rejected',
    failed: 'Failed',
  }

  return statusLabels[status] || status
}

// Calculate progress percentage
const calculateProgressPercentage = (withdrawal) => {
  if (
    !withdrawal.timeline ||
    !withdrawal.created_at ||
    !withdrawal.timeline.estimated_hours
  ) {
    return 0
  }

  const createdAt = new Date(withdrawal.created_at)
  const estimatedCompletion = new Date(withdrawal.timeline.utc_completion_time)
  const now = new Date()

  // If already completed or overdue
  if (now >= estimatedCompletion) {
    return 100
  }

  const totalDuration = estimatedCompletion - createdAt
  const elapsedDuration = now - createdAt

  return Math.min(100, Math.round((elapsedDuration / totalDuration) * 100))
}
</script>
