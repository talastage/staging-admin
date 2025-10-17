<!-- components/payment/BankTransferForm.vue -->
<template>
  <div class="bank-transfer-form">
    <v-alert
      type="info"
      class="mb-4"
      border="left"
      colored-border
      elevation="2"
    >
      <div class="text-subtitle-1 mb-2">Bank Details</div>
      <div class="text-body-2">
        <strong>Bank Name:</strong> {{ bank.name }}<br />
        <strong>Bank Code:</strong> {{ bank.bank_code }}<br />
        <template v-if="bank.swift_code">
          <strong>SWIFT Code:</strong> {{ bank.swift_code }}
        </template>
      </div>
    </v-alert>

    <v-form ref="form" @submit.prevent>
      <!-- Account Number -->
      <v-text-field
        v-model="accountNumber"
        label="Account Number"
        :rules="[rules.required, rules.accountNumber]"
        placeholder="Enter your account number"
        @keypress="onlyNumbers"
        maxlength="20"
        class="mb-4"
      />

      <!-- Account Name -->
      <v-text-field
        v-model="accountName"
        label="Account Name"
        :rules="[rules.required]"
        placeholder="Enter account holder name"
        class="mb-4"
        @input="formatAccountName"
      />

      <!-- Optional: Branch Code/Sort Code if required -->
      <v-text-field
        v-if="bank.requires_branch_code"
        v-model="branchCode"
        label="Branch Code"
        :rules="[rules.required]"
        placeholder="Enter branch code"
        class="mb-4"
      />
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Bank {
  id: number
  name: string
  value: string
  country_id: number
  currency_id: number
  bank_code: string
  swift_code: string | null
  logo_url: string | null
  requires_branch_code?: boolean
}

const props = defineProps<{
  bank: Bank
}>()

const emit = defineEmits(['validate'])

// Form refs and data
const form = ref<any>(null)
const accountNumber = ref('')
const accountName = ref('')
const branchCode = ref('')

// Validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
  accountNumber: (v: string) => {
    // Adjust the regex based on the specific bank's account number format
    return /^\d{8,20}$/.test(v) || 'Invalid account number'
  },
}

// Input formatters
function formatAccountName(e: Event) {
  accountName.value = (e.target as HTMLInputElement).value.toUpperCase()
  validate()
}

function onlyNumbers(e: KeyboardEvent) {
  if (!/[\d]/.test(e.key)) {
    e.preventDefault()
  }
}

// Validation
function validate() {
  if (!form.value) return

  const isValid = form.value.validate()

  if (isValid) {
    emit('validate', {
      valid: true,
      data: {
        account_number: accountNumber.value,
        account_name: accountName.value,
        branch_code: branchCode.value || undefined,
        bank_id: props.bank.id,
      },
    })
  } else {
    emit('validate', { valid: false, data: null })
  }
}

// Watch for form changes
watch([accountNumber, accountName, branchCode], () => validate(), {
  deep: true,
})
</script>

<style lang="scss" scoped>
.bank-transfer-form {
  max-width: 400px;
  margin: 0 auto;
}
</style>
