<template>
  <div>
    <v-card>
      <v-card-title>Apple Pay Details</v-card-title>
      <v-card-text>
        <div v-if="paymentDetails.user_apple_pay.length">
          <div v-for="applePay in paymentDetails.user_apple_pay" :key="applePay.id">
            <p>{{ applePay.name }} - {{ applePay.details }}</p>
          </div>
        </div>
        <div v-if="!paymentDetails.user_apple_pay.length">
          <v-form @submit.prevent="submitNewApplePay">
            <v-text-field label="Apple Pay Name" v-model="newApplePay.name"></v-text-field>
            <v-text-field label="Apple Pay Details" v-model="newApplePay.details"></v-text-field>
            <v-btn type="submit">Add Apple Pay</v-btn>
          </v-form>
        </div>
      </v-card-text>
    </v-card>
    <v-card>
      <v-card-title>Available Apple Pay Providers</v-card-title>
      <v-card-text>
        <div v-for="method in paymentDetails.country_methods" :key="method.id">
          <p>{{ method.paymentable?.name || "Unknown" }}</p>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useNuxtApp } from "#app";

const props = defineProps({
  selectedCountry: {
    type: Object,
    required: true,
  },
  methodId: {
    type: Number,
    required: true,
  },
});

const paymentDetails = ref({
  user_apple_pay: [],
  country_methods: [],
});

const newApplePay = ref({
  name: '',
  details: '',
});

const { $axios } = useNuxtApp();

watch([props.selectedCountry, props.methodId], fetchPaymentDetails);

function fetchPaymentDetails() {
  if (!props.methodId || !props.selectedCountry.id) return;

  $axios
    .get(`/api/payment/methods/details/${props.selectedCountry.id}/${props.methodId}`)
    .then((response) => {
      paymentDetails.value = response.data;
    })
    .catch((error) => console.error("Failed to fetch payment details:", error));
}

function submitNewApplePay() {
  // Logic to submit new Apple Pay details
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
