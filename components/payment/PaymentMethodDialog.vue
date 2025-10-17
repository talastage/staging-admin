<template>
  <BaseDialog
    :model-value="visible"
    @update:model-value="updateVisibility"
    :title="getDialogTitle"
  >
    <component
      :is="getPaymentMethodComponent"
      :method="method"
      :amount="amount"
      :currency="currency"
      @submit="handleSubmit"
      @cancel="closeDialog"
    />
  </BaseDialog>
</template>

<script setup>
import { computed } from "vue";
import { useTransactionManagerStore } from "@/stores/useTransactionManagerStore";
import MobileMoneyForm from "./forms/MobileMoneyForm.vue";
import CardPaymentForm from "./forms/CardPaymentForm.vue";
import BankTransferPaymentForm from "./forms/BankTransferPaymentForm.vue";

const props = defineProps({
  method: {
    type: Object,
    required: true,
  },
  visible: {
    type: Boolean,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "submit", "update:visible"]);

const transactionManagerStore = useTransactionManagerStore();

const closeDialog = () => {
  emit("close");
  emit("update:visible", false);
};

const updateVisibility = (value) => {
  emit("update:visible", value);
};

const handleSubmit = async (paymentDetails) => {
  try {
    transactionManagerStore.setAmount(props.amount);
    transactionManagerStore.setCurrency(props.currency.id);
    transactionManagerStore.setAction(props.action);
    transactionManagerStore.setPaymentDetails(paymentDetails);

    await transactionManagerStore.transact();
    emit("submit", paymentDetails);
    closeDialog();
  } catch (error) {
    console.error("Transaction failed:", error);
    // Handle error (e.g., show error message)
  }
};

const getDialogTitle = computed(() => {
  switch (props.method.payment_method.type) {
    case "mobile_money":
      return `Enter ${props.method.gateway.name} Number`;
    case "card":
      return "Enter Card Details";
    case "bank_transfer":
      return "Enter Bank Transfer Details";
    default:
      return "Enter Payment Details";
  }
});

const getPaymentMethodComponent = computed(() => {
  switch (props.method.payment_method.type) {
    case "mobile_money":
      return MobileMoneyForm;
    case "card":
      return CardForm;
    case "bank_transfer":
      return BankTransferForm;
    default:
      return null;
  }
});
</script>