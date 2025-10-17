<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title :class="titleClass">
        {{ title }}
      </v-card-title>
      <v-card-text class="pt-4">
        <p class="text-body-1">{{ detailedMessage }}</p>
        <template v-if="isWalletLoading">
          <v-skeleton-loader
            v-for="i in 1"
            :key="i"
            type="article"
            class="mb-4"
          ></v-skeleton-loader>
        </template>
        <template v-else-if="wallet">
          <WalletBalance
            v-if="showWalletBalance"
            :walletData="wallet.data"
            class="mt-4"
          />
          <v-alert
            v-if="showBalanceChangeAlert"
            :type="status === 'success' ? 'success' : 'info'"
            class="mt-4"
            border="left"
            elevation="2"
            :icon="balanceChangeIcon"
          >
            {{ balanceChangeMessage }}
          </v-alert>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="buttonColor" @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useWalletStore } from "@/stores/useWalletStore";
import { storeToRefs } from "pinia";
import { useToast } from "vue-toastification";
import { useCurrencyFormatter } from "~/composables/useCurrencyFormatter";

const props = defineProps({
  modelValue: Boolean,
  status: {
    type: String,
    default: "success",
  },
  message: {
    type: String,
    default: "",
  },
  transactionType: {
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

const emit = defineEmits(["update:modelValue"]);

const walletStore = useWalletStore();
const { wallet } = storeToRefs(walletStore);
const toast = useToast();
const { currencyFormatter } = useCurrencyFormatter();

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const isWalletLoading = ref(true);
const previousBalance = ref(null);

const title = computed(() => {
  switch (props.status) {
    case "success":
      return `${capitalizeFirstLetter(props.transactionType)} Successful`;
    case "error":
      return `${capitalizeFirstLetter(props.transactionType)} Failed`;
    case "processing":
      return `${capitalizeFirstLetter(props.transactionType)} Processing`;
    default:
      return "Transaction Status";
  }
});

const detailedMessage = computed(() => {
  const formattedAmount = currencyFormatter(
    props.amount,
    props.currency.symbol,
    props.currency.code
  );
  switch (props.status) {
    case "success":
      switch (props.transactionType) {
        case "deposit":
          return `You have successfully deposited ${formattedAmount} into your wallet.`;
        case "withdrawal":
          return `You have successfully withdrawn ${formattedAmount} from your wallet.`;
        case "transfer":
          return `You have successfully transferred ${formattedAmount}.`;
        default:
          return `Your ${props.transactionType} of ${formattedAmount} was successful.`;
      }
    case "error":
      return `Your ${props.transactionType} of ${formattedAmount} has failed. Please try again or contact support if the issue persists.`;
    case "processing":
      return `Your ${props.transactionType} of ${formattedAmount} is being processed. We'll notify you once it's complete.`;
    default:
      return (
        props.message ||
        `There's an update on your ${props.transactionType} of ${formattedAmount}.`
      );
  }
});

const titleClass = computed(() => {
  switch (props.status) {
    case "success":
      return "text-h5 bg-success text-white";
    case "error":
      return "text-h5 bg-error text-white";
    case "processing":
      return "text-h5 bg-info text-white";
    default:
      return "text-h5 bg-primary text-white";
  }
});

const buttonColor = computed(() => {
  switch (props.status) {
    case "success":
      return "success";
    case "error":
      return "error";
    case "processing":
      return "info";
    default:
      return "primary";
  }
});

const showWalletBalance = computed(() => {
  return props.status === "success" || props.status === "processing";
});
const showBalanceChangeAlert = computed(() => {
  if (!wallet.value || previousBalance.value === null) return false;
  const currentBalance = parseFloat(wallet.value.data.balance);
  const change = currentBalance - previousBalance.value;
  return props.status === "success" && change !== 0;
});

const balanceChangeMessage = computed(() => {
  if (!wallet.value || previousBalance.value === null) return "";
  const currentBalance = parseFloat(wallet.value.data.balance);
  const change = currentBalance - previousBalance.value;
  if (change === 0) return ""; // Return empty string if no change
  const formattedChange = currencyFormatter(
    Math.abs(change),
    props.currency.symbol,
    props.currency.code
  );
  if (change > 0) {
    return `Your wallet balance has increased by ${formattedChange}.`;
  } else if (change < 0) {
    return `Your wallet balance has decreased by ${formattedChange}.`;
  }
});

const balanceChangeIcon = computed(() => {
  if (!wallet.value || previousBalance.value === null) return "mdi-information";
  const currentBalance = parseFloat(wallet.value.data.balance);
  const change = currentBalance - previousBalance.value;
  if (change > 0) return "mdi-arrow-up-bold";
  if (change < 0) return "mdi-arrow-down-bold";
  return "mdi-equal";
});

const closeDialog = () => {
  dialog.value = false;
};

const fetchWalletData = async () => {
  isWalletLoading.value = true;
  try {
    if (wallet.value) {
      previousBalance.value = parseFloat(wallet.value.data.balance);
    }
    await walletStore.fetchWallet();
  } catch (error) {
    console.error("Error fetching wallet information:", error);
    toast.error("Unable to load wallet information. Please try again later.");
  } finally {
    isWalletLoading.value = false;
  }
};

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

watch(dialog, async (newValue) => {
  if (newValue) {
    await fetchWalletData();
  } else {
    previousBalance.value = null;
  }
});

onMounted(async () => {
  if (dialog.value) {
    await fetchWalletData();
  }
});
</script>
