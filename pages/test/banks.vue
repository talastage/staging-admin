<!-- pages/test/TestSelectBank.vue or components/test/TestSelectBank.vue -->
<template>
  <v-container class="pa-6">
    <v-row>
      <v-col cols="12">
        <h2 class="text-h4 mb-6">SelectBank Component Tests</h2>
      </v-col>
    </v-row>

    <!-- Test 1: Basic Usage with Composable -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="pa-4 mb-4">
          <v-card-title class="text-h6"
            >Test 1: Basic Usage (with useBanks composable)</v-card-title
          >
          <v-card-text>
            <SelectBank
              v-model="selectedBank1"
              label="Select Bank (Composable)"
              placeholder="Search banks..."
              @search="handleSearch"
              @error="handleError"
            />

            <v-alert
              v-if="selectedBank1"
              type="success"
              class="mt-4"
              variant="tonal"
            >
              <strong>Selected Bank:</strong><br />
              ID: {{ selectedBank1.id }}<br />
              Name: {{ selectedBank1.name }}<br />
              <span v-if="selectedBank1.logo_url"
                >Logo: {{ selectedBank1.logo_url }}</span
              >
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Test 2: With Props Data -->
      <v-col cols="12" md="6">
        <v-card class="pa-4 mb-4">
          <v-card-title class="text-h6">Test 2: With Banks Prop</v-card-title>
          <v-card-text>
            <SelectBank
              v-model="selectedBank2"
              :banks="mockBanks"
              label="Select Bank (Props)"
              placeholder="Search from mock data..."
              :load-on-mount="false"
            />

            <v-alert
              v-if="selectedBank2"
              type="info"
              class="mt-4"
              variant="tonal"
            >
              <strong>Selected Bank:</strong><br />
              ID: {{ selectedBank2.id }}<br />
              Name: {{ selectedBank2.name }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Test 3: With Country Filter -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="pa-4 mb-4">
          <v-card-title class="text-h6"
            >Test 3: With Country Filter</v-card-title
          >
          <v-card-text>
            <v-select
              v-model="selectedCountry"
              :items="countries"
              item-title="name"
              item-value="id"
              label="Select Country First"
              class="mb-4"
            />

            <SelectBank
              v-model="selectedBank3"
              :country-id="selectedCountry"
              label="Select Bank (Filtered by Country)"
              placeholder="Banks will be filtered by country..."
              :disabled="!selectedCountry"
            />

            <v-alert
              v-if="selectedBank3"
              type="warning"
              class="mt-4"
              variant="tonal"
            >
              <strong>Selected Bank:</strong> {{ selectedBank3.name }}<br />
              <strong>Country ID:</strong> {{ selectedCountry }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Test 4: Disabled State -->
      <v-col cols="12" md="6">
        <v-card class="pa-4 mb-4">
          <v-card-title class="text-h6">Test 4: Disabled State</v-card-title>
          <v-card-text>
            <v-switch
              v-model="isDisabled"
              label="Disable SelectBank"
              class="mb-4"
            />

            <SelectBank
              v-model="selectedBank4"
              :disabled="isDisabled"
              label="Select Bank (Can be disabled)"
              hint="Toggle the switch above to enable/disable"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Test 5: Custom Styling and Error Handling -->
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4 mb-4">
          <v-card-title class="text-h6"
            >Test 5: Error Handling & Custom Props</v-card-title
          >
          <v-card-text>
            <v-btn
              @click="simulateError"
              color="error"
              variant="outlined"
              class="mb-4"
            >
              Simulate Error
            </v-btn>

            <SelectBank
              v-model="selectedBank5"
              label="Bank with Error Handling"
              :error-message="errorMessage"
              hint="This demonstrates error state handling"
              :search-delay="500"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Debug Information -->
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4">
          <v-card-title class="text-h6">Debug Information</v-card-title>
          <v-card-text>
            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-title
                  >Selected Banks Data</v-expansion-panel-title
                >
                <v-expansion-panel-text>
                  <pre class="text-caption">{{
                    JSON.stringify(
                      {
                        selectedBank1,
                        selectedBank2,
                        selectedBank3,
                        selectedBank4,
                        selectedBank5,
                      },
                      null,
                      2
                    )
                  }}</pre>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title
                  >Mock Banks Data</v-expansion-panel-title
                >
                <v-expansion-panel-text>
                  <pre class="text-caption">{{
                    JSON.stringify(mockBanks, null, 2)
                  }}</pre>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SelectBank from '@/components/forms/select/SelectBank.vue'

interface Bank {
  id: number
  name: string
  logo_url?: string
}

// Test data
const selectedBank1 = ref<Bank | null>(null)
const selectedBank2 = ref<Bank | null>(null)
const selectedBank3 = ref<Bank | null>(null)
const selectedBank4 = ref<Bank | null>(null)
const selectedBank5 = ref<Bank | null>(null)

const selectedCountry = ref<number | null>(null)
const isDisabled = ref(false)
const errorMessage = ref('')

// Mock data for testing props
const mockBanks = ref<Bank[]>([
  {
    id: 1,
    name: 'Agaseke Bank',
    logo_url: 'https://example.com/agaseke-logo.png',
  },
  {
    id: 2,
    name: 'Ecobank Rwanda',
    logo_url: 'https://example.com/ecobank-logo.png',
  },
  {
    id: 3,
    name: 'Bank of Kigali',
    logo_url: 'https://example.com/bok-logo.png',
  },
  {
    id: 4,
    name: 'Banque Nationale du Rwanda',
    logo_url: 'https://example.com/bnr-logo.png',
  },
  {
    id: 5,
    name: 'GT Bank Rwanda',
    logo_url: 'https://example.com/gtbank-logo.png',
  },
])

const countries = ref([
  { id: 24, name: 'Rwanda' },
  { id: 25, name: 'Kenya' },
  { id: 26, name: 'Uganda' },
  { id: 27, name: 'Tanzania' },
])

// Event handlers
const handleSearch = (query: string) => {
  console.log('Search query:', query)
}

const handleError = (error: string) => {
  console.error('SelectBank error:', error)
  // You could show a snackbar or other notification here
}

const simulateError = () => {
  errorMessage.value = 'This is a simulated error message'
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

// Set page title
useHead({
  title: 'SelectBank Component Test',
})
</script>

<style scoped>
pre {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
</style>
