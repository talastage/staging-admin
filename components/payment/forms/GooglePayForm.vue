<template>
  <div>
    <v-card>
      <v-card-text>
        <div v-if="paymentDetails">
          <div v-for="method in paymentDetails.country_methods" :key="method.id">
            <v-avatar left>
              <v-img :src="method.paymentable.logo"></v-img>
            </v-avatar>
            {{ method.paymentable.name }}
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useNuxtApp } from '#app';

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

const paymentDetails = ref(null);

function fetchPaymentDetails() {
  if (!props.methodId || !props.selectedCountry.id) return;
  const { $axios } = useNuxtApp();
  $axios
    .get(`/api/payment/methods/details/${props.selectedCountry.id}/${props.methodId}`)
    .then((response) => {
      paymentDetails.value = response.data;
    })
    .catch((error) => console.error('Failed to fetch payment details:', error));
}

onMounted(fetchPaymentDetails);
watch(() => [props.methodId, props.selectedCountry.id], fetchPaymentDetails);
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
