<template>
  <v-form @submit.prevent="verifyWallet">
    <v-text-field
      v-model="universalCode"
      label="Receiver's Universal Code"
      :error-messages="errorMessage"
      :disabled="loading"
      placeholder="e.g., 2509999999999"
      required
    />
    <v-btn
      type="submit"
      color="primary"
      :loading="loading"
      :disabled="!isValidFormat"
      block
    >
      Find Wallet
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useWalletStore } from "@/stores/useWalletStore";

const emit = defineEmits<{
  (e: "wallet-verified", data: { user: User; universalCode: string }): void;
}>();

const walletStore = useWalletStore();

const universalCode = ref("");
const loading = ref(false);
const errorMessage = ref("");

const isValidFormat = computed(() => {
  const regex = /^\d{13}$/;
  return regex.test(universalCode.value);
});

const verifyWallet = async () => {
  if (!isValidFormat.value) {
    errorMessage.value =
      "Invalid Universal Code format. Please use a 13-digit number.";
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    const result = await walletStore.verifyWallet(universalCode.value);
    emit("wallet-verified", {
      user: result.user,
      universalCode: universalCode.value,
    });
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message ||
      "Failed to verify wallet. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>
