<!-- components/withdrawal/SelectCountryWithdrawalMethods.vue -->
<template>
  <div class="select-payment-method">
    <v-card variant="outlined" class="pa-4">
      <div class="d-flex align-center justify-space-between mb-4">
        <label class="text-subtitle-1 font-weight-medium"
          >Select Payment Method</label
        >
        <v-chip v-if="loading" size="small" color="info">
          <v-icon start icon="mdi-refresh" class="loading-icon"></v-icon>
          Loading
        </v-chip>
      </div>

      <div v-if="loading" class="d-flex align-center justify-center py-6">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <div v-else-if="withdrawalMethods.length === 0" class="text-center py-4">
        <v-icon
          icon="mdi-alert-circle-outline"
          size="large"
          color="warning"
          class="mb-2"
        />
        <p class="text-body-1">
          No withdrawal methods available for your country.
        </p>
      </div>

      <div v-else class="methods-grid">
        <v-hover
          v-for="method in withdrawalMethods"
          :key="method.id"
          v-slot="{ isHovering, props }"
        >
          <v-card
            v-bind="props"
            :class="[
              'method-card pa-3',
              selectedMethod?.id === method.id ? 'selected-card' : '',
              isHovering ? 'hovering' : '',
            ]"
            @click="handleSelection(method)"
            :elevation="
              selectedMethod?.id === method.id ? 3 : isHovering ? 2 : 0
            "
            :color="
              selectedMethod?.id === method.id ? 'primary-container' : undefined
            "
            :disabled="disabled"
          >
            <div class="d-flex align-center">
              <v-avatar size="40" class="me-3" color="surface-variant">
                <v-img v-if="method.logo_url" :src="method.logo_url" cover />
                <v-icon v-else size="24">{{
                  getMethodIcon(method.type)
                }}</v-icon>
              </v-avatar>
              <div>
                <div class="text-body-1 font-weight-medium">
                  {{ method.name }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ getMethodDescription(method.type) }}
                </div>
              </div>
              <v-spacer></v-spacer>
              <v-icon
                :color="
                  selectedMethod?.id === method.id
                    ? 'primary'
                    : 'medium-emphasis'
                "
                :icon="
                  selectedMethod?.id === method.id
                    ? 'mdi-check-circle'
                    : 'mdi-checkbox-blank-circle-outline'
                "
                size="24"
              ></v-icon>
            </div>
          </v-card>
        </v-hover>
      </div>

      <div v-if="errorMessage" class="text-error text-caption mt-2">
        {{ errorMessage }}
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface WithdrawalMethod {
  id: number
  name: string
  type: string
  logo_url: string | null
}

const props = defineProps<{
  modelValue?: WithdrawalMethod | null
  countryId: number
  errorMessage?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: WithdrawalMethod | null]
}>()

const { $axios } = useNuxtApp()
const loading = ref(false)
const withdrawalMethods = ref<WithdrawalMethod[]>([])
const selectedMethod = ref<WithdrawalMethod | null>(null)

// Fetch withdrawal methods
const fetchWithdrawalMethods = async () => {
  loading.value = true
  try {
    const { data } = await $axios.get(
      `/api/countries/${props.countryId}/withdrawal-methods`
    )
    withdrawalMethods.value = data.withdrawal_methods
  } catch (error: any) {
    console.error(
      'Error fetching withdrawal methods:',
      error.response?.data || error.message
    )
  } finally {
    loading.value = false
  }
}

// Handle selection change
const handleSelection = (method: WithdrawalMethod) => {
  if (props.disabled) return
  selectedMethod.value = method
  emit('update:modelValue', method)
}

// Get icon based on payment method type
const getMethodIcon = (type: string): string => {
  const icons: Record<string, string> = {
    card: 'mdi-credit-card',
    mobile_money: 'mdi-phone',
    bank_transfer: 'mdi-bank',
  }
  return icons[type] || 'mdi-cash'
}

// Get method description
const getMethodDescription = (type: string): string => {
  const descriptions: Record<string, string> = {
    card: 'Withdraw to your debit or credit card',
    mobile_money: 'Withdraw to your mobile money account',
    bank_transfer: 'Withdraw directly to your bank account',
  }
  return descriptions[type] || 'Withdraw your funds'
}

// Watch for country ID changes
watch(
  () => props.countryId,
  (newValue) => {
    if (newValue) {
      fetchWithdrawalMethods()
    }
  }
)

// Watch for model value changes
watch(
  () => props.modelValue,
  (newValue) => {
    selectedMethod.value = newValue
  },
  { immediate: true }
)

onMounted(() => {
  if (props.countryId) {
    fetchWithdrawalMethods()
  }
})
</script>

<style scoped>
.select-payment-method {
  margin-bottom: 16px;
}

.methods-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.method-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.method-card.hovering:not(.selected-card) {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.selected-card {
  border: 2px solid rgb(var(--v-theme-primary));
}

.loading-icon {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
