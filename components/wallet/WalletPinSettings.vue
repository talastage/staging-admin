<template>
    <div class="wallet-pin-settings">
      <!-- Current PIN Section -->
      <v-card variant="outlined" class="mb-6">
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-lock" class="mr-2" />
          Current PIN
        </v-card-title>
        <v-card-text>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Your wallet PIN is used to access your wallet and authorize transactions. 
            Keep it secure and never share it with anyone.
          </p>
  
          <!-- Current PIN Display -->
          <v-text-field
            v-model="maskedPin"
            label="Current PIN"
            readonly
            variant="outlined"
            :append-inner-icon="showPin ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="verifyToShowPin"
            placeholder="●●●●●●"
            density="comfortable"
          />
        </v-card-text>
      </v-card>
  
      <!-- Change PIN Section -->
      <v-expansion-panels>
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <v-icon icon="mdi-lock-reset" class="mr-2" />
              Change PIN
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-form @submit.prevent="handlePinUpdate" ref="pinForm">
              <!-- Verify Current PIN -->
              <v-text-field
                v-model="currentPin"
                label="Verify Current PIN"
                :type="showCurrentPin ? 'text' : 'password'"
                :rules="[(v) => !!v || 'Current PIN is required']"
                maxlength="6"
                class="mb-4"
                variant="outlined"
                :append-inner-icon="showCurrentPin ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showCurrentPin = !showCurrentPin"
                placeholder="●●●●●●"
                density="comfortable"
              />
  
              <!-- New PIN -->
              <v-text-field
                v-model="newPin"
                label="New PIN"
                :type="showNewPin ? 'text' : 'password'"
                :rules="pinRules"
                maxlength="6"
                class="mb-4"
                variant="outlined"
                :append-inner-icon="showNewPin ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showNewPin = !showNewPin"
                placeholder="●●●●●●"
                density="comfortable"
              />
  
              <!-- Confirm PIN -->
              <v-text-field
                v-model="confirmPin"
                label="Confirm New PIN"
                :type="showConfirmPin ? 'text' : 'password'"
                :rules="confirmPinRules"
                maxlength="6"
                variant="outlined"
                :append-inner-icon="showConfirmPin ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showConfirmPin = !showConfirmPin"
                placeholder="●●●●●●"
                density="comfortable"
              />
  
              <div class="d-flex justify-end mt-4">
                <v-btn
                  color="primary"
                  :loading="pinStore.isResetting"
                  :disabled="!isValidForm"
                  type="submit"
                  prepend-icon="mdi-lock-reset"
                >
                  Update PIN
                </v-btn>
              </div>
            </v-form>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
  
      <!-- Forgot PIN Section -->
      <v-btn
        variant="text"
        color="primary"
        class="mt-4"
        block
        @click="handleForgotPin"
        :loading="pinStore.isRequestingNew"
        prepend-icon="mdi-lock-question"
      >
        Forgot PIN?
      </v-btn>
  
      <!-- Alerts -->
      <v-alert
        v-if="pinStore.error"
        type="error"
        variant="tonal"
        class="mt-6"
        density="comfortable"
        border="start"
      >
        {{ pinStore.error }}
      </v-alert>
  
      <v-alert
        v-if="successMessage"
        type="success"
        variant="tonal"
        class="mt-6"
        density="comfortable"
        border="start"
      >
        {{ successMessage }}
      </v-alert>
  
      <!-- PIN Verification Dialog -->
      <v-dialog v-model="showVerifyDialog" max-width="400">
        <v-card>
          <v-card-title>Verify PIN</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="verificationPin"
              label="Enter your PIN"
              type="password"
              variant="outlined"
              maxlength="6"
              placeholder="●●●●●●"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="grey" variant="text" @click="showVerifyDialog = false">
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              @click="verifyPinForDisplay"
              :loading="verifying"
            >
              Verify
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useWalletPinStore } from "~/stores/wallet/useWalletPinStore";
import { useWalletStore } from "~/stores/useWalletStore";

const pinStore = useWalletPinStore();
const walletStore = useWalletStore();

// Form refs
const pinForm = ref<any>(null);

// Form state
const currentPin = ref("");
const newPin = ref("");
const confirmPin = ref("");
const successMessage = ref("");
const isRequestingPin = ref(false);

// Visibility toggles
const showCurrentPin = ref(false);
const showNewPin = ref(false);
const showConfirmPin = ref(false);

// Rules
const pinRules = [
  (v: string) => !!v || "New PIN is required",
  (v: string) => v.length === 6 || "PIN must be 6 digits",
  (v: string) => v !== currentPin.value || "New PIN must be different",
];

const confirmPinRules = [
  (v: string) => !!v || "Please confirm your PIN",
  (v: string) => v === newPin.value || "PINs do not match",
];

// Computed
const isValidForm = computed(() => {
  return (
    currentPin.value &&
    newPin.value &&
    confirmPin.value &&
    newPin.value === confirmPin.value &&
    newPin.value !== currentPin.value &&
    newPin.value.length === 6
  );
});

// Methods
const handleRequestNewPin = async () => {
  isRequestingPin.value = true;
  try {
    const result = await pinStore.requestNewPin();
    successMessage.value = `New PIN has been sent to your email: ${result.email}`;
  } finally {
    isRequestingPin.value = false;
  }
};

const handlePinUpdate = async () => {
  if (!isValidForm.value || !pinForm.value) return;

  try {
    // First verify current PIN
    const verifyResponse = await pinStore.verifyPin(currentPin.value);

    if (!verifyResponse.authorized) {
      return;
    }

    // Then update to new PIN
    await pinStore.resetPin({
      current_security_pin: currentPin.value,
      new_security_pin: newPin.value,
    });

    // Reset form
    resetForm();
    successMessage.value = "PIN updated successfully";

    // Refresh wallet data
    await walletStore.fetchWallet();
  } catch (error) {
    console.error("Failed to update PIN:", error);
  }
};

const resetForm = () => {
  currentPin.value = "";
  newPin.value = "";
  confirmPin.value = "";
  showCurrentPin.value = false;
  showNewPin.value = false;
  showConfirmPin.value = false;
  if (pinForm.value) {
    pinForm.value.reset();
  }
};
</script>
