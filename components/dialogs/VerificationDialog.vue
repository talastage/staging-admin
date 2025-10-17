<template>
  <v-dialog
    :model-value="show"
    @update:model-value="$emit('update:show', $event)"
    persistent
    max-width="500"
  >
    <v-card>
      <v-card-title class="headline"> Verification Required </v-card-title>

      <v-card-text class="pt-4">
        <p class="mb-4">
          Please verify the following to proceed with your withdrawal:
        </p>

        <div
          v-for="type in types"
          :key="type"
          class="verification-section mb-6"
        >
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-subtitle-1"
              >{{ formatType(type) }} Verification</span
            >
            <v-chip :color="isVerified(type) ? 'success' : 'warning'" small>
              {{ isVerified(type) ? "Verified" : "Pending" }}
            </v-chip>
          </div>

          <template v-if="!isVerified(type)">
            <v-text-field
              v-model="verificationCodes[type]"
              :label="'Enter verification code'"
              :rules="codeRules"
              :loading="isVerifying[type]"
              :disabled="isVerifying[type]"
              maxlength="6"
              class="mb-2"
            ></v-text-field>

            <div class="d-flex gap-2">
              <v-btn
                color="primary"
                :loading="isSending[type]"
                :disabled="cooldowns[type] > 0"
                @click="sendCode(type)"
                variant="outlined"
                size="small"
              >
                {{
                  cooldowns[type] > 0
                    ? `Resend in ${cooldowns[type]}s`
                    : "Send Code"
                }}
              </v-btn>

              <v-btn
                color="primary"
                :loading="isVerifying[type]"
                :disabled="
                  !verificationCodes[type] ||
                  verificationCodes[type].length !== 6
                "
                @click="verifyCode(type)"
                size="small"
              >
                Verify
              </v-btn>
            </div>
          </template>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="error"
          @click="handleCancel"
          :disabled="loading"
          variant="text"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="handleComplete"
          :disabled="!allVerified || loading"
        >
          Continue Withdrawal
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Error Snackbar -->
    <v-snackbar v-model="showError" color="error" timeout="3000">
      {{ errorMessage }}
    </v-snackbar>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useNuxtApp } from "#app";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  types: {
    type: Array as () => string[],
    required: true,
  },
  withdrawalId: {
    type: [String, Number],
    required: true,
  },
});

const emit = defineEmits(["update:show", "verified", "cancel"]);

const { $axios } = useNuxtApp();

// State
const verificationCodes = ref<Record<string, string>>({});
const verifiedTypes = ref<string[]>([]);
const cooldowns = ref<Record<string, number>>({});
const isSending = ref<Record<string, boolean>>({});
const isVerifying = ref<Record<string, boolean>>({});
const loading = ref(false);
const showError = ref(false);
const errorMessage = ref("");

// Computed
const allVerified = computed(() =>
  props.types.every((type) => verifiedTypes.value.includes(type))
);

// Rules
const codeRules = [
  (v: string) => !!v || "Verification code is required",
  (v: string) => v.length === 6 || "Code must be 6 digits",
];

// Methods
const formatType = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const isVerified = (type: string) => {
  return verifiedTypes.value.includes(type);
};

const startCooldown = (type: string) => {
  cooldowns.value[type] = 60; // 60 seconds cooldown
  const interval = setInterval(() => {
    if (cooldowns.value[type] > 0) {
      cooldowns.value[type]--;
    } else {
      clearInterval(interval);
    }
  }, 1000);
};

const sendCode = async (type: string) => {
  isSending.value[type] = true;
  try {
    await $axios.post(
      "/api/payments/flutterwave/withdrawal/send-verification",
      {
        type,
        withdrawal_id: props.withdrawalId,
      }
    );

    startCooldown(type);
    showSuccessMessage(`Verification code sent to your ${type}`);
  } catch (error) {
    showErrorMessage(
      error.response?.data?.message ||
        `Failed to send ${type} verification code`
    );
  } finally {
    isSending.value[type] = false;
  }
};

const verifyCode = async (type: string) => {
  if (!verificationCodes.value[type]) {
    showErrorMessage("Please enter verification code");
    return;
  }

  isVerifying.value[type] = true;
  try {
    const response = await $axios.post(
      "/api/payments/flutterwave/withdrawal/verify",
      {
        type,
        code: verificationCodes.value[type],
        withdrawal_id: props.withdrawalId,
      }
    );

    if (response.data.status === "success") {
      verifiedTypes.value.push(type);
      showSuccessMessage(`${formatType(type)} verified successfully`);
    }
  } catch (error) {
    showErrorMessage(
      error.response?.data?.message || "Invalid verification code"
    );
  } finally {
    isVerifying.value[type] = false;
  }
};

const handleComplete = () => {
  if (!allVerified.value) return;
  emit("verified");
};

const handleCancel = () => {
  emit("cancel");
  emit("update:show", false);
};

const showErrorMessage = (message: string) => {
  errorMessage.value = message;
  showError.value = true;
};

const showSuccessMessage = (message: string) => {
  // You might want to add a success snackbar here
  console.log(message);
};

// Reset state when dialog opens
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      verificationCodes.value = {};
      verifiedTypes.value = [];
      props.types.forEach((type) => {
        cooldowns.value[type] = 0;
        isSending.value[type] = false;
        isVerifying.value[type] = false;
      });
    }
  }
);
</script>

<style scoped>
.verification-section {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  padding: 16px;
}

.gap-2 {
  gap: 8px;
}

.v-btn {
  min-width: 100px;
}
</style>
