<!-- components/payment/CardPaymentForm.vue -->
<template>
  <div class="card-payment-form">
    <!-- Gateway-specific implementations -->
    <template v-if="gateway.slug === 'flutterwave'">
      <div class="text-subtitle-1 mb-4">
        You'll be redirected to a secure payment page
      </div>
      <!-- Optional: Show card types accepted -->
      <!-- <div class="d-flex gap-2 mb-4">
        <v-img
          v-for="card in ['visa', 'mastercard', 'verve']"
          :key="card"
          :src="`/images/cards/${card}.png`"
          width="40"
          height="25"
          contain
        />
      </div> -->
    </template>

    <!-- For gateways that support direct card input -->
    <template v-else>
      <v-form ref="form" @submit.prevent>
        <!-- Card Number -->
        <v-text-field
          v-model="cardNumber"
          label="Card Number"
          :rules="[rules.required, rules.cardNumber]"
          placeholder="1234 5678 9012 3456"
          @input="formatCardNumber"
          @keypress="onlyNumbers"
          maxlength="19"
          class="mb-4"
        />

        <v-row>
          <!-- Expiry Date -->
          <v-col cols="6">
            <v-text-field
              v-model="expiryDate"
              label="Expiry Date"
              :rules="[rules.required, rules.expiryDate]"
              placeholder="MM/YY"
              @input="formatExpiryDate"
              @keypress="onlyNumbers"
              maxlength="5"
            />
          </v-col>

          <!-- CVV -->
          <v-col cols="6">
            <v-text-field
              v-model="cvv"
              label="CVV"
              :rules="[rules.required, rules.cvv]"
              placeholder="123"
              @keypress="onlyNumbers"
              maxlength="4"
              type="password"
            />
          </v-col>
        </v-row>

        <!-- Card Holder Name -->
        <v-text-field
          v-model="cardHolder"
          label="Card Holder Name"
          :rules="[rules.required]"
          placeholder="JOHN DOE"
          class="mb-4"
          @input="formatCardHolder"
        />
      </v-form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Gateway {
  id: number
  name: string
  slug: string
  logo: string | null
}

const props = defineProps<{
  gateway: Gateway
}>()

const emit = defineEmits(['validate'])

// Form refs and data
const form = ref<any>(null)
const cardNumber = ref('')
const expiryDate = ref('')
const cvv = ref('')
const cardHolder = ref('')

// Validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
  cardNumber: (v: string) => {
    const cleaned = v.replace(/\s/g, '')
    return /^[0-9]{16}$/.test(cleaned) || 'Invalid card number'
  },
  expiryDate: (v: string) => {
    if (!v) return 'Required'
    const [month, year] = v.split('/')
    const currentYear = new Date().getFullYear() % 100
    const currentMonth = new Date().getMonth() + 1

    if (!/^\d{2}\/\d{2}$/.test(v)) return 'Invalid format (MM/YY)'
    if (parseInt(month) < 1 || parseInt(month) > 12) return 'Invalid month'
    if (parseInt(year) < currentYear) return 'Card expired'
    if (parseInt(year) === currentYear && parseInt(month) < currentMonth)
      return 'Card expired'

    return true
  },
  cvv: (v: string) => /^[0-9]{3,4}$/.test(v) || 'Invalid CVV',
}

// Input formatters
function formatCardNumber(e: Event) {
  const input = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  const formatted = input.match(/.{1,4}/g)?.join(' ') || ''
  cardNumber.value = formatted.substring(0, 19)
  validate()
}

function formatExpiryDate(e: Event) {
  const input = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  if (input.length >= 2) {
    expiryDate.value = `${input.substring(0, 2)}/${input.substring(2, 4)}`
  } else {
    expiryDate.value = input
  }
  validate()
}

function formatCardHolder(e: Event) {
  cardHolder.value = (e.target as HTMLInputElement).value.toUpperCase()
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
        card_number: cardNumber.value.replace(/\s/g, ''),
        expiry_month: expiryDate.value.split('/')[0],
        expiry_year: `20${expiryDate.value.split('/')[1]}`,
        cvv: cvv.value,
        card_holder: cardHolder.value,
      },
    })
  } else {
    emit('validate', { valid: false, data: null })
  }
}

// Watch for changes in gateway
watch(
  () => props.gateway,
  () => {
    if (props.gateway.slug === 'flutterwave') {
      // For redirect-based gateways, we validate immediately
      emit('validate', { valid: true, data: null })
    } else {
      validate()
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.card-payment-form {
  max-width: 400px;
  margin: 0 auto;
}
</style>
