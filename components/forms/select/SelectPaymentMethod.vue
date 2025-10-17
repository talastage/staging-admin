<template>
  <v-select
    label="Choose a payment method"
    :items="paymentMethods"
    item-value="id"
    item-title="name"
    v-model="selectedPaymentMethodId"
    dense
    clearable
    placeholder="Type to search..."
    :no-data-text="'No payment methods available'"
  ></v-select>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { usePaymentMethodStore } from "@/stores/usePaymentMethodStore";

defineProps({
  modelValue: {
    type: [Number, String],
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);

const store = usePaymentMethodStore();
const selectedPaymentMethodId = ref(props.modelValue);

watch(
  selectedPaymentMethodId,
  (newValue) => {
    emit("update:modelValue", newValue);
  },
  { immediate: true }
);

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== selectedPaymentMethodId.value) {
      selectedPaymentMethodId.value = newValue;
    }
  },
  { immediate: true }
);

onMounted(async () => {
  if (!store.isFetched) {
    await store.fetchPaymentMethods();
  }
});

const paymentMethods = computed(() => store.methods);
</script>
