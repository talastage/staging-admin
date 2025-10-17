<template>
  <div>
    <v-card>
      <v-card-title>Wallet Payment Details</v-card-title>
      <v-card-text>
        <div v-if="paymentDetails.user_wallets.length">
          <div v-for="wallet in paymentDetails.user_wallets" :key="wallet.id">
            <p>{{ wallet.name }} - {{ wallet.wallet_code }}</p>
          </div>
        </div>
        <div v-if="!paymentDetails.user_wallets.length">
          <v-form @submit.prevent="submitNewWallet">
            <v-text-field label="Wallet Name" v-model="newWallet.name"></v-text-field>
            <v-text-field label="Wallet Code" v-model="newWallet.wallet_code"></v-text-field>
            <v-btn type="submit">Add Wallet</v-btn>
          </v-form>
        </div>
      </v-card-text>
    </v-card>
    <v-card>
      <v-card-title>Available Wallet Providers</v-card-title>
      <v-card-text>
        <div v-for="method in paymentDetails.country_methods" :key="method.id">
          <p>{{ method.paymentable?.name || "Unknown" }}</p>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useNuxtApp } from '#app';
import { usePaymentMethodDetails } from '@/stores/usePaymentMethodDetails';

const props = defineProps<{
  selectedCountry: any;
  methodId: number;
}>();

const paymentStore = usePaymentMethodDetails();
const paymentDetails = computed(() => paymentStore.paymentDetails[props.methodId]);

const newWallet = ref({
  name: '',
  wallet_code: '',
});

onMounted(() => {
  fetchPaymentDetails();
});

watch([props.selectedCountry, props.methodId], fetchPaymentDetails);

function fetchPaymentDetails() {
  if (!props.methodId || !props.selectedCountry.id) return;
  const { $axios } = useNuxtApp();
  $axios
    .get(`/api/payment/methods/details/${props.selectedCountry.id}/${props.methodId}`)
    .then((response) => {
      paymentStore.paymentDetails[props.methodId] = response.data;
    })
    .catch((error) => console.error('Failed to fetch payment details:', error));
}

function submitNewWallet() {
  // Logic to submit new wallet details
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
