<template>
  <div>
    <!-- Loading State -->
    <v-card
      v-if="walletStore.isFetching"
      class="wallet-card"
      elevation="2"
      rounded="lg"
    >
      <v-card-text class="py-6">
        <v-skeleton-loader type="article" class="pa-4"></v-skeleton-loader>
      </v-card-text>
    </v-card>

    <!-- Error State -->
    <v-card
      v-else-if="walletStore.error"
      class="wallet-card error-card"
      elevation="2"
      rounded="lg"
    >
      <v-card-text class="text-center pa-6">
        <v-icon color="error" size="x-large" class="mb-4"
          >mdi-alert-circle-outline</v-icon
        >
        <div class="text-body-1 mb-4">{{ walletStore.error.message }}</div>
        <v-btn
          color="primary"
          variant="elevated"
          rounded="pill"
          @click="loadWallet"
        >
          <v-icon start>mdi-refresh</v-icon>
          Retry
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Compact Wallet Content -->
    <v-card
      v-else-if="walletStore.wallet?.data"
      class="wallet-card-compact"
      elevation="1"
      rounded="lg"
    >
      <!-- Compact Header Section -->
      <v-card-item class="wallet-header-compact pa-3">
        <div class="d-flex justify-space-between align-center">
          <div class="flex-grow-1">
            <div class="d-flex align-center gap-2 mb-1">
              <v-avatar size="24" color="primary">
                <v-icon size="14" color="white">mdi-wallet</v-icon>
              </v-avatar>
              <div class="text-body-1 font-weight-bold">
                {{ walletStore.wallet.data.name }}
              </div>
              <v-chip
                :color="getStatusColor"
                size="x-small"
                label
                variant="tonal"
                class="font-weight-medium"
              >
                {{ capitalizeFirstLetter(walletStore.wallet.data.status) }}
              </v-chip>
            </div>
            <div class="d-flex align-center">
              <span class="text-caption text-medium-emphasis"
                >{{ walletStore.wallet.data.wallet_code }}</span
              >
              <v-btn
                icon="mdi-content-copy"
                variant="text"
                density="compact"
                size="x-small"
                color="primary"
                @click="copyWalletCode"
                class="ml-1"
              ></v-btn>
            </div>
          </div>
        </div>
      </v-card-item>

      <!-- Compact Balance Section -->
      <v-card-text class="wallet-balance-container-compact pa-3 pt-0">
        <WalletBalance />
      </v-card-text>

      <!-- Action Buttons Section -->
      <v-card-actions v-if="!props.hideActions" class="wallet-actions pa-3 pt-0">
        <div class="d-flex w-100" style="gap: 8px;">
          <v-btn
            v-for="action in actions"
            :key="action.title"
            :color="action.color"
            variant="tonal"
            size="small"
            :to="action.to"
            class="action-btn"
            style="flex: 1;"
          >
            <v-icon size="16" class="mb-1">{{ action.icon }}</v-icon>
            <div class="text-caption">{{ action.title }}</div>
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>

    <!-- No Wallet State -->
    <v-card v-else class="wallet-card" elevation="2" rounded="lg">
      <v-card-text class="text-center pa-6">
        <v-icon color="grey" size="x-large" class="mb-4"
          >mdi-wallet-outline</v-icon
        >
        <div class="text-h6 mb-4">No Wallet Found</div>
        <v-btn
          color="primary"
          variant="elevated"
          rounded="pill"
          @click="loadWallet"
        >
          <v-icon start>mdi-refresh</v-icon>
          Refresh
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Copy Success Snackbar -->
    <v-snackbar
      v-model="showCopySnackbar"
      color="success"
      location="top"
      rounded="pill"
      timeout="2000"
    >
      <div class="d-flex align-center">
        <v-icon start class="mr-2">mdi-check-circle</v-icon>
        Wallet ID copied to clipboard
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWalletStore } from '~/stores/useWalletStore'

const props = defineProps({
  hideActions: {
    type: Boolean,
    default: false
  }
})

const walletStore = useWalletStore()
const showCopySnackbar = ref(false)

// Computed properties
const isWalletActive = computed(
  () => walletStore.wallet?.data?.status === 'active'
)

const getStatusColor = computed(() => {
  const status = walletStore.wallet?.data?.status
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'amber-darken-2'
    case 'suspended':
    case 'frozen':
    case 'blocked':
    case 'restricted':
    case 'locked':
      return 'error'
    default:
      return 'grey'
  }
})

const lastUpdatedText = computed(() => {
  if (!walletStore.lastUpdated) return null

  const now = new Date()
  const updated = new Date(walletStore.lastUpdated)
  const diffMs = now.getTime() - updated.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins === 1) return 'Updated 1 minute ago'
  if (diffMins < 60) return `Updated ${diffMins} minutes ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours === 1) return 'Updated 1 hour ago'
  if (diffHours < 24) return `Updated ${diffHours} hours ago`

  return updated.toLocaleDateString()
})

// Actions configuration
const actions = [
  {
    title: 'Transfer',
    icon: 'mdi-bank-transfer-out',
    color: 'primary',
    to: '/wallet/transfer',
  },
  {
    title: 'Deposit',
    icon: 'mdi-arrow-down-bold-circle-outline',
    color: 'success',
    to: '/wallet/deposit',
  },
  {
    title: 'Withdraw',
    icon: 'mdi-arrow-up-bold-circle-outline',
    color: 'warning',
    to: '/wallet/withdraw',
  },
]

// Methods
const loadWallet = async () => {
  try {
    await walletStore.fetchWallet()
  } catch (error) {
    console.error('Failed to load wallet:', error)
  }
}

const copyWalletCode = async () => {
  const walletCode = walletStore.wallet?.data?.wallet_code
  if (walletCode) {
    try {
      await navigator.clipboard.writeText(walletCode)
      showCopySnackbar.value = true
    } catch (error) {
      console.error('Failed to copy wallet code:', error)
    }
  }
}

const capitalizeFirstLetter = (str: string) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Lifecycle
onMounted(() => {
  if (!walletStore.wallet) {
    loadWallet()
  }
})
</script>

<style scoped>
.wallet-card {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}

.wallet-card-compact {
  border-radius: 12px;
  transition: all 0.2s ease;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border: 1px solid rgba(98, 0, 234, 0.1);
}

.wallet-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.08);
}

.wallet-header-compact {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.wallet-balance-container-compact {
  position: relative;
}

.gap-2 {
  gap: 8px;
}

.error-card {
  border: 1px solid rgba(var(--v-theme-error), 0.12);
}

.wallet-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.action-btn {
  height: 60px !important;
  flex-direction: column;
  border-radius: 8px;
  min-width: 0;
}

@media (max-width: 600px) {
  .wallet-card-compact {
    margin: 0 -8px;
  }
  
  .wallet-header-compact {
    padding: 12px 16px !important;
  }
  
  .wallet-balance-container-compact {
    padding: 12px 16px !important;
  }
  
  .action-btn {
    height: 50px !important;
  }
}
</style>
