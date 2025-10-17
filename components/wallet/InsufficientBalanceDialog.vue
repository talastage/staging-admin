<template>
  <v-dialog v-model="dialogModel" max-width="400px">
    <v-card class="rounded-lg">
      <v-card-title
        class="headline d-flex justify-space-between align-center pa-4"
      >
        Insufficient Balance
        <v-btn icon @click="closeDialog" class="ml-2">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pa-0">
        <div class="alert-message warning pa-4 mb-4">
          <v-icon color="warning" class="mr-2">mdi-alert</v-icon>
          <span>Your current balance is insufficient for this amount.</span>
        </div>
        <v-list class="pa-4 bg-transparent">
          <v-list-item
            v-for="(item, index) in balanceInfo"
            :key="index"
            class="px-0"
          >
            <v-list-item-title class="text-body-2 text-grey-darken-1">
              {{ item.label }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-h6 font-weight-medium">
              {{ item.value }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-btn
          color="primary"
          block
          height="48"
          class="text-button"
          @click="handleDeposit"
        >
          <v-icon left>mdi-cash-plus</v-icon>
          Deposit Funds
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  walletBalance: {
    type: Number,
    required: true,
  },
  requiredAmount: {
    type: Number,
    required: true,
  },
  currencyFormatter: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "deposit"]);

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const balanceInfo = computed(() => [
  {
    label: "Wallet Balance:",
    value: props.currencyFormatter(props.walletBalance),
  },
  {
    label: "Required Amount:",
    value: props.currencyFormatter(props.requiredAmount),
  },
  {
    label: "Additional Funds Needed:",
    value: props.currencyFormatter(
      Math.max(props.requiredAmount - props.walletBalance, 0)
    ),
  },
]);

const closeDialog = () => {
  dialogModel.value = false;
};

const handleDeposit = () => {
  closeDialog();
  emit("deposit");
};
</script>

<style scoped>
.v-list-item__subtitle {
  margin-top: 4px;
}

.alert-message {
  display: flex;
  align-items: center;
  border-radius: 4px;
  font-weight: 500;
}

.alert-message.warning {
  background-color: #fff3e0;
  color: #e65100;
}
</style>
