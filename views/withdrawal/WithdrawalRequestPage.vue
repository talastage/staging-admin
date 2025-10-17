<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card elevation="10">
          <v-card-title class="d-flex align-center justify-space-between">
            <span>Withdrawal Requests</span>
            <v-btn
              color="primary"
              prepend-icon="mdi-cash-multiple"
              :to="'/wallet/withdraw'"
              variant="flat"
            >
              New Withdrawal
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-tabs v-model="activeTab" bg-color="transparent">
              <v-tab value="all">All</v-tab>
              <v-tab value="pending">Pending</v-tab>
              <v-tab value="completed">Completed</v-tab>
              <v-tab value="rejected">Rejected</v-tab>
              <v-tab value="cancelled">Cancelled</v-tab>
            </v-tabs>

            <div v-if="loading" class="d-flex justify-center my-5">
              <v-progress-circular indeterminate color="primary" />
            </div>

            <div v-else-if="error" class="text-center my-5">
              <v-alert type="error" variant="tonal">
                {{ error }}
              </v-alert>
              <v-btn
                color="primary"
                class="mt-4"
                @click="fetchWithdrawalRequests"
              >
                Try Again
              </v-btn>
            </div>

            <div
              v-else-if="!withdrawalRequests.length"
              class="text-center my-5"
            >
              <v-icon size="64" color="grey" icon="mdi-cash-remove" />
              <div class="text-h6 mt-2">No withdrawal requests found</div>
              <div class="text-body-2 text-grey">
                {{ getEmptyStateMessage() }}
              </div>
              <v-btn
                color="primary"
                class="mt-4"
                :to="'/wallet/withdraw'"
                variant="flat"
              >
                Make a Withdrawal
              </v-btn>
            </div>

            <v-table v-else>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Account</th>
                  <th>Status</th>
                  <th>Approval Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="request in withdrawalRequests" :key="request.id">
                  <td>{{ request.reference_number }}</td>
                  <td>{{ formatDate(request.created_at) }}</td>
                  <td>
                    <div class="d-flex flex-column">
                      <span>{{
                        formatCurrency(request.amount, request.currency?.code)
                      }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="d-flex align-center">
                      <v-avatar
                        size="24"
                        class="mr-2"
                        v-if="getPaymentMethodLogo(request)"
                      >
                        <v-img :src="getPaymentMethodLogo(request)" />
                      </v-avatar>
                      {{ getPaymentMethodName(request) }}
                    </div>
                  </td>
                  <td>
                    <div class="d-flex flex-column">
                      <span>{{ request.account_number }}</span>
                      <small class="text-grey">{{
                        request.account_holder_name
                      }}</small>
                    </div>
                  </td>
                  <td>
                    <v-chip
                      :color="getStatusColor(request.status)"
                      size="small"
                      :text="formatStatus(request.status)"
                    />
                  </td>
                  <td>
                    <template
                      v-if="request.timeline && request.status === 'pending'"
                    >
                      <div class="d-flex flex-column">
                        <span>{{ request.timeline.formatted_local_time }}</span>
                        <v-tooltip location="bottom">
                          <template v-slot:activator="{ props }">
                            <small
                              class="text-caption"
                              :class="
                                request.timeline.remaining?.is_overdue
                                  ? 'text-error'
                                  : 'text-primary'
                              "
                              v-bind="props"
                            >
                              {{ request.timeline.formatted_remaining }}
                            </small>
                          </template>
                          <span>
                            {{
                              request.timeline.remaining?.is_overdue
                                ? 'Approval is taking longer than expected'
                                : 'Estimated approval time remaining'
                            }}
                          </span>
                        </v-tooltip>

                        <v-progress-linear
                          v-if="!request.timeline.remaining?.is_overdue"
                          :model-value="calculateProgressPercentage(request)"
                          color="primary"
                          height="4"
                          class="mt-1"
                        />
                      </div>
                    </template>
                    <template v-else-if="request.status === 'completed'">
                      <span class="text-success">Approved & Processed</span>
                    </template>
                    <template
                      v-else-if="
                        ['rejected', 'cancelled'].includes(request.status)
                      "
                    >
                      <span class="text-error">{{
                        request.status === 'rejected' ? 'Rejected by Admin' : formatStatus(request.status)
                      }}</span>
                    </template>
                    <template v-else>
                      <span>Awaiting Review</span>
                    </template>
                  </td>
                  <td>
                    <div class="d-flex">
                      <v-btn
                        icon="mdi-eye"
                        variant="text"
                        size="small"
                        color="primary"
                        @click="viewDetails(request)"
                      />
                      <v-btn
                        v-if="request.status === 'pending'"
                        icon="mdi-close"
                        variant="text"
                        size="small"
                        color="error"
                        @click="confirmCancel(request)"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <v-pagination
              v-if="totalPages > 1"
              v-model="currentPage"
              :length="totalPages"
              rounded="circle"
              class="mt-5"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Cancel Confirmation Dialog -->
    <v-dialog v-model="cancelDialog" max-width="400">
      <v-card>
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
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import { useToast } from 'vue-toastification'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const { $axios } = useNuxtApp()

// State
const withdrawalRequests = ref([])
const loading = ref(true)
const error = ref(null)
const currentPage = ref(1)
const perPage = ref(10)
const totalItems = ref(0)
const activeTab = ref('all')

// Dialog state
const detailsDialog = ref(false)
const cancelDialog = ref(false)
const selectedRequest = ref(null)
const cancelLoading = ref(false)

// Computed
const totalPages = computed(() => Math.ceil(totalItems.value / perPage.value))

// Methods
const fetchWithdrawalRequests = async () => {
  loading.value = true
  error.value = null

  try {
    const status = activeTab.value !== 'all' ? activeTab.value : null
    const params = {
      page: currentPage.value,
      per_page: perPage.value,
      status: status,
    }

    const response = await $axios.get('/api/withdrawal-requests', { params })

    if (response.data.success) {
      withdrawalRequests.value = response.data.data.data
      totalItems.value = response.data.data.total

      // Update URL with query params
      router.push({
        query: {
          ...route.query,
          page: currentPage.value,
          tab: activeTab.value,
        },
      })
    } else {
      error.value =
        response.data.message || 'Failed to fetch withdrawal requests'
    }
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      'An error occurred while fetching withdrawal requests'
    console.error('Error fetching withdrawal requests:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return format(new Date(dateString), 'MMM d, yyyy h:mm a')
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

const formatStatus = (status) => {
  const statusLabels = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    failed: 'Failed',
  }

  return statusLabels[status] || status
}

const getPaymentMethodName = (request) => {
  if (!request) return '-'

  // Check if we have a payment method
  if (request.payment_method?.name) {
    return request.payment_method.name
  }

  // Check if we have a paymentable
  if (request.paymentable_type && request.paymentable) {
    if (request.paymentable_type.includes('MobileMoneyProvider')) {
      return request.paymentable.name || 'Mobile Money'
    } else if (request.paymentable_type.includes('Bank')) {
      return request.paymentable.name || 'Bank Transfer'
    }
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
  if (request.paymentable_type && request.paymentable?.logo_url) {
    return request.paymentable.logo_url
  }

  return null
}

const getPaymentMethodIcon = (request) => {
  if (!request) return 'mdi-bank'

  if (
    request.paymentable_type &&
    request.paymentable_type.includes('MobileMoneyProvider')
  ) {
    return 'mdi-cellphone'
  }

  return 'mdi-bank'
}

const getAccountLabel = (request) => {
  if (!request) return 'Account'

  if (
    request.paymentable_type &&
    request.paymentable_type.includes('MobileMoneyProvider')
  ) {
    return 'Mobile Number'
  }

  return 'Account Number'
}

const calculateProgressPercentage = (request) => {
  if (
    !request.timeline ||
    !request.created_at ||
    !request.timeline.estimated_hours
  ) {
    return 0
  }

  const createdAt = new Date(request.created_at)
  const estimatedCompletion = new Date(request.timeline.utc_completion_time)
  const now = new Date()

  // If already completed or overdue
  if (now >= estimatedCompletion) {
    return 100
  }

  const totalDuration = estimatedCompletion - createdAt
  const elapsedDuration = now - createdAt

  return Math.min(100, Math.round((elapsedDuration / totalDuration) * 100))
}

const getEmptyStateMessage = () => {
  switch (activeTab.value) {
    case 'pending':
      return "You don't have any pending withdrawal requests."
    case 'completed':
      return "You don't have any completed withdrawal requests."
    case 'rejected':
      return "You don't have any rejected withdrawal requests."
    case 'cancelled':
      return "You don't have any cancelled withdrawal requests."
    default:
      return "You haven't made any withdrawal requests yet."
  }
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

const viewDetails = (request) => {
  router.push(
    `/wallet/transactions/withdrawal-requests/withdrawal-${request.reference_number}`
  )
}

const confirmCancel = (request) => {
  selectedRequest.value = request
  cancelDialog.value = true
  detailsDialog.value = false
}

const cancelWithdrawalRequest = async () => {
  if (!selectedRequest.value) return

  cancelLoading.value = true

  try {
    const response = await $axios.delete(
      `/api/withdrawal-requests/${selectedRequest.value.id}`
    )

    if (response.data.success) {
      toast.success('Withdrawal request cancelled successfully')

      // Close dialog
      cancelDialog.value = false

      // Refresh data
      fetchWithdrawalRequests()
    } else {
      throw new Error(
        response.data.message || 'Failed to cancel withdrawal request'
      )
    }
  } catch (err) {
    toast.error(
      err.response?.data?.message ||
        'An error occurred while cancelling the withdrawal request'
    )
    console.error('Error cancelling withdrawal request:', err)
  } finally {
    cancelLoading.value = false
  }
}

// Watchers
watch(currentPage, () => {
  fetchWithdrawalRequests()
})

watch(activeTab, () => {
  currentPage.value = 1
  fetchWithdrawalRequests()
})

// Lifecycle
onMounted(() => {
  // Set initial values from URL query params
  if (route.query.page) {
    currentPage.value = parseInt(route.query.page) || 1
  }

  if (
    route.query.tab &&
    ['all', 'pending', 'completed', 'rejected', 'cancelled'].includes(
      route.query.tab
    )
  ) {
    activeTab.value = route.query.tab
  }

  fetchWithdrawalRequests()
})
</script>
