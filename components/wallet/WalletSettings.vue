<template>
  <v-container fluid>
    <v-row>
      <!-- Left Sidebar with Tabs -->
      <v-col cols="12" md="3">
        <h2 class="text-h6 mb-4">Wallet Settings</h2>
        <v-list bg-color="grey-lighten-4" rounded="lg" class="settings-list">
          <v-list-item
            v-for="tab in tabsData"
            :key="tab.value"
            :value="tab.value"
            @click="activeTab = tab.value"
            :active="activeTab === tab.value"
            :prepend-icon="tab.icon"
            class="mb-2"
            :class="{ 'v-list-item--active': activeTab === tab.value }"
            rounded="lg"
          >
            <v-list-item-title>{{ tab.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-col>

      <!-- Right Content Area -->
      <v-col cols="12" md="9">
        <v-card class="pa-6" elevation="1" rounded="lg">
          <v-window v-model="activeTab">
            <!-- Wallet Code Tab -->
            <v-window-item value="wallet-code">
              <WalletCodeSettings />
            </v-window-item>

            <!-- Security Tab -->
            <!-- <v-window-item value="security">
              <WalletPinSettings />
            </v-window-item> -->
          </v-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWalletAuthStore } from '~/stores/useWalletAuthStore'
import { useWalletStore } from '~/stores/useWalletStore'
// Removed: import { useCurrencyStore } from "~/stores/useCurrencies";

const tabsData = [
  // Removed Currency Tab from tabsData
  {
    icon: 'mdi-wallet',
    title: 'Wallet Code',
    value: 'wallet-code',
  },
  // {
  //   icon: "mdi-shield-lock",
  //   title: "Security",
  //   value: "security",
  // },
]

const router = useRouter()
const walletAuthStore = useWalletAuthStore()
const walletStore = useWalletStore()
// Removed: const currencyStore = useCurrencyStore();

// Form and tab refs
const pinForm = ref<any>(null)
const activeTab = ref('wallet-code') // Changed default tab

// PIN state
const currentPin = ref('')
const newPin = ref('')
const confirmPin = ref('')
const isUpdatingPin = ref(false)
const pinError = ref('')

// PIN visibility state
const showCurrentPin = ref(false)
const showNewPin = ref(false)
const showConfirmPin = ref(false)

// Removed Currency state
// const selectedCurrencyId = ref<number | null>(null);
// const isUpdatingCurrency = ref(false);

// Computed properties
const isValidPinForm = computed(() => {
  return (
    currentPin.value &&
    newPin.value &&
    confirmPin.value &&
    newPin.value === confirmPin.value &&
    newPin.value !== currentPin.value &&
    newPin.value.length === 6
  )
})

const isChangeDisabled = computed(() => {
  return (
    !walletStore.walletData || parseFloat(walletStore.walletData?.balance) > 0
  )
})

const formatBalance = (balance: number) => {
  if (!balance || !walletStore.walletData?.currency) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: walletStore.walletData.currency.code,
  }).format(balance)
}

// PIN Methods
const handlePinUpdate = async () => {
  if (!isValidPinForm.value || !pinForm.value) return

  try {
    isUpdatingPin.value = true
    pinError.value = ''

    // First verify current PIN
    const verifyResponse = await walletAuthStore.verifyPin(currentPin.value)

    if (!verifyResponse.authorized) {
      pinError.value = 'Current PIN is incorrect'
      return
    }

    // Then update to new PIN
    await walletAuthStore.resetPin({
      current_security_pin: currentPin.value,
      new_security_pin: newPin.value,
    })

    // Reset form and visibility states
    currentPin.value = ''
    newPin.value = ''
    confirmPin.value = ''
    showCurrentPin.value = false
    showNewPin.value = false
    showConfirmPin.value = false
    pinForm.value.reset()

    // Show success message or handle success
    pinError.value = ''
  } catch (error: any) {
    pinError.value = error.message || 'Failed to update PIN'
  } finally {
    isUpdatingPin.value = false
  }
}

// Removed Currency Methods
// const handleCurrencySuccess = () => {
//   router.push("/wallet");
// };

// const handleCurrencySkip = () => {
//   router.push("/wallet");
// };

// Lifecycle hooks
onMounted(async () => {
  // Fetch initial wallet data if not available
  if (!walletStore.walletData) {
    await walletStore.fetchWallet()
  }

  // Removed: Fetch currencies if not already fetched
  // if (!currencyStore.isFetched) {
  //   await currencyStore.fetchCurrencies();
  // }

  // Removed: Set initial currency selection if wallet has a currency
  // if (walletStore.walletData?.currency) {
  //   selectedCurrencyId.value = walletStore.walletData.currency.id;
  // }
})

// Watch for tab changes
watch(activeTab, (newTab) => {
  // Reset error messages when switching tabs
  if (newTab === 'security') {
    pinError.value = ''
  }
})
</script>

<style lang="scss" scoped>
.settings-list {
  .v-list-item {
    margin-bottom: 8px;
    transition: all 0.3s ease;
    border-radius: 8px;

    &--active {
      background-color: rgb(var(--v-theme-primary));
      color: white;

      .v-list-item-title {
        font-weight: 500;
      }

      .v-icon {
        color: white;
      }
    }

    &:hover:not(.v-list-item--active) {
      background-color: rgba(var(--v-theme-primary), 0.1);
      color: rgb(var(--v-theme-primary));
    }
  }
}
</style>
