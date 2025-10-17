<template>
  <v-card class="mb-4" elevation="10">
    <v-card-title>Fee Calculation</v-card-title>
    <v-card-text>
      <v-row v-if="gatewayFeesStore.loading">
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </v-col>
      </v-row>
      <template v-else-if="!gatewayFeesStore.error">
        <v-row>
          <v-col cols="6">Transaction Fee:</v-col>
          <v-col cols="6" class="text-right">
            {{ formattedFee }} {{ currencySymbol }}
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">Total Amount:</v-col>
          <v-col cols="6" class="text-right">
            {{ formattedTotal }} {{ currencySymbol }}
          </v-col>
        </v-row>
      </template>
      <v-row v-else>
        <v-col cols="12" class="text-center error--text">
          {{ gatewayFeesStore.error }}
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useGatewayFeesStore } from "~/stores/useGatewayFeesStore";

const props = defineProps({
  amount: { type: Number, required: true },
  selectedMethod: { type: Object, required: true },
  transactionType: { type: String, required: true },
  currencySymbol: { type: String, required: true },
});
const emit = defineEmits(["update:fee"]);

const gatewayFeesStore = useGatewayFeesStore();
const calculatedFee = ref(0);

const fetchGatewayFees = async () => {
  if (props.selectedMethod && props.amount) {
    await gatewayFeesStore.fetchFees({
      country_id: props.selectedMethod.country.id,
      gateway_id: props.selectedMethod.gateway.id,
      payment_method_id: props.selectedMethod.payment_method.id,
      transaction_type: props.transactionType,
    });

    calculatedFee.value = gatewayFeesStore.calculateFee(props.amount);
    emit("update:fee", calculatedFee.value);
  }
};

const formattedFee = computed(() => calculatedFee.value.toFixed(2));

const formattedTotal = computed(() => {
  const total =
    props.transactionType === "deposit"
      ? props.amount - calculatedFee.value
      : props.amount + calculatedFee.value;
  return total.toFixed(2);
});

watch(() => [props.amount, props.selectedMethod], fetchGatewayFees, {
  immediate: true,
});
</script>
