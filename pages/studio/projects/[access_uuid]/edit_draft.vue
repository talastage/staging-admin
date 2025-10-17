<template>
  <v-container fluid class="pa-0">
    <PremieringPaymentDialog
      v-if="
        isPaymentDataAvailable &&
        mediaUploadStore.project?.payment_status !== 'completed'
      "
      v-model="showPaymentDialog"
      :project="mediaUploadStore.project"
      :title="dialogTitle"
      :error-message="dialogError"
      @payment-success="handlePaymentSuccess"
      @payment-failed="handlePaymentFailed"
    />

    <v-skeleton-loader
      v-if="loading"
      type="card, list-item-three-line@4"
      class="mb-6"
    />

    <template v-else>
      <v-card flat class="mb-6">
        <v-card-text class="pa-6">
          <VideoUploader
            :requirements-data="requirementsStore.formattedRequirements"
            @open-payment-dialog="handlePaymentDialog"
          />
        </v-card-text>
      </v-card>

      <PremieringProjectSteppers
        v-model="currentStep"
        :project="mediaUploadStore.project"
        mode="editDraft"
        @finish="finish"
        @paymentFailed="handlePaymentFailedEvent"
      />
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Composables & Stores
import { usePremieringMediaUploadRequirementsStore } from '@/stores/premiering/usePremieringMediaUploadRequirementsStore'
import { usePremieringMediaUpload } from '@/stores/premiering/usePremieringMediaUpload'
import { useWalletStore } from '~/stores/useWalletStore'
import { useWalletPaymentEligibility } from '~/composables/useWalletPaymentEligibility'
import { useSnackMessageStore } from '~/stores/useSnackMessage'
import { useAppsStore } from '@/stores/useApps'
import { useSeo } from '@/composables/seo/useSeo'

import { PAGE_WIDTHS } from '~/constants/layouts'

definePageMeta({
  contentWidth: PAGE_WIDTHS.FULL,
  layoutOptions: {
    showCategories: false,
    showDrawer: true,
    miniDrawer: false, // Set this to true to have the drawer minimized on page load
  },
  layout: 'studio-project-layout',
  middleware: ['auth', 'noindex'],
})

const route = useRoute()
const router = useRouter()
const { $axios } = useNuxtApp()

const snackStore = useSnackMessageStore()
const requirementsStore = usePremieringMediaUploadRequirementsStore()
const mediaUploadStore = usePremieringMediaUpload()
const walletStore = useWalletStore()
const appsStore = useAppsStore()

// Local state
const loading = ref(true)
const currentStep = ref(1)
const showPaymentDialog = ref(false)
const dialogTitle = ref('')

// Payment fee
const paymentFee = computed(() => ({
  amount: requirementsStore.requirements?.premiering_fee?.amount || 0,
  currency: requirementsStore.requirements?.premiering_fee?.currency || {
    id: 0,
    code: '',
    name: '',
    symbol: '',
  },
}))
const isPaymentDataAvailable = computed(
  () => paymentFee.value.currency?.code !== ''
)

// Dynamic dialog title
const dialogTitleComputed = computed(
  () => `Premiering Payment - ${mediaUploadStore.project?.name || 'Project'}`
)

// Computed error from store
const dialogError = computed(() => mediaUploadStore.error)
const accessUuid = computed(() => route.params.access_uuid as string)
const appName = computed(() => appsStore.talastageApp?.name || 'TalaStage')

// Check wallet status
const { status: walletStatus } = useWalletPaymentEligibility(paymentFee)

// ON MOUNT: Fetch data and handle potential payment dialog
onMounted(async () => {
  loading.value = true
  try {
    await appsStore.fetchTalaStageApp()

    // 1. Fetch Project
    const { data } = await $axios.get(
      `/api/studio/projects/${accessUuid.value}`
    )
    mediaUploadStore.updateUploadStateFromProject(data)
    mediaUploadStore.subscribeToProcessingUpdates()

    // 2. Fetch requirements if needed
    const categorySlug = data.premiering_category?.slug
    if (categorySlug && !requirementsStore.requirements) {
      await requirementsStore.fetchRequirements(categorySlug)
    }

    // 3. Ensure wallet data is loaded
    if (!walletStore.wallet) {
      await walletStore.fetchWallet()
    }

    // 4. Handle initial errors or insufficient funds
    // Only show payment dialog if payment_status is not completed
    if (
      mediaUploadStore.error &&
      mediaUploadStore.project?.payment_status !== 'completed'
    ) {
      dialogTitle.value = mediaUploadStore.error
        .toLowerCase()
        .includes('insufficient')
        ? 'Insufficient Funds: Unable to charge your wallet'
        : 'Upload Error'
      showPaymentDialog.value = true
    } else if (
      walletStatus.value === 'insufficient' &&
      mediaUploadStore.project?.payment_status !== 'completed'
    ) {
      dialogTitle.value = 'Insufficient Funds: Unable to charge your wallet'
      showPaymentDialog.value = true
    }
  } catch (error) {
    console.error('Failed to load draft project or requirements:', error)
    snackStore.error('Failed to load draft project or requirements')
  } finally {
    loading.value = false
  }
})

// Cleanup on unmount
onUnmounted(() => {
  mediaUploadStore.cleanup()
})

// Stepper finish handler
function finish() {
  snackStore.success('Project setup completed!')
  router.push('/studio/projects/manage-projects')
}

// Payment/Dialog Handlers
function handlePaymentDialog(payload: { code: string; message: string }) {
  // Don't show payment dialog if payment is already completed
  if (mediaUploadStore.project?.payment_status === 'completed') {
    return
  }

  dialogTitle.value =
    payload.code === 'CURRENCY_MISMATCH'
      ? 'Currency Mismatch'
      : payload.code === 'INSUFFICIENT_FUNDS'
      ? 'Insufficient Funds: Unable to charge your wallet'
      : dialogTitleComputed.value
  snackStore.warning(payload.message)
  showPaymentDialog.value = true
}

function handlePaymentFailedEvent() {
  // Don't show payment dialog if payment is already completed
  if (mediaUploadStore.project?.payment_status === 'completed') {
    return
  }

  dialogTitle.value = dialogTitleComputed.value
  showPaymentDialog.value = true
  snackStore.error('Payment failed. Please try again.')
}

const handlePaymentSuccess = () => {
  snackStore.success('Payment processed successfully!')
  showPaymentDialog.value = false
  mediaUploadStore.updateUploadStateFromProject(mediaUploadStore.project)
  walletStore.fetchWallet()
}

const handlePaymentFailed = (error: any) => {
  console.error('Payment error:', error)
  snackStore.error(error.response?.data?.message || 'Payment processing failed')
  showPaymentDialog.value = true
  mediaUploadStore.updateUploadStateFromProject(mediaUploadStore.project)
  walletStore.fetchWallet()
}

// SEO Configuration
useSeo({
  title: computed(() =>
    mediaUploadStore.project?.name
      ? `Edit Draft: ${mediaUploadStore.project.name} - ${appName.value}`
      : `Edit Draft - Project - ${appName.value}`
  ),
  description: computed(() =>
    mediaUploadStore.project?.name
      ? `Edit and finalize the draft for your project ${mediaUploadStore.project.name} on ${appName.value}.`
      : `Edit and finalize the draft details for your project on ${appName.value}.`
  ),
  keywords: computed(() =>
    mediaUploadStore.project?.name
      ? `${mediaUploadStore.project.name}, edit project, draft, finalize, upload, ${appName.value}`
      : `edit project, draft, finalize, upload, studio, ${appName.value}`
  ),
  image: computed(
    () =>
      appsStore.talastageApp?.thumbnail_url ||
      appsStore.talastageApp?.logo_url ||
      '/default-project-edit-draft.png'
  ),
  type: 'website',
  siteName: appName,
  url: computed(() => `/studio/projects/${accessUuid.value}/edit_draft`),
  noIndex: true, // This is a user workflow page, so exclude from indexing
  structuredDataFactory: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: mediaUploadStore.project?.name
      ? `Edit Draft: ${mediaUploadStore.project.name} - ${appName.value}`
      : `Edit Draft - Project - ${appName.value}`,
    description: mediaUploadStore.project?.name
      ? `Edit and finalize the draft for your project ${mediaUploadStore.project.name} on ${appName.value}.`
      : `Edit and finalize the draft details for your project on ${appName.value}.`,
    url: `/studio/projects/${accessUuid.value}/edit_draft`,
    isPartOf: {
      '@type': 'CreativeWork',
      name: mediaUploadStore.project?.name || 'Project',
    },
    publisher: {
      '@type': 'Organization',
      name: appName.value,
      logo: {
        '@type': 'ImageObject',
        url: appsStore.talastageApp?.logo_url || '/default-thumbnail.png',
      },
    },
  }),
})
</script>

<style scoped>
/* Any local styling you want */
</style>
