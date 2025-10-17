<template>
    <v-form @submit.prevent="resetPassword">
      <v-text-field
        v-model="email"
        label="Email"
        type="email"
        required
        :rules="[v => !!v || 'Email is required']"
      ></v-text-field>
      <v-text-field
        v-model="password"
        label="New Password"
        type="password"
        required
        :rules="[v => !!v || 'Password is required']"
      ></v-text-field>
      <v-text-field
        v-model="passwordConfirmation"
        label="Confirm New Password"
        type="password"
        required
        :rules="[
          v => !!v || 'Password confirmation is required',
          v => v === password || 'Passwords must match'
        ]"
      ></v-text-field>
      <v-btn type="submit" color="primary" block :loading="isLoading">
        Reset Password
      </v-btn>
      <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
      <v-alert v-if="message" type="success" class="mt-4">{{ message }}</v-alert>
    </v-form>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useAuthStore } from '~/stores/auth';
  import { useRoute, useRouter } from 'vue-router';
  
  const authStore = useAuthStore();
  const route = useRoute();
  const router = useRouter();
  
  const email = ref('');
  const password = ref('');
  const passwordConfirmation = ref('');
  const isLoading = ref(false);
  const error = ref('');
  const message = ref('');
  
  const resetPassword = async () => {
    if (password.value !== passwordConfirmation.value) {
      error.value = 'Passwords do not match';
      return;
    }
  
    isLoading.value = true;
    error.value = '';
    message.value = '';
  
    try {
      await authStore.resetPassword(email.value, password.value, route.query.token);
      message.value = 'Password has been reset successfully';
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      error.value = 'Failed to reset password. Please try again.';
    } finally {
      isLoading.value = false;
    }
  };
  </script>