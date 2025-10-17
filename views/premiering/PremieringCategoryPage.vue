<template>
  <v-container fluid class="pa-0">
    <!-- Payment Dialog -->
    <PremieringPaymentDialog
      v-model="showPaymentDialog"
      :project="mediaUploadStore.project"
      @payment-success="handlePaymentSuccess"
      @continue="handleContinueUpload"
    />

    <!-- Notification Snackbar -->
    <v-snackbar
      v-model="notifications.show"
      :color="notifications.color"
      :timeout="5000"
      location="top"
    >
      {{ notifications.message }}
      <template #actions>
        <v-btn color="white" variant="text" @click="notifications.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <!-- VideoUploader Section -->
    <v-card flat class="mb-6">
      <v-card-text class="pa-6">
        <VideoUploader
          :requirements-data="requirementsStore.formattedRequirements"
          @open-payment-dialog="handlePaymentDialog"
        />
      </v-card-text>
    </v-card>

    <!-- Only show steppers if project is loaded -->
    <template v-if="mediaUploadStore.project?.access_uuid">
      <PremieringProjectSteppers
        v-model="currentStep"
        mode="premiering"
        :project="mediaUploadStore.project"
        @finish="finish"
        @paymentFailed="handlePaymentFailed"
      />
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useRoute } from 'vue-router'

// Stores & composables
import { usePremieringMediaUploadRequirementsStore } from '@/stores/premiering/usePremieringMediaUploadRequirementsStore'
import { usePremieringMediaUpload } from '@/stores/premiering/usePremieringMediaUpload'
import { useWalletStore } from '~/stores/useWalletStore'
import { useWalletBalance } from '~/composables/useWalletBalance'

const toast = useToast()
const route = useRoute()

const requirementsStore = usePremieringMediaUploadRequirementsStore()
const mediaUploadStore = usePremieringMediaUpload()
const walletStore = useWalletStore()
const { numericBalance, checkSufficientFunds, formattedBalance } =
  useWalletBalance()

// Stepper current step for v-model
const currentStep = ref(1)

const notifications = ref({
  show: false,
  message: '',
  color: 'error' as 'error' | 'success' | 'info' | 'warning',
})

/** Payment dialog visibility */
const showPaymentDialog = ref(false)

/** Payment fee from the store */
const paymentFee = computed(() => ({
  amount: requirementsStore.requirements?.premiering_fee?.amount || 0,
  currency: requirementsStore.requirements?.premiering_fee?.currency || {
    id: 0,
    code: '',
    name: '',
  },
}))

/** Payment handling */
const handlePaymentSuccess = async () => {
  try {
    await walletStore.fetchWallet()
    notifications.value = {
      show: true,
      message: 'Payment processed successfully!',
      color: 'success',
    }
  } catch (error) {
    notifications.value = {
      show: true,
      message: 'Failed to refresh wallet balance',
      color: 'error',
    }
  }
}

const handleContinueUpload = () => {
  notifications.value = {
    show: true,
    message: 'You can now continue with your upload',
    color: 'success',
  }
}

const handlePaymentFailed = () => {
  // This is triggered by @paymentFailed from the stepper
  // or from the PaymentDialog if something goes wrong
  showPaymentDialog.value = true
}

/** Sufficient funds? */
const isEligible = computed(() =>
  checkSufficientFunds(requirementsStore.amount)
)

/** On Mounted */
onMounted(async () => {
  const slug = route.params.premiering_category_slug as string
  const directlyAccessed = !requirementsStore.selectedCategory

  try {
    // Always fetch requirements for the given category
    await requirementsStore.fetchRequirements(slug)

    // If the user navigated directly and the store had no category, set it
    if (
      directlyAccessed &&
      requirementsStore.requirements?.premiering_category
    ) {
      requirementsStore.selectedCategory =
        requirementsStore.requirements.premiering_category
      // Show payment dialog if needed
      showPaymentDialog.value = true
    }

    // Fetch wallet data
    await walletStore.fetchWallet()

    // Update the project's category if needed
    const cat = requirementsStore.selectedCategory
    if (cat && mediaUploadStore.project) {
      mediaUploadStore.updateProject({ premiering_category_id: cat.id })
    }
  } catch (error) {
    notifications.value = {
      show: true,
      message: 'Failed to load initial data',
      color: 'error',
    }
    console.error('Error in onMounted:', error)
  }
})

onUnmounted(() => {
  requirementsStore.resetState()
})

/** Stepper "finish" handler */
function finish() {
  toast.success('Project setup completed!')
  // Navigate or do any final logic here if needed
}

/** Payment dialog from the VideoUploader */
function handlePaymentDialog(payload: { code: string; message: string }) {
  showPaymentDialog.value = true
  if (payload.code === 'PAYMENT_REQUIRED') {
    requirementsStore.fetchRequirements(
      route.params.premiering_category_slug as string
    )
  }
}
</script>
