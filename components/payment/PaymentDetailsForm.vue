<template>
  <v-form ref="form">
    <!-- Mobile Money Fields -->
    <template v-if="paymentMethodType === 'mobile_money'">
      <v-text-field
        v-model="formData.phone_number"
        :label="`${paymentMethodName} Number`"
        :prefix="paymentable?.phone_number_prefix || ''"
        :rules="phoneRules"
        required
      ></v-text-field>
    </template>

    <!-- Bank Transfer Fields -->
    <template v-if="paymentMethodType === 'bank_transfer'">
      <v-text-field
        v-model="formData.account_name"
        label="Account Name"
        :rules="bankRules.accountName"
        required
      ></v-text-field>
      <v-text-field
        v-model="formData.account_number"
        label="Account Number"
        :rules="bankRules.accountNumber"
        required
      ></v-text-field>
    </template>

    <!-- Card Fields -->
    <template v-if="paymentMethodType === 'card'">
      <v-text-field
        v-model="formData.card_number"
        label="Card Number"
        :rules="cardRules.number"
        required
      ></v-text-field>
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="formData.expiry_date"
            label="Expiry Date (MM/YY)"
            :rules="cardRules.expiry"
            required
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="formData.cvv"
            label="CVV"
            :rules="cardRules.cvv"
            type="password"
            required
          ></v-text-field>
        </v-col>
      </v-row>
    </template>
  </v-form>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  paymentMethodType: {
    type: String,
    required: true,
  },
  paymentMethodName: {
    type: String,
    required: true,
  },
  paymentable: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:paymentDetails"]);

const formData = ref({});

// Validation Rules
const phoneRules = [
  (v) => !!v || "Phone number is required",
  (v) => /^\d{9,12}$/.test(v) || "Invalid phone number format",
];

const bankRules = {
  accountName: [
    (v) => !!v || "Account name is required",
    (v) => v.length >= 3 || "Account name must be at least 3 characters",
  ],
  accountNumber: [
    (v) => !!v || "Account number is required",
    (v) => /^\d{8,20}$/.test(v) || "Invalid account number format",
  ],
};

const cardRules = {
  number: [
    (v) => !!v || "Card number is required",
    (v) => /^\d{16}$/.test(v.replace(/\s/g, "")) || "Invalid card number",
  ],
  expiry: [
    (v) => !!v || "Expiry date is required",
    (v) =>
      /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(v) || "Invalid expiry date (MM/YY)",
  ],
  cvv: [
    (v) => !!v || "CVV is required",
    (v) => /^\d{3,4}$/.test(v) || "Invalid CVV",
  ],
};

// Watch for changes and emit updates
watch(
  formData,
  (newValue) => {
    emit("update:paymentDetails", newValue);
  },
  { deep: true }
);

// Reset form when payment method changes
watch(
  () => props.paymentMethodType,
  () => {
    formData.value = {};
  }
);
</script>
