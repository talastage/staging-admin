<template>
  <v-card class="mx-auto">
    <v-card-title>Deposit</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="handleSubmit" ref="form">
        <v-text-field
          v-model="amount"
          :label="`Amount (${currencySymbol})`"
          type="number"
          :rules="amountRules"
          required
          placeholder="Enter amount"
        ></v-text-field>

        <v-card-title>Select Payment Method</v-card-title>
        <v-row class="mb-3">
          <v-col
            v-for="method in uniquePaymentMethods"
            :key="method.payment_method.id"
            cols="12"
            sm="6"
            md="4"
          >
            <v-card
              :class="[
                'pa-4',
                'cursor-pointer',
                { 'border-primary': isMethodSelected(method) },
              ]"
              elevation="1"
              @click="selectPaymentMethod(method)"
            >
              <div class="d-flex align-center">
                <v-checkbox
                  :model-value="isMethodSelected(method)"
                  @change="() => selectPaymentMethod(method)"
                  class="mr-2"
                />
                <div>
                  <div class="text-subtitle-1">
                    {{ method.payment_method.name }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ method.depositable?.name || "" }}
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <Suspense>
          <PaymentDetailsForm
            v-if="selectedMethod"
            :payment-method-type="selectedMethod.payment_method.type"
            :payment-method-name="selectedMethod.payment_method.name"
            :depositable="selectedMethod.depositable"
            @update:paymentDetails="updatePaymentDetails"
          />
        </Suspense>

        <v-btn
          type="submit"
          color="primary"
          :loading="loading"
          :disabled="!isFormValid"
          block
          class="mt-4"
        >
          Deposit
        </v-btn>
      </v-form>
    </v-card-text>

    <!-- Confirmation Dialog -->
    <TransactionConfirmDialog
      v-model:show="showConfirmDialog"
      :country-id="countryPaymentMethodsStore.selectedCountryId"
      :gateway-id="selectedMethod?.gateway.id"
      :selected-method="selectedMethod"
      transaction-type="deposit"
      :amount="Number(amount)"
      :payment-details="paymentDetails"
      :currency-symbol="currencySymbol"
      @confirm="processDeposit"
    />

    <!-- Status Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      timeout="5000"
      :multi-line="true"
    >
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="white" text @click="showSnackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useNuxtApp } from "#app";
import { useWalletStore } from "@/stores/useWalletStore";
import { useCountryPaymentMethodsStore } from "@/stores/useCountryPaymentMethodsStore";
import { useCurrencyStore } from "@/stores/useCurrencies";
import { useAuthStore } from "@/stores/auth";

// Types
interface PaymentDetails {
  phone_number?: string;
  account_number?: string;
  account_name?: string;
  card_number?: string;
  expiry_date?: string;
  cvv?: string;
}

interface PaymentResponse {
  status: string;
  data: {
    payment_url?: string;
    reference?: string;
    status?: string;
  };
  message?: string;
}

interface PaymentError {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
  message?: string;
}
// Store initialization
const { $axios } = useNuxtApp();
const walletStore = useWalletStore();
const countryPaymentMethodsStore = useCountryPaymentMethodsStore();
const currencyStore = useCurrencyStore();
const authStore = useAuthStore();

const emit = defineEmits(["depositInitiated"]);

// Form state
const amount = ref("");
const selectedMethod = ref(null);
const paymentDetails = ref<PaymentDetails | null>(null);
const loading = ref(false);
const form = ref(null);

// Dialog states
const showConfirmDialog = ref(false);

// Snackbar state
const showSnackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("success");

// Computed properties
const currencySymbol = computed(
  () => currencyStore.selectedCurrency?.symbol || "RWF"
);

const uniquePaymentMethods = computed(() => {
  const methods = new Map();
  countryPaymentMethodsStore.paymentMethods.forEach((method) => {
    const key = method.payment_method.id;
    if (!methods.has(key)) {
      methods.set(key, method);
    }
  });
  return Array.from(methods.values());
});

const amountRules = [
  (v) => !!v || "Amount is required",
  (v) => v > 0 || "Amount must be greater than 0",
];

const isFormValid = computed(() => {
  if (
    !amount.value ||
    parseFloat(amount.value) <= 0 ||
    !selectedMethod.value ||
    !paymentDetails.value
  ) {
    return false;
  }

  const methodType = selectedMethod.value.payment_method.type;
  const details = paymentDetails.value;

  switch (methodType) {
    case "mobile_money":
      return !!details.phone_number;
    case "card":
      return !!details.card_number && !!details.expiry_date && !!details.cvv;
    case "bank_transfer":
      return !!details.account_number && !!details.account_name;
    default:
      return false;
  }
});

// Methods
const isMethodSelected = (method) =>
  selectedMethod.value?.payment_method.id === method.payment_method.id;

const selectPaymentMethod = (method) => {
  selectedMethod.value = method;
  paymentDetails.value = null;
};

const updatePaymentDetails = (details: PaymentDetails) => {
  paymentDetails.value = details;
};

const validatePaymentData = (paymentData: any) => {
  const { payment_method } = paymentData;
  
  switch (payment_method.type) {
    case 'card':
      if (!validateCardDetails(paymentData.card_details)) {
        throw new Error('Invalid card details');
      }
      break;
    case 'bank_transfer':
      if (!validateBankDetails(paymentData.bank_account_details)) {
        throw new Error('Invalid bank account details');
      }
      break;
    case 'mobile_money':
      if (!validateMobileMoneyDetails(paymentData.mobile_money_details)) {
        throw new Error('Invalid mobile money details');
      }
      break;
  }
};

const validateCardDetails = (cardDetails: any) => {
  if (!cardDetails) return false;
  
  const { card_number, expiry_date, cvv } = cardDetails;
  const cleanCardNumber = card_number.replace(/\s/g, '');
  
  if (!/^\d{16}$/.test(cleanCardNumber)) return false;
  if (!/^\d{3,4}$/.test(cvv)) return false;
  
  const [month, year] = expiry_date.split('/');
  const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
  if (expiry < new Date()) return false;
  
  return true;
};

const validateBankDetails = (bankDetails: any) => {
  if (!bankDetails) return false;
  return !!(bankDetails.account_number && bankDetails.account_name && bankDetails.bank_code);
};

const validateMobileMoneyDetails = (mobileDetails: any) => {
  if (!mobileDetails) return false;
  return !!(mobileDetails.phone_number && mobileDetails.provider);
};

const handleSubmit = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (valid && isFormValid.value) {
    showConfirmDialog.value = true;
  } else {
    showError("Please fill in all required fields");
  }
};

const buildDepositData = (fee: number) => {
  const wallet_deposit = {
    user_id: authStore.user?.value?.id,
    wallet_id: walletStore.walletData?.id,
    user_email: authStore.user?.value?.email,
    user_phone: authStore.user?.value?.phone,
    user_country_id: authStore.user?.value?.country_id,
    amount: amount.value,
    fee,
    total_amount: Number(amount.value) + Number(fee),
    status: "pending",
  };

  const baseData = {
    currency: {
      id: currencyStore.selectedCurrency?.id,
      code: currencyStore.selectedCurrency?.code,
      symbol: currencyStore.selectedCurrency?.symbol,
    },
    wallet_deposit,
    payment_gateway: {
      id: selectedMethod.value.gateway.id,
      slug: selectedMethod.value.gateway.slug,
    },
    payment_method: {
      id: selectedMethod.value.payment_method.id,
      name: selectedMethod.value.payment_method.name,
      type: selectedMethod.value.payment_method.type,
    },
  };

  return {
    ...baseData,
    ...getMethodSpecificDetails(),
  };
};

const getMethodSpecificDetails = () => {
  const methodType = selectedMethod.value.payment_method.type;

  switch (methodType) {
    case "mobile_money":
      return {
        mobile_money_details: {
          phone_number: paymentDetails.value.phone_number,
          provider: selectedMethod.value.depositable?.provider_code || "mtn",
        },
        mobile_money_provider: selectedMethod.value.depositable || null,
      };

    case "bank_transfer":
      return {
        bank_account_details: {
          account_name: paymentDetails.value.account_name,
          account_number: paymentDetails.value.account_number,
          bank_code: selectedMethod.value.depositable?.bank_code,
        },
        bank_details: selectedMethod.value.depositable || null,
      };

    case "card":
      return {
        card_details: {
          card_number: paymentDetails.value.card_number?.replace(/\s/g, ''),
          expiry_date: paymentDetails.value.expiry_date,
          cvv: paymentDetails.value.cvv,
        },
      };

    default:
      return {};
  }
};

const processDeposit = async (fee: number) => {
  loading.value = true;
  try {
    const paymentData = buildDepositData(fee);
    validatePaymentData(paymentData);

    const response = await $axios.post<PaymentResponse>(
      `/api/payments/${selectedMethod.value.gateway.slug}/deposit`,
      paymentData
    );

    const { data } = response.data;

    if (data.payment_url) {
      window.location.href = data.payment_url;
    } else {
      showSuccess("Deposit initiated successfully");
      emit("depositInitiated", data);
    }
  } catch (error: PaymentError | any) {
    const errorMessage = error.response?.data?.message 
      || error.message 
      || 'Failed to process deposit';

    if (errorMessage.includes('card_declined')) {
      showError('Your card was declined. Please try another card.');
    } else if (errorMessage.includes('insufficient_funds')) {
      showError('Insufficient funds. Please try another payment method.');
    } else if (errorMessage.includes('expired_card')) {
      showError('This card has expired. Please use a different card.');
    } else {
      showError(errorMessage);
    }
  } finally {
    loading.value = false;
  }
};

const showError = (message: string) => {
  snackbarText.value = message;
  snackbarColor.value = "error";
  showSnackbar.value = true;
};

const showSuccess = (message: string) => {
  snackbarText.value = message;
  snackbarColor.value = "success";
  showSnackbar.value = true;
};

// Initialize data
onMounted(async () => {
  await Promise.all([
    currencyStore.isFetched ? null : currencyStore.fetchCurrencies(),
    countryPaymentMethodsStore.fetchCountryPaymentMethods("deposit"),
    walletStore.fetchWallet(),
  ]);
});
</script>

<style scoped>
.border-primary {
  border: 2px solid var(--v-primary-base) !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
