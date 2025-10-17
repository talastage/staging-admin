<template>
  <v-form @submit.prevent="verifyEmail">
    <v-text-field
      v-model="email"
      label="Email"
      type="email"
      required
      :disabled="codeSent"
    />
    <v-text-field
      v-if="codeSent"
      v-model="code"
      label="Verification Code"
      required
    />
    <v-btn
      type="submit"
      color="primary"
      block
      class="mt-4"
      :loading="isLoading"
      :disabled="isLoading"
    >
      {{ codeSent ? "Verify Email" : "Send Verification Code" }}
    </v-btn>
    <v-btn
      v-if="codeSent"
      text
      block
      class="mt-2"
      @click="resendCode"
      :disabled="isLoading"
    >
      Resend Code
    </v-btn>
    <v-alert v-if="message" :type="messageType" class="mt-4">
      {{ message }}
    </v-alert>
  </v-form>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();
const email = ref("");
const code = ref("");
const codeSent = ref(false);
const isLoading = ref(false);
const message = ref("");
const messageType = ref("info");

const sendVerificationCode = async () => {
  isLoading.value = true;
  try {
    await authStore.sendVerificationEmail(email.value);
    codeSent.value = true;
    message.value = "Verification code sent successfully";
    messageType.value = "success";
  } catch (error) {
    message.value = "Failed to send verification code";
    messageType.value = "error";
  } finally {
    isLoading.value = false;
  }
};

const verifyEmail = async () => {
  if (!codeSent.value) {
    await sendVerificationCode();
    return;
  }

  isLoading.value = true;
  try {
    await authStore.verifyEmail(email.value, code.value);
    message.value = "Email verified successfully";
    messageType.value = "success";
  } catch (error) {
    message.value = "Failed to verify email";
    messageType.value = "error";
  } finally {
    isLoading.value = false;
  }
};

const resendCode = async () => {
  codeSent.value = false;
  await sendVerificationCode();
};
</script>
