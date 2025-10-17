<!-- views\payments\UserPaymentDetailPage.vue -->
<template>
  <div>
    <BaseHeader title="Payment Details" :margin-bottom="24">
      <template #actionable>
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          @click="router.push('/payments')"
          class="font-weight-medium"
        >
          Back to Payments
        </v-btn>
      </template>
    </BaseHeader>

    <div class="payment-status-container">
      <!-- Loading State -->
      <template v-if="loading || isVerifying || isInitializing">
        <BaseCard>
          <v-card-title class="d-flex align-center pb-2">
            <v-progress-circular 
              indeterminate 
              color="primary" 
              size="32" 
              class="mr-2" 
            />
            <div class="text-h6">
              {{ isVerifying ? 'Verifying Payment...' : 'Loading Payment Details...' }}
            </div>
          </v-card-title>
          
          <v-card-text>
            <p class="text-center text-medium-emphasis">
              {{ isVerifying 
                ? 'Please wait while we confirm your payment status with the gateway...' 
                : 'Loading your payment information...' 
              }}
            </p>
          </v-card-text>
        </BaseCard>
      </template>

      <!-- Error State -->
      <v-alert v-else-if="error" type="error" class="mb-4">
        {{ error }}
      </v-alert>

      <!-- Success State -->
      <template v-else-if="currentPayment">
        <BaseCard>
          <v-card-title class="d-flex align-center pb-2">
            <v-icon
              :color="getStatusColor(currentPayment.status)"
              size="32"
              class="mr-2"
            >
              {{ getStatusIcon(currentPayment.status) }}
            </v-icon>
            {{ getPaymentTypeTitle(currentPayment.payment_type) }}
          </v-card-title>

          <v-card-text>
            <!-- Payment Details -->
            <v-row>
              <v-col cols="12" sm="6">
                <div class="text-subtitle-1 font-weight-bold mb-2">Amount</div>
                <div class="text-h5 mb-4">
                  {{
                    currencyFormatter(
                      currentPayment.amount,
                      currentPayment.currency.symbol,
                      currentPayment.currency.code
                    )
                  }}
                </div>

                <div class="text-subtitle-1 font-weight-bold mb-2">Status</div>
                <v-chip
                  :color="getStatusColor(currentPayment.status)"
                  text-color="white"
                >
                  {{ formatStatus(currentPayment.status) }}
                </v-chip>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="text-subtitle-1 font-weight-bold mb-2">
                  Reference
                </div>
                <div class="text-body-1 mb-4">
                  {{ currentPayment.reference }}
                </div>

                <div class="text-subtitle-1 font-weight-bold mb-2">Date</div>
                <div class="text-body-1">
                  {{ formatLocalDateTime(currentPayment.created_at) }}
                  <span class="text-caption text-medium-emphasis ml-2">
                    ({{ formatRelativeDate(currentPayment.created_at) }})
                  </span>
                </div>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- Recipient/Project Details -->
            <div class="text-subtitle-1 font-weight-bold mb-3">
              {{ getRecipientTitle(currentPayment.payment_type) }}
            </div>

            <!-- User Card for Tips -->
            <template v-if="currentPayment.payment_type === 'tip'">
              <!-- Single recipient (legacy support) -->
              <UserCard
                v-if="currentPayment.recipient"
                :user="currentPayment.recipient"
                size="medium"
                layout="compact"
              />

              <!-- Multiple recipients -->
              <template
                v-else-if="
                  currentPayment.recipients && currentPayment.recipients.length
                "
              >
                <div
                  v-for="(recipient, index) in currentPayment.recipients"
                  :key="index"
                  class="mb-3"
                >
                  <UserCard :user="recipient" size="medium" layout="compact" />
                </div>
              </template>
            </template>

            <!-- Project Cards for Project Tips/Watching/Premiering -->
            <template
              v-else-if="
                projectPaymentTypes.includes(currentPayment.payment_type)
              "
            >
              <!-- Multiple projects -->
              <template
                v-if="
                  currentPayment.projects && currentPayment.projects.length > 0
                "
              >
                <div
                  v-for="(project, index) in currentPayment.projects"
                  :key="project.id"
                  class="mb-4"
                >
                  <ProjectCardCompact :project="project" size="md">
                    <template #actions>
                      <template
                        v-if="
                          currentPayment.payment_type === 'project_watching'
                        "
                      >
                        <WatchNowButton
                          :access-uuid="project.access_uuid"
                          size="md"
                        >
                          Start Watching
                        </WatchNowButton>
                      </template>
                      <template
                        v-else-if="
                          currentPayment.payment_type === 'project_premiering'
                        "
                      >
                        <v-btn
                          color="primary"
                          variant="tonal"
                          size="small"
                          prepend-icon="mdi-pencil"
                          @click="navigateToEditDraft(project.access_uuid)"
                        >
                          Edit Draft
                        </v-btn>
                      </template>
                    </template>
                  </ProjectCardCompact>
                  <v-divider
                    v-if="index < currentPayment.projects.length - 1"
                    class="my-3"
                  />
                </div>
              </template>

              <!-- Single project (legacy support) -->
              <template v-else-if="currentPayment.project">
                <ProjectCardCompact :project="currentPayment.project" size="md">
                  <template #actions>
                    <template
                      v-if="currentPayment.payment_type === 'project_watching'"
                    >
                      <v-btn
                        color="primary"
                        variant="tonal"
                        size="small"
                        prepend-icon="mdi-play-circle-outline"
                        @click="
                          navigateToWatch(currentPayment.project.access_uuid)
                        "
                      >
                        Watch Now
                      </v-btn>
                    </template>
                    <template
                      v-else-if="
                        currentPayment.payment_type === 'project_premiering'
                      "
                    >
                      <v-btn
                        color="primary"
                        variant="tonal"
                        size="small"
                        prepend-icon="mdi-pencil"
                        @click="
                          navigateToEditDraft(
                            currentPayment.project.access_uuid
                          )
                        "
                      >
                        Edit Draft
                      </v-btn>
                    </template>
                  </template>
                </ProjectCardCompact>
              </template>

              <!-- No projects found -->
              <div v-else class="text-body-1 text-medium-emphasis">
                No projects found for this payment.
              </div>
            </template>
          </v-card-text>
        </BaseCard>
      </template>
    </div>

    <!-- Recent Transactions Section -->
    <div class="mt-6">
      <BaseTitle tag="h2" size="h5" :margin-bottom="4">
        Recent Transactions
      </BaseTitle>

      <!-- Loading Skeleton -->
      <template v-if="recentTransactionsLoading && !recentPayments.length">
        <PaymentListSkeleton v-for="n in 3" :key="n" />
      </template>

      <!-- Payments List -->
      <template v-else-if="recentPayments.length">
        <PaymentList
          :payments="recentPayments"
          :loading="recentTransactionsLoading"
        />

        <!-- View All Button -->
        <div class="text-center mt-4">
          <v-btn
            color="primary"
            variant="outlined"
            @click="router.push('/payments')"
          >
            View All Transactions
          </v-btn>
        </div>
      </template>

      <!-- Empty State -->
      <v-alert v-else type="info" variant="tonal" class="text-center">
        No payment history found
      </v-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDateFormatter } from '~/composables/useDateFormatter'
import { useCurrencyFormatter } from '~/composables/useCurrencyFormatter'
import { useAuthStore } from '~/stores/auth'
import { useUserPayments, Payment } from '~/composables/useUserPayments'
import { usePaymentVerification } from '~/composables/usePaymentVerification'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const { formatRelativeDate, formatLocalDateTime } = useDateFormatter()
const { currencyFormatter } = useCurrencyFormatter()
const { verifyPayment, isVerifying } = usePaymentVerification()

// Use our new composable
const {
  currentPayment,
  loading,
  error,
  fetchPaymentDetail,
  initPaymentDetail,
  getStatusColor,
  getStatusIcon,
  getPaymentTypeTitle,
  getRecipientTitle,
  formatStatus,
  projectPaymentTypes,
  fetchPayments,
} = useUserPayments()

// For recent transactions section
const recentPayments = ref<Payment[]>([])
const recentTransactionsLoading = ref(false)
const isInitializing = ref(true)

const navigateToWatch = (accessUuid: string) => {
  router.push(`/watch/${accessUuid}`)
}

const navigateToEditDraft = (accessUuid: string) => {
  router.push(`/studio/projects/${accessUuid}/edit_draft`)
}

// Fetch recent transactions
const fetchRecentTransactions = async () => {
  try {
    recentTransactionsLoading.value = true
    const { data } = await useNuxtApp().$axios.get('/api/user/payments', {
      params: { page: 1, per_page: 5 }, // Only fetch first 5 transactions
    })
    recentPayments.value = data.payments.data
  } catch (error) {
    console.error('Error fetching recent transactions:', error)
  } finally {
    recentTransactionsLoading.value = false
  }
}

// Handle payment verification
const handleVerifyPayment = async () => {
  if (!currentPayment.value) return
  
  const txRef = route.query.tx_ref as string
  const depositId = route.query.depositId as string
  const transactionId = route.query.transaction_id as string
  
  const isPawaPay = !!depositId
  const reference = txRef || depositId || currentPayment.value.reference
  
  const result = await verifyPayment(reference, transactionId, isPawaPay)
  
  if (result.success) {
    // Refresh payment details to show updated status
    await fetchPaymentDetail(currentPayment.value.reference)
  }
}

// Auto-verify if coming from successful payment redirect
const autoVerifyPayment = async () => {
  const status = route.query.status as string
  const txRef = route.query.tx_ref as string
  const transactionId = route.query.transaction_id as string
  const depositId = route.query.depositId as string // PawaPay uses depositId
  
  console.log('Auto-verify check:', { status, txRef, depositId, transactionId, paymentStatus: currentPayment.value?.status })
  
  // Auto-verify if we have successful status OR if we have depositId (PawaPay)
  if ((status === 'successful' && txRef) || depositId) {
    const isPawaPay = !!depositId
    const referenceToUse = txRef || depositId
    const transactionIdToUse = transactionId || depositId
    
    console.log('Starting auto-verification...', { referenceToUse, transactionIdToUse, isPawaPay })
    const result = await verifyPayment(referenceToUse, transactionIdToUse, isPawaPay)
    
    console.log('Verification result:', result)
    
    if (result.success) {
      // Refresh payment details to show updated status
      await fetchPaymentDetail(referenceToUse)
      
      // Clean up URL by removing query parameters
      await nextTick()
      router.replace({ 
        path: route.path,
        query: {} 
      })
    }
  }
}

onMounted(async () => {
  try {
    isInitializing.value = true
    
    // First load payment details
    await initPaymentDetail()
    
    // Auto-verify if needed before showing UI
    await autoVerifyPayment()
    
    // Then load recent transactions
    await fetchRecentTransactions()
  } catch (error) {
    console.error('Error loading payment details:', error)
  } finally {
    isInitializing.value = false
  }
})
</script>

<style scoped>
.payment-status-container {
  width: 100%;
  /* Removed max-width constraint to make it full width */
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
