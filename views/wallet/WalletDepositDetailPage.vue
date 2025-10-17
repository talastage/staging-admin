<!-- pages/wallet/deposit/[reference].vue -->
<template>
    <div class="deposit-status-container">
      <!-- Loading State with Inline Skeleton -->
      <template v-if="loading">
        <BaseCard>
          <v-card-title class="d-flex align-center pb-2">
            <v-skeleton-loader type="avatar" size="32" class="mr-2" />
            <v-skeleton-loader type="text" width="150" />
          </v-card-title>
  
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <!-- Amount Section -->
                <div class="mb-4">
                  <v-skeleton-loader type="text" width="80" class="mb-2" />
                  <v-skeleton-loader type="heading" class="mb-4" />
                </div>
  
                <!-- Status Section -->
                <div>
                  <v-skeleton-loader type="text" width="80" class="mb-2" />
                  <v-skeleton-loader type="chip" width="100" />
                </div>
              </v-col>
  
              <v-col cols="12" sm="6">
                <!-- Reference Section -->
                <div class="mb-4">
                  <v-skeleton-loader type="text" width="80" class="mb-2" />
                  <v-skeleton-loader type="text" width="200" />
                </div>
  
                <!-- Date Section -->
                <div>
                  <v-skeleton-loader type="text" width="80" class="mb-2" />
                  <v-skeleton-loader type="text" width="180" />
                </div>
              </v-col>
            </v-row>
  
            <v-divider class="my-4" />
  
            <!-- Payment Method Section -->
            <div class="mb-4">
              <v-skeleton-loader type="text" width="120" class="mb-3" />
              <div class="d-flex align-center">
                <v-skeleton-loader
                  type="image"
                  width="40"
                  height="40"
                  class="mr-3"
                />
                <v-skeleton-loader type="text" width="150" />
              </div>
            </div>
  
            <!-- Payment Details Section -->
            <div>
              <v-skeleton-loader type="text" width="120" class="mb-3" />
              <v-row>
                <v-col cols="12" sm="6">
                  <v-skeleton-loader type="text" width="80" class="mb-2" />
                  <v-skeleton-loader type="text" width="180" />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-skeleton-loader type="text" width="80" class="mb-2" />
                  <v-skeleton-loader type="text" width="180" />
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </BaseCard>
      </template>
  
      <!-- Error State -->
      <v-alert v-else-if="error" type="error" class="mb-4">
        {{ error }}
      </v-alert>
  
      <!-- Success State -->
      <template v-else-if="deposit">
        <BaseCard>
          <v-card-title class="d-flex align-center pb-2">
            <v-icon
              :color="getStatusColor(deposit.status)"
              size="32"
              class="mr-2"
            >
              {{ getStatusIcon(deposit.status) }}
            </v-icon>
            Deposit Status
          </v-card-title>
  
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <div class="text-subtitle-1 font-weight-bold mb-2">Amount</div>
                <div class="text-h5 mb-4">
                  {{
                    currencyFormatter(
                      deposit.amount,
                      deposit.currency.symbol,
                      deposit.currency.code
                    )
                  }}
                </div>
  
                <div class="text-subtitle-1 font-weight-bold mb-2">Status</div>
                <v-chip
                  :color="getStatusColor(deposit.status)"
                  text-color="white"
                >
                  {{ formatStatus(deposit.status) }}
                </v-chip>
              </v-col>
  
              <v-col cols="12" sm="6">
                <div class="text-subtitle-1 font-weight-bold mb-2">Reference</div>
                <div class="text-body-1 mb-4">
                  {{ deposit.reference }}
                </div>
  
                <div class="text-subtitle-1 font-weight-bold mb-2">Date</div>
                <div class="text-body-1">
                  {{ formatLocalDateTime(deposit.created_at) }}
                  <span class="text-caption text-medium-emphasis ml-2">
                    ({{ formatRelativeDate(deposit.created_at) }})
                  </span>
                </div>
              </v-col>
            </v-row>
  
            <v-divider class="my-4" />
  
            <div class="text-subtitle-1 font-weight-bold mb-3">
              Payment Method
            </div>
            <div class="d-flex align-center mb-4">
              <v-img
                :src="deposit.payment_details.payment_method.logo_url"
                :alt="deposit.payment_details.payment_method.name"
                width="40"
                height="40"
                class="mr-3"
              />
              <div class="text-body-1">
                {{ deposit.payment_details.payment_method.name }}
              </div>
            </div>
  
            <div class="text-subtitle-1 font-weight-bold mb-3">
              Payment Details
            </div>
            <v-row>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Account Name</div>
                <div class="text-body-1 mb-2">
                  {{ deposit.payment_details.account_name || 'N/A' }}
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">
                  Account Number
                </div>
                <div class="text-body-1">
                  {{ deposit.payment_details.account_number || 'N/A' }}
                </div>
              </v-col>
            </v-row>
          </v-card-text>
  
          <v-card-actions v-if="deposit.status === 'pending'" class="pt-0">
            <v-spacer />
            <v-btn color="primary" @click="checkStatus" :loading="checking">
              Check Status
            </v-btn>
          </v-card-actions>
        </BaseCard>
      </template>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useDateFormatter } from '~/composables/useDateFormatter'
  import { useCurrencyFormatter } from '~/composables/useCurrencyFormatter'
  import { useLoadingState } from '~/composables/useLoadingState'
  
  interface Currency {
    code: string
    symbol: string
  }
  
  interface PaymentMethod {
    id: number
    name: string
    logo_url: string
  }
  
  interface PaymentDetails {
    account_name: string | null
    account_number: string | null
    payment_method: PaymentMethod
  }
  
  interface Order {
    reference: string
    status: string
  }
  
  interface Deposit {
    reference: string
    amount: number
    status:
      | 'pending'
      | 'processing'
      | 'completed'
      | 'failed'
      | 'cancelled'
      | 'refunded'
    created_at: string
    processed_at: string | null
    currency: Currency
    payment_details: PaymentDetails
    order: Order
  }
  
  const route = useRoute()
  const { $axios } = useNuxtApp()
  const { formatRelativeDate, formatLocalDateTime } = useDateFormatter()
  const { currencyFormatter } = useCurrencyFormatter()
  const { loading, startLoading, stopLoading } = useLoadingState()
  
  const deposit = ref<Deposit | null>(null)
  const error = ref<string | null>(null)
  const checking = ref(false)
  
  const fetchDepositDetails = async () => {
    try {
      startLoading()
      const { data } = await $axios.get<{ success: boolean; deposit: Deposit }>(
        `/api/deposits/${route.params.reference}`
      )
      deposit.value = data.deposit
    } catch (err) {
      error.value = 'Unable to fetch deposit details. Please try again later.'
      console.error('Error fetching deposit:', err)
    } finally {
      await stopLoading()
    }
  }
  
  const getStatusColor = (status: Deposit['status']): string => {
    const colors: Record<Deposit['status'], string> = {
      pending: 'warning',
      processing: 'info',
      completed: 'success',
      failed: 'error',
      cancelled: 'error',
      refunded: 'error',
    }
    return colors[status] || 'grey'
  }
  
  const getStatusIcon = (status: Deposit['status']): string => {
    const icons: Record<Deposit['status'], string> = {
      pending: 'mdi-clock-outline',
      processing: 'mdi-progress-clock',
      completed: 'mdi-check-circle',
      failed: 'mdi-alert-circle',
      cancelled: 'mdi-cancel',
      refunded: 'mdi-cash-refund',
    }
    return icons[status] || 'mdi-help-circle'
  }
  
  const formatStatus = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }
  
  const checkStatus = async () => {
    if (checking.value) return
  
    try {
      checking.value = true
      await fetchDepositDetails()
    } finally {
      checking.value = false
    }
  }
  
  onMounted(() => {
    fetchDepositDetails()
  })
  </script>
  
  <style scoped>
  .deposit-status-container {
    width: 100%;
  }
  
  :deep(.v-skeleton-loader) {
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }
  
  @keyframes skeleton-pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
  </style>
  