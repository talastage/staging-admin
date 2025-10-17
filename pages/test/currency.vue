<!-- pages/test/wallet-currency-selector.vue or components/test/WalletCurrencySelectorTest.vue -->
<template>
  <div class="test-container">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <v-card class="mb-6">
            <v-card-title>
              <h1 class="text-h4">WalletCurrencySelector Test</h1>
            </v-card-title>
            <v-card-text>
              <p class="text-body-1 mb-4">
                This is a test page for the WalletCurrencySelector component
                with demo data.
              </p>

              <!-- Test Controls -->
              <v-row class="mb-4">
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="testWalletId"
                    label="Wallet ID"
                    type="number"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="preselectedCurrencyId"
                    label="Preselected Currency ID"
                    type="number"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
              </v-row>

              <v-row class="mb-4">
                <v-col cols="12">
                  <v-switch
                    v-model="allowSkip"
                    label="Allow Skip"
                    color="primary"
                  />
                </v-col>
              </v-row>

              <v-btn @click="resetComponent" color="secondary" class="mb-4">
                Reset Component
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Component Under Test -->
          <WalletCurrencySelector
            v-if="showComponent"
            :wallet-id="testWalletId"
            :allow-skip="allowSkip"
            :preselected-currency-id="preselectedCurrencyId"
            @success="handleSuccess"
            @skip="handleSkip"
            @error="handleError"
          />

          <!-- Event Log -->
          <v-card class="mt-6" v-if="events.length > 0">
            <v-card-title>Event Log</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-for="(event, index) in events"
                  :key="index"
                  :title="event.type"
                  :subtitle="event.timestamp"
                >
                  <template v-slot:append>
                    <v-chip
                      :color="getEventColor(event.type)"
                      size="small"
                      variant="flat"
                    >
                      {{ event.type }}
                    </v-chip>
                  </template>
                  <v-list-item-subtitle class="mt-2">
                    <pre class="text-caption">{{
                      JSON.stringify(event.data, null, 2)
                    }}</pre>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <v-btn
                @click="clearEvents"
                size="small"
                variant="text"
                class="mt-2"
              >
                Clear Events
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'

// Mock stores for testing
const mockWalletStore = {
  wallet: {
    id: 123,
    name: 'Test Wallet',
    currency_id: 1,
  },
}

const mockActivationStore = {
  walletId: 456,
  activationStatus: {
    wallet: {
      id: 789,
      status: 'pending',
    },
  },
}

// Mock currencies data
const mockCurrencies = [
  {
    id: 1,
    name: 'United States Dollar',
    code: 'USD',
    symbol: '$',
    slug: 'usd',
    is_default: true,
    is_active: true,
    supported: true,
    display_text: '🇺🇸 USD - United States Dollar ($)',
    country_flag: '🇺🇸',
    country_name: 'United States',
  },
  {
    id: 2,
    name: 'British Pound Sterling',
    code: 'GBP',
    symbol: '£',
    slug: 'gbp',
    is_default: false,
    is_active: true,
    supported: true,
    display_text: '🇬🇧 GBP - British Pound Sterling (£)',
    country_flag: '🇬🇧',
    country_name: 'United Kingdom',
  },
  {
    id: 3,
    name: 'Canadian Dollar',
    code: 'CAD',
    symbol: '$',
    slug: 'cad',
    is_default: false,
    is_active: true,
    supported: true,
    display_text: '🇨🇦 CAD - Canadian Dollar ($)',
    country_flag: '🇨🇦',
    country_name: 'Canada',
  },
  {
    id: 4,
    name: 'Euro',
    code: 'EUR',
    symbol: '€',
    slug: 'eur',
    is_default: false,
    is_active: true,
    supported: true,
    display_text: '🇪🇺 EUR - Euro (€)',
    country_flag: '🇪🇺',
    country_name: 'European Union',
  },
]

// Mock axios for API calls
const mockAxios = {
  get: async (url: string) => {
    console.log('Mock GET:', url)
    if (url === '/api/wallet') {
      return {
        data: {
          data: { id: 999, name: 'API Fetched Wallet' },
        },
      }
    }
    if (url.includes('/api/currencies')) {
      return {
        data: {
          data: mockCurrencies,
        },
      }
    }
    return { data: {} }
  },
  post: async (url: string, data: any) => {
    console.log('Mock POST:', url, data)
    if (url === '/api/wallet/activation/complete') {
      return {
        data: {
          success: true,
          message: 'Wallet activated successfully',
          wallet: { id: 123, currency_id: data.currency_id },
        },
      }
    }
    return { data: { success: true } }
  },
}

// Mock Nuxt composables
const mockNuxtApp = () => ({
  $axios: mockAxios,
})

// Mock useCurrencies composable
const mockUseCurrencies = () => ({
  currencies: ref(mockCurrencies),
  userCurrency: ref(mockCurrencies[0]), // Default to USD
  isLoading: ref(false),
  error: ref(null),
  fetchCurrencies: async () => {
    console.log('Mock fetchCurrencies called')
    return mockCurrencies
  },
})

// Provide mocks
provide('useNuxtApp', mockNuxtApp)
provide('useCurrencies', mockUseCurrencies)

// Test component state
const testWalletId = ref(123)
const allowSkip = ref(true)
const preselectedCurrencyId = ref(null)
const showComponent = ref(true)
const events = ref([])

// Event handlers
const handleSuccess = (data: any) => {
  addEvent('success', data)
}

const handleSkip = (data: any) => {
  addEvent('skip', data)
}

const handleError = (error: any) => {
  addEvent('error', error)
}

const addEvent = (type: string, data: any) => {
  events.value.unshift({
    type,
    data,
    timestamp: new Date().toLocaleTimeString(),
  })
}

const getEventColor = (eventType: string) => {
  switch (eventType) {
    case 'success':
      return 'success'
    case 'error':
      return 'error'
    case 'skip':
      return 'warning'
    default:
      return 'primary'
  }
}

const clearEvents = () => {
  events.value = []
}

const resetComponent = () => {
  showComponent.value = false
  nextTick(() => {
    showComponent.value = true
  })
}
</script>

<style scoped>
.test-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem 0;
}

pre {
  font-family: 'Courier New', monospace;
  background-color: #f8f9fa;
  padding: 0.5rem;
  border-radius: 0.25rem;
  max-width: 100%;
  overflow-x: auto;
}
</style>
