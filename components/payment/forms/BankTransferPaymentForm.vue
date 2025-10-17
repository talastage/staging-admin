<template>
  <div>
    <h3>Bank Transfer Payment Details</h3>
    <div v-if="paymentDetails">
      <div
        v-for="bankAccount in paymentDetails.user_bank_accounts"
        :key="bankAccount.id"
      >
        <p>Account Holder: {{ bankAccount.account_holder_name }}</p>
        <p>Account Number: {{ bankAccount.account_number }}</p>
      </div>
      <div v-if="paymentDetails.country_methods.length">
        <h4>Available Bank Providers</h4>
        <div v-for="method in paymentDetails.country_methods" :key="method.id">
          <p>{{ method.paymentable.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useNuxtApp } from "#app";
import { usePaymentMethodDetails } from "@/stores/usePaymentMethodDetails";

const props = defineProps<{
  selectedCountry: any;
  methodId: number;
}>();

const paymentStore = usePaymentMethodDetails();
const paymentDetails = computed(
  () => paymentStore.paymentDetails[props.methodId]
);

onMounted(() => {
  fetchPaymentDetails();
});

watch([props.selectedCountry, props.methodId], fetchPaymentDetails);

function fetchPaymentDetails() {
  if (!props.methodId || !props.selectedCountry.id) return;
  const { $axios } = useNuxtApp();
  $axios
    .get(
      `/api/payment/methods/details/${props.selectedCountry.id}/${props.methodId}`
    )
    .then((response) => {
      paymentStore.paymentDetails[props.methodId] = response.data;
    })
    .catch((error) => console.error("Failed to fetch payment details:", error));
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
