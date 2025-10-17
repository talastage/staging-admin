<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <base-content
          title="Withdrawal Request Details"
          :subtitle="`Reference: ${reference}`"
        >
          <template #action>
            <v-btn
              color="primary"
              variant="flat"
              prepend-icon="mdi-arrow-left"
              :to="'/wallet/transactions/withdrawal-requests'"
              class="mr-2"
            >
              Back to Requests
            </v-btn>
          </template>

          <template #content>
            <div v-if="loading" class="d-flex justify-center my-10">
              <v-progress-circular indeterminate color="primary" size="64" />
            </div>

            <div v-else-if="error" class="text-center my-10">
              <v-alert type="error" variant="tonal">
                {{ error }}
              </v-alert>
              <v-btn color="primary" class="mt-4" @click="handleRetry">
                Try Again
              </v-btn>
            </div>

            <template v-else-if="withdrawalRequest">
              <!-- Status Card -->
              <v-card
                class="mb-6"
                :color="getStatusBackground(withdrawalRequest.status)"
                variant="flat"
                elevation="10"
              >
                <v-card-text>
                  <div class="d-flex align-center">
                    <v-avatar
                      :color="getStatusColor(withdrawalRequest.status)"
                      size="42"
                      class="mr-4"
                    >
                      <v-icon
                        :icon="getStatusIcon(withdrawalRequest.status)"
                        color="white"
                      />
                    </v-avatar>
                    <div>
                      <div class="text-h6">
                        {{ withdrawalRequest.formattedStatus }}
                      </div>
                      <div class="text-body-2">
                        {{ getStatusMessage(withdrawalRequest.status) }}
                      </div>
                    </div>
                    <v-spacer></v-spacer>
                    <v-btn
                      v-if="withdrawalRequest.canBeCancelled"
                      color="error"
                      variant="tonal"
                      @click="confirmCancel"
                    >
                      Cancel Request
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>

              <v-row>
                <!-- Details Column -->
                <v-col cols="12" md="6">
                  <v-card class="mb-6" elevation="10">
                    <v-card-title class="text-subtitle-1">
                      <v-icon
                        start
                        icon="mdi-information-outline"
                        color="primary"
                      />
                      Request Information
                    </v-card-title>
                    <v-card-text>
                      <v-list>
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon icon="mdi-identifier" />
                          </template>
                          <v-list-item-title>Reference</v-list-item-title>
                          <v-list-item-subtitle>{{
                            withdrawalRequest.reference_number
                          }}</v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon icon="mdi-calendar" />
                          </template>
                          <v-list-item-title>Date</v-list-item-title>
                          <v-list-item-subtitle>
                            {{
                              dateFormatter.formatLocalDateTime(
                                withdrawalRequest.created_at
                              )
                            }}
                          </v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon icon="mdi-cash" />
                          </template>
                          <v-list-item-title>Amount</v-list-item-title>
                          <v-list-item-subtitle>{{
                            formatCurrency(
                              withdrawalRequest.amount,
                              withdrawalRequest.currency?.code
                            )
                          }}</v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon icon="mdi-bank" />
                          </template>
                          <v-list-item-title>Payment Method</v-list-item-title>
                          <v-list-item-subtitle>
                            <div class="d-flex align-center">
                              <v-avatar
                                size="24"
                                class="mr-2"
                                v-if="getPaymentMethodLogo(withdrawalRequest)"
                              >
                                <v-img
                                  :src="getPaymentMethodLogo(withdrawalRequest)"
                                />
                              </v-avatar>
                              {{ getPaymentMethodName(withdrawalRequest) }}
                            </div>
                          </v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon
                              :icon="getPaymentMethodIcon(withdrawalRequest)"
                            />
                          </template>
                          <v-list-item-title>{{
                            getAccountLabel(withdrawalRequest)
                          }}</v-list-item-title>
                          <v-list-item-subtitle>{{
                            withdrawalRequest.account_number
                          }}</v-list-item-subtitle>
                        </v-list-item>

                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon icon="mdi-account" />
                          </template>
                          <v-list-item-title>Account Holder</v-list-item-title>
                          <v-list-item-subtitle>{{
                            withdrawalRequest.account_holder_name
                          }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Timeline Column -->
                <v-col cols="12" md="6">
                  <v-card elevation="10">
                    <v-card-title class="text-subtitle-1">
                      <v-icon
                        start
                        icon="mdi-clock-time-eight-outline"
                        color="primary"
                      />
                      Estimated Timeline
                    </v-card-title>
                    <v-card-text>
                      <template
                        v-if="
                          withdrawalRequest.timeline &&
                          withdrawalRequest.status === 'pending'
                        "
                      >
                        <v-card class="mb-4" color="primary" variant="outlined">
                          <v-card-text>
                            <div class="d-flex align-center">
                              <v-icon
                                icon="mdi-clock-outline"
                                class="mr-2"
                                color="primary"
                              />
                              <div class="d-flex flex-column">
                                <div class="text-subtitle-1 font-weight-medium">
                                  Estimated Approval Time
                                </div>
                                <div class="text-h6">
                                  {{
                                    withdrawalRequest.timeline
                                      .formatted_local_time
                                  }}
                                </div>
                                <div
                                  v-if="
                                    !withdrawalRequest.timeline.remaining
                                      ?.is_overdue
                                  "
                                  class="text-subtitle-2 font-weight-bold"
                                >
                                  <countdown-timer
                                    :end-time="
                                      withdrawalRequest.timeline
                                        .utc_completion_time
                                    "
                                  />
                                </div>
                                <div
                                  v-else
                                  class="text-error text-subtitle-2 font-weight-bold"
                                >
                                  Approval is taking longer than expected
                                </div>
                              </div>
                            </div>
                          </v-card-text>
                        </v-card>
                      </template>

                      <v-timeline align="start">
                        <v-timeline-item
                          dot-color="success"
                          size="small"
                          icon="mdi-check-circle"
                        >
                          <div class="d-flex justify-space-between">
                            <div>
                              <strong>Request Submitted</strong>
                              <div class="text-caption">
                                Your withdrawal request has been received
                              </div>
                            </div>
                            <div class="text-caption">
                              {{
                                dateFormatter.formatLocalDateTime(
                                  withdrawalRequest.created_at
                                )
                              }}
                            </div>
                          </div>
                        </v-timeline-item>

                        <v-timeline-item
                          :dot-color="
                            getTimelineStatusColor(
                              withdrawalRequest.status,
                              'processing'
                            )
                          "
                          size="small"
                          :icon="
                            getTimelineStatusIcon(
                              withdrawalRequest.status,
                              'processing'
                            )
                          "
                        >
                          <div class="d-flex justify-space-between">
                            <div>
                              <strong>Admin Review</strong>
                              <div class="text-caption">
                                Your request is being reviewed by our admin team
                              </div>
                            </div>
                            <div class="text-caption">
                              {{
                                withdrawalRequest.processed_at
                                  ? dateFormatter.formatLocalDateTime(
                                      withdrawalRequest.processed_at
                                    )
                                  : 'Pending'
                              }}
                            </div>
                          </div>
                        </v-timeline-item>

                        <v-timeline-item
                          :dot-color="
                            getTimelineStatusColor(
                              withdrawalRequest.status,
                              'completed'
                            )
                          "
                          size="small"
                          :icon="
                            getTimelineStatusIcon(
                              withdrawalRequest.status,
                              'completed'
                            )
                          "
                        >
                          <div class="d-flex justify-space-between">
                            <div>
                              <strong>Approved & Processed</strong>
                              <div class="text-caption">
                                Request approved and funds sent to your account
                              </div>
                            </div>
                            <div class="text-caption">
                              {{
                                withdrawalRequest.completed_at
                                  ? dateFormatter.formatLocalDateTime(
                                      withdrawalRequest.completed_at
                                    )
                                  : withdrawalRequest.timeline
                                  ? withdrawalRequest.timeline
                                      .formatted_local_time
                                  : 'Pending'
                              }}
                            </div>
                          </div>
                        </v-timeline-item>
                      </v-timeline>

                      <v-card
                        v-if="
                          withdrawalRequest.timeline &&
                          !withdrawalRequest.timeline.remaining?.is_overdue &&
                          withdrawalRequest.status === 'pending'
                        "
                        class="mt-4"
                        variant="tonal"
                        color="info"
                      >
                        <v-card-text>
                          <div class="d-flex align-center">
                            <v-icon icon="mdi-information" class="mr-2" />
                            <div>
                              Your request is under review. You will receive an update
                              once admin approves your withdrawal.
                            </div>
                          </div>
                        </v-card-text>
                      </v-card>

                      <v-card
                        v-else-if="
                          withdrawalRequest.timeline &&
                          withdrawalRequest.timeline.remaining?.is_overdue &&
                          withdrawalRequest.status === 'pending'
                        "
                        class="mt-4"
                        variant="tonal"
                        color="warning"
                      >
                        <v-card-text>
                          <div class="d-flex align-center">
                            <v-icon icon="mdi-clock-alert" class="mr-2" />
                            <div>
                              Admin review is taking longer than expected.
                              Our team has been notified and will review
                              your request as soon as possible.
                            </div>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </template>
          </template>
        </base-content>
      </v-col>
    </v-row>

    <!-- Cancel Confirmation Dialog -->
    <v-dialog v-model="cancelDialog" max-width="400">
      <v-card elevation="10">
        <v-card-title>Cancel Withdrawal Request?</v-card-title>
        <v-card-text>
          Are you sure you want to cancel this withdrawal request? The funds
          will be returned to your wallet.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="cancelDialog = false"
            >No, Keep It</v-btn
          >
          <v-btn
            color="error"
            :loading="cancelLoading"
            @click="cancelWithdrawalRequest"
          >
            Yes, Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ContactFooter />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useDateFormatter } from '~/composables/useDateFormatter'
import { useSnackMessageStore } from '~/stores/useSnackMessage'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const { $axios } = useNuxtApp()
const dateFormatter = useDateFormatter()
const snackStore = useSnackMessageStore()

// Props and state
const reference = computed(() => route.params.reference)
const withdrawalRequest = ref(null)
const loading = ref(true) // Start with loading true
const error = ref(null)
const cancelDialog = ref(false)
const cancelLoading = ref(false)
const isRequestInProgress = ref(false) // Track request state

// Methods
const fetchWithdrawalRequest = async () => {
  // Prevent multiple simultaneous requests
  if (isRequestInProgress.value) {
    return
  }

  loading.value = true
  isRequestInProgress.value = true
  error.value = null

  try {
    const response = await $axios.get(
      `/api/withdrawal-requests/${reference.value}`
    )

    if (response.data.success) {
      withdrawalRequest.value = response.data.data
    } else {
      throw new Error(
        response.data.message || 'Failed to fetch withdrawal request'
      )
    }
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      'An error occurred while fetching the withdrawal request'
    console.error('Error fetching withdrawal request:', err)
  } finally {
    loading.value = false
    isRequestInProgress.value = false
  }
}

// Handle retry button click
const handleRetry = () => {
  if (!isRequestInProgress.value) {
    fetchWithdrawalRequest()
  }
}

const formatCurrency = (amount, currencyCode = 'USD') => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode || 'USD',
  }).format(amount)
}

const getStatusColor = (status) => {
  const statusColors = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    rejected: 'error',
    cancelled: 'grey',
    failed: 'error',
  }

  return statusColors[status] || 'grey'
}

const getStatusBackground = (status) => {
  const statusBackgrounds = {
    pending: 'warning-lighten-4',
    processing: 'info-lighten-4',
    completed: 'success-lighten-4',
    rejected: 'error-lighten-4',
    cancelled: 'grey-lighten-4',
    failed: 'error-lighten-4',
  }

  return statusBackgrounds[status] || 'grey-lighten-4'
}

const getStatusIcon = (status) => {
  const statusIcons = {
    pending: 'mdi-clock-outline',
    processing: 'mdi-sync',
    completed: 'mdi-check-circle',
    rejected: 'mdi-close-circle',
    cancelled: 'mdi-cancel',
    failed: 'mdi-alert-circle',
  }

  return statusIcons[status] || 'mdi-help-circle'
}

const getStatusMessage = (status) => {
  const statusMessages = {
    pending: 'Your withdrawal request is awaiting admin approval.',
    processing: 'Your withdrawal request has been approved and is being processed.',
    completed: 'Your withdrawal has been approved and successfully processed.',
    rejected: 'Your withdrawal request has been rejected by admin.',
    cancelled: 'You have cancelled this withdrawal request.',
    failed: 'Your withdrawal request has failed to process.',
  }

  return statusMessages[status] || 'Status information unavailable'
}

const getPaymentMethodName = (request) => {
  if (!request) return '-'

  // Check if we have a payment method
  if (request.payment_method?.name) {
    return request.payment_method.name
  }

  // Check if we have a paymentable
  if (request.paymentable) {
    return request.paymentable.name || 'Payment Method'
  }

  return 'Unknown'
}

const getPaymentMethodLogo = (request) => {
  if (!request) return null

  // Check if we have a payment method with logo
  if (request.payment_method?.logo_url) {
    return request.payment_method.logo_url
  }

  // Check if we have a paymentable with logo
  if (request.paymentable?.logo_url) {
    return request.paymentable.logo_url
  }

  return null
}

const getPaymentMethodIcon = (request) => {
  if (!request) return 'mdi-bank'

  if (request.paymentable?.type === 'MobileMoneyProvider') {
    return 'mdi-cellphone'
  }

  return 'mdi-bank'
}

const getAccountLabel = (request) => {
  if (!request) return 'Account'

  if (request.paymentable?.type === 'MobileMoneyProvider') {
    return 'Mobile Number'
  }

  return 'Account Number'
}

const getTimelineStatusColor = (currentStatus, checkStatus) => {
  if (currentStatus === 'rejected' || currentStatus === 'cancelled') {
    return currentStatus === checkStatus ? 'error' : 'grey'
  }

  if (currentStatus === 'completed' && checkStatus === 'completed') {
    return 'success'
  }

  if (currentStatus === 'completed' && checkStatus === 'processing') {
    return 'success'
  }

  if (currentStatus === 'processing' && checkStatus === 'processing') {
    return 'info'
  }

  if (currentStatus === 'pending' && checkStatus === 'processing') {
    return 'grey'
  }

  return 'grey'
}

const getTimelineStatusIcon = (currentStatus, checkStatus) => {
  if (currentStatus === 'rejected' && checkStatus === 'rejected') {
    return 'mdi-close-circle'
  }

  if (currentStatus === 'cancelled' && checkStatus === 'cancelled') {
    return 'mdi-close-circle'
  }

  if (
    currentStatus === 'completed' &&
    (checkStatus === 'completed' || checkStatus === 'processing')
  ) {
    return 'mdi-check-circle'
  }

  if (currentStatus === 'processing' && checkStatus === 'processing') {
    return 'mdi-check-circle'
  }

  return 'mdi-clock-outline'
}

const confirmCancel = () => {
  cancelDialog.value = true
}

const cancelWithdrawalRequest = async () => {
  if (!withdrawalRequest.value) return

  cancelLoading.value = true

  try {
    const response = await $axios.delete(
      `/api/withdrawal-requests/${withdrawalRequest.value.id}`
    )

    if (response.data.success) {
      // Use the reusable snack message component
      snackStore.success('Withdrawal request cancelled successfully')

      // Close dialog and refresh data
      cancelDialog.value = false

      // Fetch updated data after cancellation
      if (!isRequestInProgress.value) {
        fetchWithdrawalRequest()
      }
    } else {
      throw new Error(
        response.data.message || 'Failed to cancel withdrawal request'
      )
    }
  } catch (err) {
    // Use the reusable snack message component
    snackStore.error(
      err.response?.data?.message ||
        'An error occurred while cancelling the withdrawal request'
    )
    console.error('Error cancelling withdrawal request:', err)
  } finally {
    cancelLoading.value = false
  }
}

// Only fetch data once on mount
onMounted(() => {
  // Fetch data only once with a delay to prevent race conditions
  setTimeout(() => {
    fetchWithdrawalRequest()
  }, 100)
})

// No onUnmounted needed as we've removed the interval
</script>
