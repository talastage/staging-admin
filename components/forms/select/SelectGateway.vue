<template>
  <v-select
    label="Choose a payment gateway"
    :items="gateways"
    item-value="id"
    :item-title="itemText"
    v-model="selectedGatewayId"
    @change="emitGateway"
    dense
    clearable
    placeholder="Type to search..."
  ></v-select>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useGatewayStore } from "@/stores/useGatewayStore";

const emit = defineEmits(["update:gateway"]);
const store = useGatewayStore();
const selectedGatewayId = ref(null);

onMounted(async () => {
  if (!store.isFetched) {
    await store.fetchGateways();
  }
});

const itemText = (item) => `${item.name}`; // If you want to format the item text differently, you can adjust this function

const gateways = computed(() => {
  return store.gateways.map((gateway) => ({
    id: gateway.id,
    name: gateway.name,
  }));
});

// Emit the gateway change event to the parent component
const emitGateway = (newVal) => {
  emit("update:gateway", newVal);
};
</script>
