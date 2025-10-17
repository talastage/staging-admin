<!-- components/page/edit/EditInvestmentDialog.vue -->
<template>
  <BaseDialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="Investment Settings"
    max-width="600px"
    persistent
  >
    <template #title>
      <div class="d-flex align-center">
        <span>Maximum Investment Amount</span>
        <v-chip
          v-if="localSettings.max_investment_amount"
          class="ml-4"
          :color="isValidAmount ? 'success' : 'warning'"
          size="small"
        >
          {{ formatCurrency(Number(localSettings.max_investment_amount)) }}
        </v-chip>
      </div>
    </template>

    <v-alert
      v-if="Object.keys(apiErrors).length > 0"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      <ul class="ps-4">
        <li v-for="(errors, field) in apiErrors" :key="field">
          {{ Array.isArray(errors) ? errors.join(', ') : errors }}
        </li>
      </ul>
    </v-alert>

    <v-sheet class="pa-4" rounded border>
      <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSave">
        <v-row>
          <v-col cols="12">
            <div class="text-subtitle-2 mb-2">Set Your Investment Limit</div>
            <CurrencyInput
              v-model="localSettings.max_investment_amount"
              label="Maximum Project Budget"
              :currency-symbol="localSettings.currency?.symbol"
              :currency-code="localSettings.currency?.code"
              :prefix-symbol="true"
              :rules="amountRules"
              :error-messages="apiErrors.max_investment_amount"
              :min="0"
              required
              hide-details="auto"
              variant="outlined"
              density="comfortable"
            />
            <div class="text-caption text-grey mt-2">
              Projects with budgets exceeding this amount won't appear in your
              investment opportunities. This helps match you with projects
              within your investment range.
            </div>
          </v-col>
        </v-row>
      </v-form>
    </v-sheet>

    <template #actions>
      <v-spacer></v-spacer>
      <v-btn
        color="grey-darken-1"
        variant="text"
        @click="handleClose"
        :disabled="loading"
      >
        Cancel
      </v-btn>
      <v-btn
        color="primary"
        @click="handleSave"
        :disabled="!isFormValid || loading"
        :loading="loading"
      >
        Save Settings
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, reactive } from 'vue'
import BaseDialog from '~/components/dialogs/BaseDialog.vue'
import CurrencyInput from '~/components/common/CurrencyInput.vue'
import type { VForm } from 'vuetify/components'

interface Currency {
  id: number
  name: string
  code: string
  symbol: string
}

interface PageInvestmentSettings {
  id?: number
  page_id: number
  max_investment_amount: string | number
  currency_id: number
  currency?: Currency
}

interface InvestmentSettingsPayload {
  max_investment_amount: string
}

const props = defineProps<{
  modelValue: boolean
  settings: PageInvestmentSettings
  errors?: Record<string, string[]>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [settingsPayload: InvestmentSettingsPayload]
  close: []
}>()

const formRef = ref<InstanceType<typeof VForm> | null>(null)
const isFormValid = ref(false)
const loading = ref(false)

const localSettings = reactive<PageInvestmentSettings>({
  ...props.settings,
  max_investment_amount: props.settings.max_investment_amount
    ? Number(props.settings.max_investment_amount)
    : 0,
})

// Validation rules
const amountRules = [
  (v: number | null) => (v !== null && v !== undefined) || 'Amount is required',
  (v: number | null) =>
    v === null || v >= 0 || 'Amount must be zero or positive',
]

// Computed properties
const apiErrors = computed(() => props.errors || {})

const isValidAmount = computed(() => {
  const amount = Number(localSettings.max_investment_amount)
  return !isNaN(amount) && amount >= 0
})

// Format currency for display
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: localSettings.currency?.code || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Watchers
watch(
  () => props.settings,
  (newVal) => {
    Object.assign(localSettings, {
      ...newVal,
      max_investment_amount: newVal.max_investment_amount
        ? Number(newVal.max_investment_amount)
        : 0,
    })
    formRef.value?.resetValidation()
    isFormValid.value = false
  },
  { deep: true }
)

watch(
  () => props.errors,
  (newErrors) => {
    if (newErrors && Object.keys(newErrors).length > 0) {
      isFormValid.value = false
      formRef.value?.validate()
    }
  },
  { deep: true }
)

watch(
  () => props.modelValue,
  (isVisible) => {
    if (!isVisible) {
      loading.value = false
    }
  }
)

// Methods
const handleClose = () => {
  emit('close')
  Object.assign(localSettings, {
    ...props.settings,
    max_investment_amount: props.settings.max_investment_amount
      ? Number(props.settings.max_investment_amount)
      : 0,
  })
  formRef.value?.resetValidation()
  isFormValid.value = false
}

const handleSave = async () => {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()
  isFormValid.value = valid

  if (valid) {
    loading.value = true
    try {
      const payload: InvestmentSettingsPayload = {
        max_investment_amount: String(
          localSettings.max_investment_amount ?? '0'
        ),
      }
      emit('save', payload)
    } finally {
      // Loading state handled by dialog visibility watcher
    }
  }
}
</script>

<style scoped>
.v-sheet {
  transition: all 0.3s ease;
}

.v-form :deep(.v-input) {
  transition: all 0.2s ease;
}
</style>
