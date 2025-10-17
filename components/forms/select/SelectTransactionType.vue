<template>
  <v-select
    label="Choose a transaction type"
    :items="transactionTypes"
    item-value="id"
    item-title="name"
    v-model="selectedTransactionType"
    @change="emitTransactionType"
    dense
    clearable
    placeholder="Type to search..."
  />
</template>

<script lang="ts" setup>
import { useTransactionTypeStore } from "@/stores/useTransactionTypeStore";

const store = useTransactionTypeStore();
const selectedTransactionType = ref<TransactionType | null>(null);

const transactionTypes = computed(() =>
  store.transactionTypes.filter((type) => type.active)
);

onMounted(async () => {
  if (!store.isFetched) {
    await store.fetchTransactionTypes();
  }
});

const emit = defineEmits(["update:transactionType"]);

// Emit the entire selected transaction type object since `return-object` is true
const emitTransactionType = (newType: TransactionType | null) => {
  emit("update:transactionType", newType);
};
</script>
